package platform

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"golang.org/x/crypto/argon2"
)

const sessionCookieName = "propflow_session"

type actorContextKey struct{}

type Actor struct {
	ID             uuid.UUID  `json:"id"`
	Email          string     `json:"email"`
	FullName       string     `json:"full_name"`
	Phone          string     `json:"phone"`
	Role           string     `json:"role"`
	OrganizationID *uuid.UUID `json:"organization_id,omitempty"`
}

type registerInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
	Role     string `json:"role"`
}

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	var input registerInput
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.FullName = strings.TrimSpace(input.FullName)
	input.Phone = strings.TrimSpace(input.Phone)
	input.Role = strings.ToLower(strings.TrimSpace(input.Role))
	fields := validateRegistration(input)
	if len(fields) > 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please correct the highlighted fields.", fields)
		return
	}

	hash, err := HashPassword(input.Password)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the account.", nil)
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the account.", nil)
		return
	}
	defer tx.Rollback(r.Context())

	var actor Actor
	err = tx.QueryRow(r.Context(), `
		INSERT INTO users (email, password_hash, full_name, phone, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, email, full_name, phone, role`, input.Email, hash, input.FullName, input.Phone, input.Role).
		Scan(&actor.ID, &actor.Email, &actor.FullName, &actor.Phone, &actor.Role)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			writeError(w, r, http.StatusConflict, "email_exists", "An account with this email already exists.", map[string]string{"email": "Email is already registered."})
			return
		}
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the account.", nil)
		return
	}

	if input.Role == "landlord" {
		var organizationID uuid.UUID
		organizationName := input.FullName + " Properties"
		if err := tx.QueryRow(r.Context(), `INSERT INTO organizations (name) VALUES ($1) RETURNING id`, organizationName).Scan(&organizationID); err != nil {
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the landlord workspace.", nil)
			return
		}
		if _, err := tx.Exec(r.Context(), `INSERT INTO organization_members (organization_id, user_id, role) VALUES ($1, $2, 'owner')`, organizationID, actor.ID); err != nil {
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the landlord workspace.", nil)
			return
		}
		actor.OrganizationID = &organizationID
	}
	if err := tx.Commit(r.Context()); err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the account.", nil)
		return
	}

	if err := s.issueSession(w, r, actor.ID); err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Account created, but sign-in failed. Please sign in.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "auth.register", "user", actor.ID, map[string]any{"role": actor.Role})
	writeData(w, http.StatusCreated, actor, nil)
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	var input loginInput
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	if input.Email == "" || input.Password == "" {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Email and password are required.", nil)
		return
	}
	var actor Actor
	var hash, status string
	err := s.db.QueryRow(r.Context(), `
		SELECT u.id, u.email, u.full_name, u.phone, u.role, u.password_hash, u.status, om.organization_id
		FROM users u
		LEFT JOIN organization_members om ON om.user_id = u.id
		WHERE u.email = $1`, input.Email).
		Scan(&actor.ID, &actor.Email, &actor.FullName, &actor.Phone, &actor.Role, &hash, &status, &actor.OrganizationID)
	if err != nil || status != "active" || !VerifyPassword(input.Password, hash) {
		writeError(w, r, http.StatusUnauthorized, "invalid_credentials", "Email or password is incorrect.", nil)
		return
	}
	if err := s.issueSession(w, r, actor.ID); err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to sign in.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "auth.login", "session", uuid.Nil, nil)
	writeData(w, http.StatusOK, actor, nil)
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	if cookie, err := r.Cookie(sessionCookieName); err == nil {
		tokenHash := sha256.Sum256([]byte(cookie.Value))
		_, _ = s.db.Exec(r.Context(), `UPDATE sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`, tokenHash[:])
	}
	s.clearSessionCookie(w)
	if actor != nil {
		s.audit(r, actor.ID, actor.OrganizationID, "auth.logout", "session", uuid.Nil, nil)
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	writeData(w, http.StatusOK, actor, nil)
}

func (s *Server) issueSession(w http.ResponseWriter, r *http.Request, userID uuid.UUID) error {
	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		return err
	}
	raw := base64.RawURLEncoding.EncodeToString(token)
	tokenHash := sha256.Sum256([]byte(raw))
	expiresAt := time.Now().Add(s.config.SessionTTL)
	if _, err := s.db.Exec(r.Context(), `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`, userID, tokenHash[:], expiresAt); err != nil {
		return err
	}
	http.SetCookie(w, &http.Cookie{
		Name: sessionCookieName, Value: raw, Path: "/", Expires: expiresAt, MaxAge: int(s.config.SessionTTL.Seconds()),
		HttpOnly: true, Secure: s.config.CookieSecure, SameSite: http.SameSiteLaxMode,
	})
	return nil
}

func (s *Server) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name: sessionCookieName, Value: "", Path: "/", Expires: time.Unix(1, 0), MaxAge: -1,
		HttpOnly: true, Secure: s.config.CookieSecure, SameSite: http.SameSiteLaxMode,
	})
}

