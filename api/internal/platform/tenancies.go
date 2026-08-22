package platform

import (
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Tenancy struct {
	ID            uuid.UUID  `json:"id"`
	PropertyID    uuid.UUID  `json:"property_id"`
	UnitID        uuid.UUID  `json:"unit_id"`
	TenantID      uuid.UUID  `json:"tenant_id"`
	PropertyName  string     `json:"property_name"`
	UnitLabel     string     `json:"unit_label"`
	TenantName    string     `json:"tenant_name"`
	TenantEmail   string     `json:"tenant_email"`
	StartDate     time.Time  `json:"start_date"`
	EndDate       *time.Time `json:"end_date,omitempty"`
	MonthlyRent   float64    `json:"monthly_rent"`
	DepositAmount float64    `json:"deposit_amount"`
	Status        string     `json:"status"`
}

type tenancyInput struct {
	UnitID        uuid.UUID  `json:"unit_id"`
	TenantID      uuid.UUID  `json:"tenant_id"`
	InquiryID     *uuid.UUID `json:"inquiry_id"`
	StartDate     string     `json:"start_date"`
	EndDate       string     `json:"end_date"`
	MonthlyRent   float64    `json:"monthly_rent"`
	DepositAmount float64    `json:"deposit_amount"`
}

func (s *Server) listTenancies(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	condition := "t.tenant_id=$1"
	var scope any = actor.ID
	if actor.Role == "landlord" {
		condition = "t.organization_id=$1"
		scope = actor.OrganizationID
	}
	rows, err := s.db.Query(r.Context(), `SELECT t.id,t.property_id,t.unit_id,t.tenant_id,p.name,u.unit_label,tenant.full_name,tenant.email,t.start_date,t.end_date,t.monthly_rent::float8,t.deposit_amount::float8,t.status FROM tenancies t JOIN properties p ON p.id=t.property_id JOIN units u ON u.id=t.unit_id JOIN users tenant ON tenant.id=t.tenant_id WHERE `+condition+` ORDER BY t.created_at DESC`, scope)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load tenancies.", nil)
		return
	}
	defer rows.Close()
	items := []Tenancy{}
	for rows.Next() {
		var item Tenancy
		if err := rows.Scan(&item.ID, &item.PropertyID, &item.UnitID, &item.TenantID, &item.PropertyName, &item.UnitLabel, &item.TenantName, &item.TenantEmail, &item.StartDate, &item.EndDate, &item.MonthlyRent, &item.DepositAmount, &item.Status); err != nil {
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load tenancies.", nil)
			return
		}
		items = append(items, item)
	}
	writeData(w, http.StatusOK, items, nil)
}

func (s *Server) tenancyOptions(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	unitRows, err := s.db.Query(r.Context(), `SELECT u.id,p.name,u.unit_label,u.rent_amount::float8,u.deposit_amount::float8 FROM units u JOIN properties p ON p.id=u.property_id WHERE p.organization_id=$1 AND u.availability_status='available' ORDER BY p.name,u.unit_label`, actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load tenancy options.", nil)
		return
	}
	defer unitRows.Close()
	units := []map[string]any{}
	for unitRows.Next() {
		var id uuid.UUID
		var property, label string
		var rent, deposit float64
		if err := unitRows.Scan(&id, &property, &label, &rent, &deposit); err != nil {
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load tenancy options.", nil)
			return
		}
		units = append(units, map[string]any{"id": id, "property_name": property, "unit_label": label, "rent_amount": rent, "deposit_amount": deposit})
	}
	tenantRows, err := s.db.Query(r.Context(), `SELECT id,full_name,email FROM users WHERE role='renter' AND status='active' ORDER BY full_name`)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load renters.", nil)
		return
	}
	defer tenantRows.Close()
	tenants := []map[string]any{}
	for tenantRows.Next() {
		var id uuid.UUID
		var name, email string
		if err := tenantRows.Scan(&id, &name, &email); err != nil {
			return
		}
		tenants = append(tenants, map[string]any{"id": id, "full_name": name, "email": email})
	}
	writeData(w, http.StatusOK, map[string]any{"units": units, "tenants": tenants}, nil)
}

