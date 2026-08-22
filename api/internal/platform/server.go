package platform

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"runtime/debug"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Config struct {
	AppOrigin    string
	CookieSecure bool
	SessionTTL   time.Duration
}

func ConfigFromEnv() Config {
	ttl, err := time.ParseDuration(valueOrDefault("SESSION_TTL", "24h"))
	if err != nil || ttl <= 0 {
		ttl = 24 * time.Hour
	}
	return Config{
		AppOrigin:    valueOrDefault("APP_ORIGIN", "http://localhost:5173"),
		CookieSecure: strings.EqualFold(os.Getenv("COOKIE_SECURE"), "true"),
		SessionTTL:   ttl,
	}
}

func valueOrDefault(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

type Server struct {
	db     *pgxpool.Pool
	logger *slog.Logger
	config Config
	limits *ipLimiter
}

func NewServer(db *pgxpool.Pool, logger *slog.Logger, config Config) *Server {
	return &Server{db: db, logger: logger, config: config, limits: newIPLimiter()}
}

func (s *Server) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(s.recoverer)
	r.Use(s.securityHeaders)
	r.Use(middleware.Compress(5))
	r.Use(middleware.Timeout(30 * time.Second))
	r.Get("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		writeData(w, http.StatusOK, map[string]string{"status": "ok"}, nil)
	})
	r.Get("/readyz", s.ready)
	r.Route("/api/v1", func(api chi.Router) {
		api.Use(s.requireOrigin)
		api.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
			writeData(w, http.StatusOK, map[string]string{"service": "propflow-api"}, nil)
		})
		api.Get("/listings", s.listListings)
		api.Get("/listings/{slug}", s.getListingBySlug)
		api.With(s.rateLimit("auth", 10, time.Minute)).Post("/auth/register", s.register)
		api.With(s.rateLimit("auth", 10, time.Minute)).Post("/auth/login", s.login)
		api.Group(func(protected chi.Router) {
			protected.Use(s.authenticate)
			protected.Post("/auth/logout", s.logout)
			protected.Get("/me", s.me)
			protected.With(requireRole("renter"), s.rateLimit("inquiry", 20, time.Hour)).Post("/listings/{listingId}/inquiries", s.createInquiry)
			protected.With(requireRole("renter")).Get("/renter/inquiries", s.renterInquiries)
			protected.Get("/tenancies", s.listTenancies)
			protected.Get("/tenancies/{tenancyId}", s.getTenancy)
			protected.Get("/payments", s.listPayments)
			protected.Get("/tenancies/{tenancyId}/payments", s.tenancyPayments)
			protected.Group(func(landlord chi.Router) {
				landlord.Use(requireRole("landlord"))
				landlord.Get("/properties", s.listProperties)
				landlord.Post("/properties", s.createProperty)
				landlord.Get("/properties/{propertyId}", s.getProperty)
				landlord.Patch("/properties/{propertyId}", s.updateProperty)
				landlord.Delete("/properties/{propertyId}", s.deleteProperty)
				landlord.Get("/properties/{propertyId}/units", s.listUnits)
				landlord.Post("/properties/{propertyId}/units", s.createUnit)
				landlord.Patch("/units/{unitId}", s.updateUnit)
				landlord.Delete("/units/{unitId}", s.deleteUnit)
				landlord.Post("/units/{unitId}/listing", s.createListing)
				landlord.Patch("/listings/{listingId}", s.updateListing)
				landlord.Post("/listings/{listingId}/publish", s.publishListing)
				landlord.Post("/listings/{listingId}/unpublish", s.unpublishListing)
				landlord.Get("/landlord/inquiries", s.landlordInquiries)
				landlord.Patch("/inquiries/{inquiryId}/status", s.updateInquiryStatus)
				landlord.Get("/tenancy-options", s.tenancyOptions)
				landlord.Post("/tenancies", s.createTenancy)
				landlord.Post("/payments", s.createPayment)
			})
		})
	})
	return r
}

func (s *Server) ready(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := s.db.Ping(ctx); err != nil {
		writeError(w, r, http.StatusServiceUnavailable, "not_ready", "Database is not ready.", nil)
		return
	}
	writeData(w, http.StatusOK, map[string]string{"status": "ready"}, nil)
}

func (s *Server) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}

func (s *Server) recoverer(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				s.logger.Error("panic recovered", "request_id", middleware.GetReqID(r.Context()), "panic", recovered, "stack", string(debug.Stack()))
				writeError(w, r, http.StatusInternalServerError, "internal_error", "An unexpected error occurred.", nil)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

type envelope struct {
	Data any `json:"data"`
	Meta any `json:"meta,omitempty"`
}

type errorBody struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code      string            `json:"code"`
	Message   string            `json:"message"`
	Fields    map[string]string `json:"fields,omitempty"`
	RequestID string            `json:"request_id"`
}

func writeData(w http.ResponseWriter, status int, data, meta any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(envelope{Data: data, Meta: meta})
}

func writeError(w http.ResponseWriter, r *http.Request, status int, code, message string, fields map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(errorBody{Error: apiError{
		Code: code, Message: message, Fields: fields, RequestID: middleware.GetReqID(r.Context()),
	}})
}

func parseUUIDParam(w http.ResponseWriter, r *http.Request, name string) (uuid.UUID, bool) {
	id, err := uuid.Parse(chi.URLParam(r, name))
	if err != nil {
		writeError(w, r, http.StatusBadRequest, "validation_error", "The resource identifier is invalid.", map[string]string{name: "Must be a UUID."})
		return uuid.Nil, false
	}
	return id, true
}
