package platform

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Payment struct {
	ID           uuid.UUID `json:"id"`
	TenancyID    uuid.UUID `json:"tenancy_id"`
	Amount       float64   `json:"amount"`
	Method       string    `json:"method"`
	Reference    string    `json:"reference"`
	Status       string    `json:"status"`
	PaidAt       time.Time `json:"paid_at"`
	PropertyName string    `json:"property_name"`
	UnitLabel    string    `json:"unit_label"`
	TenantName   string    `json:"tenant_name"`
}

type paymentInput struct {
	TenancyID uuid.UUID `json:"tenancy_id"`
	Amount    float64   `json:"amount"`
	Method    string    `json:"method"`
	Reference string    `json:"reference"`
	PaidAt    string    `json:"paid_at"`
	Status    string    `json:"status"`
}

func (s *Server) listPayments(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	condition := "t.tenant_id=$1"
	var scope any = actor.ID
	if actor.Role == "landlord" {
		condition = "t.organization_id=$1"
		scope = actor.OrganizationID
	}
	items, err := s.queryPayments(r, condition, scope)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load payments.", nil)
		return
	}
	writeData(w, http.StatusOK, items, nil)
}

func (s *Server) tenancyPayments(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "tenancyId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	condition := "t.id=$1 AND t.tenant_id=$2"
	var scope any = actor.ID
	if actor.Role == "landlord" {
		condition = "t.id=$1 AND t.organization_id=$2"
		scope = actor.OrganizationID
	}
	items, err := s.queryPayments(r, condition, id, scope)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load payments.", nil)
		return
	}
	writeData(w, http.StatusOK, items, nil)
}

func (s *Server) createPayment(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	var input paymentInput
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Method = strings.TrimSpace(input.Method)
	input.Reference = strings.TrimSpace(input.Reference)
	if input.Status == "" {
		input.Status = "recorded"
	}
	methods := map[string]bool{"cash": true, "bank": true, "mpesa_demo": true}
	if input.TenancyID == uuid.Nil || input.Amount <= 0 || !methods[input.Method] || input.Reference == "" || input.Status != "recorded" {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Enter a tenancy, positive amount, method, and unique reference.", nil)
		return
	}
	paidAt, err := time.Parse("2006-01-02", input.PaidAt)
	if err != nil {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Enter a valid payment date.", map[string]string{"paid_at": "Use YYYY-MM-DD."})
		return
	}
	var id uuid.UUID
	err = s.db.QueryRow(r.Context(), `INSERT INTO payments(tenancy_id,amount,method,reference,status,paid_at,recorded_by) SELECT t.id,$1,$2,$3,'recorded',$4,$5 FROM tenancies t WHERE t.id=$6 AND t.organization_id=$7 RETURNING id`, input.Amount, input.Method, input.Reference, paidAt, actor.ID, input.TenancyID, actor.OrganizationID).Scan(&id)
	if err != nil {
		writeError(w, r, http.StatusConflict, "payment_conflict", "The tenancy is unavailable or the reference already exists.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "payment.record", "payment", id, map[string]any{"tenancy_id": input.TenancyID, "amount": input.Amount, "method": input.Method})
	writeData(w, http.StatusCreated, map[string]uuid.UUID{"id": id}, nil)
}

func (s *Server) queryPayments(r *http.Request, condition string, args ...any) ([]Payment, error) {
	rows, err := s.db.Query(r.Context(), `SELECT pay.id,pay.tenancy_id,pay.amount::float8,pay.method,pay.reference,pay.status,pay.paid_at,p.name,u.unit_label,tenant.full_name FROM payments pay JOIN tenancies t ON t.id=pay.tenancy_id JOIN properties p ON p.id=t.property_id JOIN units u ON u.id=t.unit_id JOIN users tenant ON tenant.id=t.tenant_id WHERE `+condition+` ORDER BY pay.paid_at DESC`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Payment{}
	for rows.Next() {
		var item Payment
		if err := rows.Scan(&item.ID, &item.TenancyID, &item.Amount, &item.Method, &item.Reference, &item.Status, &item.PaidAt, &item.PropertyName, &item.UnitLabel, &item.TenantName); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