func (s *Server) authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(sessionCookieName)
		if err != nil || cookie.Value == "" {
			writeError(w, r, http.StatusUnauthorized, "authentication_required", "Please sign in to continue.", nil)
			return
		}
		tokenHash := sha256.Sum256([]byte(cookie.Value))
		var actor Actor
		err = s.db.QueryRow(r.Context(), `
			SELECT u.id, u.email, u.full_name, u.phone, u.role, om.organization_id
			FROM sessions s
			JOIN users u ON u.id = s.user_id AND u.status = 'active'
			LEFT JOIN organization_members om ON om.user_id = u.id
			WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`, tokenHash[:]).
			Scan(&actor.ID, &actor.Email, &actor.FullName, &actor.Phone, &actor.Role, &actor.OrganizationID)
		if err != nil {
			s.clearSessionCookie(w)
			writeError(w, r, http.StatusUnauthorized, "session_expired", "Your session has expired. Please sign in again.", nil)
			return
		}
		_, _ = s.db.Exec(r.Context(), `UPDATE sessions SET last_used_at = now() WHERE token_hash = $1`, tokenHash[:])
		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), actorContextKey{}, &actor)))
	})
}

func requireRole(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]bool, len(roles))
	for _, role := range roles {
		allowed[role] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			actor := actorFromContext(r.Context())
			if actor == nil || !allowed[actor.Role] {
				writeError(w, r, http.StatusForbidden, "permission_denied", "You do not have permission to perform this action.", nil)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (s *Server) requireOrigin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
			next.ServeHTTP(w, r)
			return
		}
		if !s.config.allowsOrigin(r.Header.Get("Origin")) {
			writeError(w, r, http.StatusForbidden, "invalid_origin", "The request origin is not allowed.", nil)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func actorFromContext(ctx context.Context) *Actor {
	actor, _ := ctx.Value(actorContextKey{}).(*Actor)
	return actor
}

func validateRegistration(input registerInput) map[string]string {
	fields := map[string]string{}
	if address, err := mail.ParseAddress(input.Email); err != nil || address.Address != input.Email {
		fields["email"] = "Enter a valid email address."
	}
	if len(input.Password) < 10 {
		fields["password"] = "Use at least 10 characters."
	}
	if len(input.FullName) < 2 || len(input.FullName) > 120 {
		fields["full_name"] = "Enter a name between 2 and 120 characters."
	}
	if input.Role != "landlord" && input.Role != "renter" {
		fields["role"] = "Choose landlord or renter."
	}
	return fields
}

func HashPassword(password string) (string, error) {
	const memory uint32 = 64 * 1024
	const iterations uint32 = 3
	const parallelism uint8 = 2
	const saltLength uint32 = 16
	const keyLength uint32 = 32
	salt := make([]byte, saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	hash := argon2.IDKey([]byte(password), salt, iterations, memory, parallelism, keyLength)
	return fmt.Sprintf("$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s", memory, iterations, parallelism,
		base64.RawStdEncoding.EncodeToString(salt), base64.RawStdEncoding.EncodeToString(hash)), nil
}

func VerifyPassword(password, encoded string) bool {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 || parts[1] != "argon2id" || parts[2] != "v=19" {
		return false
	}
	var memory uint32
	var iterations uint32
	var parallelism uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism); err != nil {
		return false
	}
	if memory > 128*1024 || iterations > 10 || parallelism > 8 {
		return false
	}
	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil || len(salt) < 16 {
		return false
	}
	expected, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil || len(expected) != 32 {
		return false
	}
	actual := argon2.IDKey([]byte(password), salt, iterations, memory, parallelism, uint32(len(expected)))
	return subtle.ConstantTimeCompare(actual, expected) == 1
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		writeError(w, r, http.StatusBadRequest, "invalid_json", "The request body is invalid.", nil)
		return false
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		writeError(w, r, http.StatusBadRequest, "invalid_json", "The request body must contain one JSON object.", nil)
		return false
	}
	return true
}

func (s *Server) audit(r *http.Request, actorID uuid.UUID, organizationID *uuid.UUID, action, resourceType string, resourceID uuid.UUID, metadata map[string]any) {
	if metadata == nil {
		metadata = map[string]any{}
	}
	_, err := s.db.Exec(r.Context(), `
		INSERT INTO audit_logs (actor_user_id, organization_id, action, resource_type, resource_id, metadata, ip_address, user_agent, request_id)
		VALUES ($1, $2, $3, $4, NULLIF($5::uuid, $6::uuid), $7, NULLIF($8, '')::inet, $9, $10)`,
		actorID, organizationID, action, resourceType, resourceID, uuid.Nil, metadata, remoteIP(r), r.UserAgent(), middleware.GetReqID(r.Context()))
	if err != nil {
		s.logger.Error("write audit event", "action", action, "request_id", middleware.GetReqID(r.Context()), "error", err)
	}
}

func remoteIP(r *http.Request) string {
	host := strings.TrimSpace(strings.Split(r.RemoteAddr, ":")[0])
	return host
}

func isNotFound(err error) bool { return errors.Is(err, pgx.ErrNoRows) }

func parsePositiveInt(value string, fallback, maximum int) int {
	number, err := strconv.Atoi(value)
	if err != nil || number < 1 {
		return fallback
	}
	if number > maximum {
		return maximum
	}
	return number
}