func (s *Server) createTenancy(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	var input tenancyInput
	if !decodeJSON(w, r, &input) {
		return
	}
	start, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Enter a valid start date.", map[string]string{"start_date": "Use YYYY-MM-DD."})
		return
	}
	var end *time.Time
	if input.EndDate != "" {
		parsed, err := time.Parse("2006-01-02", input.EndDate)
		if err != nil || !parsed.After(start) {
			writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "End date must be after the start date.", map[string]string{"end_date": "Choose a later date."})
			return
		}
		end = &parsed
	}
	if input.UnitID == uuid.Nil || input.TenantID == uuid.Nil || input.MonthlyRent < 0 || input.DepositAmount < 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Choose a unit and renter and enter non-negative amounts.", nil)
		return
	}
	tx, err := s.db.Begin(r.Context())
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the tenancy.", nil)
		return
	}
	defer tx.Rollback(r.Context())
	var tenancyID, propertyID uuid.UUID
	err = tx.QueryRow(r.Context(), `INSERT INTO tenancies(organization_id,property_id,unit_id,tenant_id,start_date,end_date,monthly_rent,deposit_amount,status) SELECT p.organization_id,p.id,u.id,tenant.id,$1,$2,$3,$4,'active' FROM units u JOIN properties p ON p.id=u.property_id JOIN users tenant ON tenant.id=$5 AND tenant.role='renter' AND tenant.status='active' WHERE u.id=$6 AND p.organization_id=$7 AND u.availability_status='available' RETURNING id,property_id`, start, end, input.MonthlyRent, input.DepositAmount, input.TenantID, input.UnitID, actor.OrganizationID).Scan(&tenancyID, &propertyID)
	if err != nil {
		writeError(w, r, http.StatusConflict, "tenancy_conflict", "The unit or renter is invalid, or the unit already has an active tenancy.", nil)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE units SET availability_status='occupied',updated_at=now() WHERE id=$1`, input.UnitID); err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to update unit availability.", nil)
		return
	}
	if _, err = tx.Exec(r.Context(), `UPDATE listings SET status='rented',updated_at=now() WHERE unit_id=$1`, input.UnitID); err != nil {
		return
	}
	if input.InquiryID != nil {
		_, _ = tx.Exec(r.Context(), `UPDATE inquiries SET status='accepted',updated_at=now() WHERE id=$1 AND renter_id=$2`, input.InquiryID, input.TenantID)
	}
	if err = tx.Commit(r.Context()); err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the tenancy.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "tenancy.create", "tenancy", tenancyID, map[string]any{"unit_id": input.UnitID, "tenant_id": input.TenantID})
	writeData(w, http.StatusCreated, map[string]uuid.UUID{"id": tenancyID, "property_id": propertyID}, nil)
}

func (s *Server) getTenancy(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "tenancyId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	condition := "t.tenant_id=$2"
	var scope any = actor.ID
	if actor.Role == "landlord" {
		condition = "t.organization_id=$2"
		scope = actor.OrganizationID
	}
	var item Tenancy
	err := s.db.QueryRow(r.Context(), `SELECT t.id,t.property_id,t.unit_id,t.tenant_id,p.name,u.unit_label,tenant.full_name,tenant.email,t.start_date,t.end_date,t.monthly_rent::float8,t.deposit_amount::float8,t.status FROM tenancies t JOIN properties p ON p.id=t.property_id JOIN units u ON u.id=t.unit_id JOIN users tenant ON tenant.id=t.tenant_id WHERE t.id=$1 AND `+condition, id, scope).Scan(&item.ID, &item.PropertyID, &item.UnitID, &item.TenantID, &item.PropertyName, &item.UnitLabel, &item.TenantName, &item.TenantEmail, &item.StartDate, &item.EndDate, &item.MonthlyRent, &item.DepositAmount, &item.Status)
	if isNotFound(err) {
		writeError(w, r, http.StatusNotFound, "not_found", "Tenancy not found.", nil)
		return
	}
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load the tenancy.", nil)
		return
	}
	writeData(w, http.StatusOK, item, nil)
}
