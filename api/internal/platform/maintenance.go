package platform

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

type MaintenanceRequest struct {
	ID           uuid.UUID `json:"id"`
	TenancyID    uuid.UUID `json:"tenancy_id"`
	PropertyID   uuid.UUID `json:"property_id"`
	UnitID       uuid.UUID `json:"unit_id"`
	CreatedBy    uuid.UUID `json:"created_by"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Priority     string    `json:"priority"`
	Status       string    `json:"status"`
	PropertyName string    `json:"property_name"`
	UnitLabel    string    `json:"unit_label"`
	RenterName   string    `json:"renter_name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
type maintenanceInput struct {
	TenancyID   uuid.UUID `json:"tenancy_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Priority    string    `json:"priority"`
}
type maintenanceStatusInput struct {
	Status   string `json:"status"`
	Priority string `json:"priority"`
}

func (s *Server) listMaintenance(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	condition := "m.created_by=$1"
	var scope any = actor.ID
	if actor.Role == "landlord" {
		condition = "m.organization_id=$1"
		scope = actor.OrganizationID
	}
	rows, err := s.db.Query(r.Context(), `SELECT m.id,m.tenancy_id,m.property_id,m.unit_id,m.created_by,m.title,m.description,m.priority,m.status,p.name,u.unit_label,creator.full_name,m.created_at,m.updated_at FROM maintenance_requests m JOIN properties p ON p.id=m.property_id JOIN units u ON u.id=m.unit_id JOIN users creator ON creator.id=m.created_by WHERE `+condition+` ORDER BY CASE m.priority WHEN 'emergency' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,m.created_at DESC`, scope)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load maintenance requests.", nil)
		return
	}
	defer rows.Close()
	items := []MaintenanceRequest{}
	for rows.Next() {
		var item MaintenanceRequest
		if err := rows.Scan(&item.ID, &item.TenancyID, &item.PropertyID, &item.UnitID, &item.CreatedBy, &item.Title, &item.Description, &item.Priority, &item.Status, &item.PropertyName, &item.UnitLabel, &item.RenterName, &item.CreatedAt, &item.UpdatedAt); err != nil {
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load maintenance requests.", nil)
			return
		}
		items = append(items, item)
	}
	writeData(w, http.StatusOK, items, nil)
}

func (s *Server) createMaintenance(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	var input maintenanceInput
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Title = strings.TrimSpace(input.Title)
	input.Description = strings.TrimSpace(input.Description)
	priorities := map[string]bool{"low": true, "medium": true, "high": true, "emergency": true}
	if input.TenancyID == uuid.Nil || len(input.Title) < 3 || len(input.Description) < 10 || !priorities[input.Priority] {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Choose an active tenancy and enter a title, description, and priority.", nil)
		return
	}
	var id uuid.UUID
	err := s.db.QueryRow(r.Context(), `INSERT INTO maintenance_requests(organization_id,property_id,unit_id,tenancy_id,created_by,title,description,priority,status) SELECT t.organization_id,t.property_id,t.unit_id,t.id,$1,$2,$3,$4,'open' FROM tenancies t WHERE t.id=$5 AND t.tenant_id=$1 AND t.status='active' RETURNING id`, actor.ID, input.Title, input.Description, input.Priority, input.TenancyID).Scan(&id)
	if err != nil {
		writeError(w, r, http.StatusConflict, "maintenance_conflict", "An active tenancy is required.", nil)
		return
	}
	writeData(w, http.StatusCreated, map[string]uuid.UUID{"id": id}, nil)
}

func (s *Server) getMaintenance(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "requestId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	condition := "m.created_by=$2"
	var scope any = actor.ID
	if actor.Role == "landlord" {
		condition = "m.organization_id=$2"
		scope = actor.OrganizationID
	}
	var item MaintenanceRequest
	err := s.db.QueryRow(r.Context(), `SELECT m.id,m.tenancy_id,m.property_id,m.unit_id,m.created_by,m.title,m.description,m.priority,m.status,p.name,u.unit_label,creator.full_name,m.created_at,m.updated_at FROM maintenance_requests m JOIN properties p ON p.id=m.property_id JOIN units u ON u.id=m.unit_id JOIN users creator ON creator.id=m.created_by WHERE m.id=$1 AND `+condition, id, scope).Scan(&item.ID, &item.TenancyID, &item.PropertyID, &item.UnitID, &item.CreatedBy, &item.Title, &item.Description, &item.Priority, &item.Status, &item.PropertyName, &item.UnitLabel, &item.RenterName, &item.CreatedAt, &item.UpdatedAt)
	if isNotFound(err) {
		writeError(w, r, http.StatusNotFound, "not_found", "Maintenance request not found.", nil)
		return
	}
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load maintenance request.", nil)
		return
	}
	writeData(w, http.StatusOK, item, nil)
}

func (s *Server) updateMaintenance(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "requestId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input maintenanceStatusInput
	if !decodeJSON(w, r, &input) {
		return
	}
	priorities := map[string]bool{"low": true, "medium": true, "high": true, "emergency": true}
	if !priorities[input.Priority] {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Choose a valid priority.", nil)
		return
	}
	var current string
	err := s.db.QueryRow(r.Context(), `SELECT m.status FROM maintenance_requests m WHERE m.id=$1 AND m.organization_id=$2 FOR UPDATE`, id, actor.OrganizationID).Scan(&current)
	if isNotFound(err) {
		writeError(w, r, http.StatusNotFound, "not_found", "Maintenance request not found.", nil)
		return
	}
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to update maintenance request.", nil)
		return
	}
	if !validMaintenanceTransition(current, input.Status) {
		writeError(w, r, http.StatusConflict, "invalid_transition", "That maintenance status transition is not allowed.", nil)
		return
	}
	_, err = s.db.Exec(r.Context(), `UPDATE maintenance_requests SET status=$1,priority=$2,updated_at=now() WHERE id=$3`, input.Status, input.Priority, id)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to update maintenance request.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "maintenance.status_change", "maintenance_request", id, map[string]any{"from": current, "to": input.Status, "priority": input.Priority})
	writeData(w, http.StatusOK, map[string]string{"id": id.String(), "status": input.Status, "priority": input.Priority}, nil)
}

func validMaintenanceTransition(from, to string) bool {
	if from == to {
		return true
	}
	allowed := map[string]map[string]bool{"open": {"acknowledged": true, "cancelled": true}, "acknowledged": {"in_progress": true, "cancelled": true}, "in_progress": {"resolved": true, "cancelled": true}, "resolved": {}, "cancelled": {}}
	return allowed[from][to]
}
