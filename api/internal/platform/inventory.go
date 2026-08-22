package platform

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type Property struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	AddressLine  string    `json:"address_line"`
	Locality     string    `json:"locality"`
	County       string    `json:"county"`
	Status       string    `json:"status"`
	UnitCount    int       `json:"unit_count"`
	Available    int       `json:"available_units"`
	CreatedAt    time.Time `json:"created_at"`
	Organization uuid.UUID `json:"-"`
}

type Unit struct {
	ID                 uuid.UUID  `json:"id"`
	PropertyID         uuid.UUID  `json:"property_id"`
	UnitLabel          string     `json:"unit_label"`
	Bedrooms           int        `json:"bedrooms"`
	Bathrooms          float64    `json:"bathrooms"`
	RentAmount         float64    `json:"rent_amount"`
	DepositAmount      float64    `json:"deposit_amount"`
	AvailabilityStatus string     `json:"availability_status"`
	ListingID          *uuid.UUID `json:"listing_id,omitempty"`
	ListingStatus      *string    `json:"listing_status,omitempty"`
	CreatedAt          time.Time  `json:"created_at"`
}

type propertyInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	AddressLine string `json:"address_line"`
	Locality    string `json:"locality"`
	County      string `json:"county"`
	Status      string `json:"status"`
}

type unitInput struct {
	UnitLabel          string  `json:"unit_label"`
	Bedrooms           int     `json:"bedrooms"`
	Bathrooms          float64 `json:"bathrooms"`
	RentAmount         float64 `json:"rent_amount"`
	DepositAmount      float64 `json:"deposit_amount"`
	AvailabilityStatus string  `json:"availability_status"`
}

func (s *Server) listProperties(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	rows, err := s.db.Query(r.Context(), `
		SELECT p.id, p.name, p.description, p.address_line, p.locality, p.county, p.status,
		       count(u.id)::int, count(u.id) FILTER (WHERE u.availability_status = 'available')::int, p.created_at
		FROM properties p
		LEFT JOIN units u ON u.property_id = p.id
		WHERE p.organization_id = $1
		GROUP BY p.id
		ORDER BY p.created_at DESC`, actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load properties.", nil)
		return
	}
	defer rows.Close()
	properties := []Property{}
	for rows.Next() {
		var property Property
		if err := rows.Scan(&property.ID, &property.Name, &property.Description, &property.AddressLine, &property.Locality, &property.County, &property.Status, &property.UnitCount, &property.Available, &property.CreatedAt); err != nil {
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load properties.", nil)
			return
		}
		properties = append(properties, property)
	}
	writeData(w, http.StatusOK, properties, map[string]int{"total": len(properties)})
}

func (s *Server) createProperty(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	var input propertyInput
	if !decodeJSON(w, r, &input) {
		return
	}
	normalizePropertyInput(&input)
	if fields := validateProperty(input); len(fields) > 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please correct the highlighted fields.", fields)
		return
	}
	var property Property
	err := s.db.QueryRow(r.Context(), `
		INSERT INTO properties (organization_id, name, description, address_line, locality, county, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, description, address_line, locality, county, status, 0, 0, created_at`,
		actor.OrganizationID, input.Name, input.Description, input.AddressLine, input.Locality, input.County, input.Status).
		Scan(&property.ID, &property.Name, &property.Description, &property.AddressLine, &property.Locality, &property.County, &property.Status, &property.UnitCount, &property.Available, &property.CreatedAt)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to create the property.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "property.create", "property", property.ID, nil)
	writeData(w, http.StatusCreated, property, nil)
}

func (s *Server) getProperty(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "propertyId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var property Property
	err := s.db.QueryRow(r.Context(), `
		SELECT p.id, p.name, p.description, p.address_line, p.locality, p.county, p.status,
		       count(u.id)::int, count(u.id) FILTER (WHERE u.availability_status = 'available')::int, p.created_at
		FROM properties p LEFT JOIN units u ON u.property_id = p.id
		WHERE p.id = $1 AND p.organization_id = $2 GROUP BY p.id`, id, actor.OrganizationID).
		Scan(&property.ID, &property.Name, &property.Description, &property.AddressLine, &property.Locality, &property.County, &property.Status, &property.UnitCount, &property.Available, &property.CreatedAt)
	if isNotFound(err) {
		writeError(w, r, http.StatusNotFound, "not_found", "Property not found.", nil)
		return
	}
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load the property.", nil)
		return
	}
	units, err := s.unitsForProperty(r, id, *actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load units.", nil)
		return
	}
	writeData(w, http.StatusOK, map[string]any{"property": property, "units": units}, nil)
}

func (s *Server) updateProperty(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "propertyId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input propertyInput
	if !decodeJSON(w, r, &input) {
		return
	}
	normalizePropertyInput(&input)
	if fields := validateProperty(input); len(fields) > 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please correct the highlighted fields.", fields)
		return
	}
	command, err := s.db.Exec(r.Context(), `UPDATE properties SET name=$1, description=$2, address_line=$3, locality=$4, county=$5, status=$6, updated_at=now() WHERE id=$7 AND organization_id=$8`, input.Name, input.Description, input.AddressLine, input.Locality, input.County, input.Status, id, actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to update the property.", nil)
		return
	}
	if command.RowsAffected() == 0 {
		writeError(w, r, http.StatusNotFound, "not_found", "Property not found.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "property.update", "property", id, nil)
	s.getProperty(w, r)
}

func (s *Server) deleteProperty(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "propertyId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	command, err := s.db.Exec(r.Context(), `DELETE FROM properties p WHERE p.id=$1 AND p.organization_id=$2 AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.property_id=p.id AND t.status='active') AND NOT EXISTS (SELECT 1 FROM units u WHERE u.property_id=p.id)`, id, actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusConflict, "property_in_use", "Remove units and end active tenancies before deleting this property.", nil)
		return
	}
	if command.RowsAffected() == 0 {
		writeError(w, r, http.StatusConflict, "property_in_use", "The property cannot be deleted while it has units or an active tenancy.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "property.delete", "property", id, nil)
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) listUnits(w http.ResponseWriter, r *http.Request) {
	propertyID, ok := parseUUIDParam(w, r, "propertyId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	units, err := s.unitsForProperty(r, propertyID, *actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load units.", nil)
		return
	}
	writeData(w, http.StatusOK, units, nil)
}

func (s *Server) createUnit(w http.ResponseWriter, r *http.Request) {
	propertyID, ok := parseUUIDParam(w, r, "propertyId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input unitInput
	if !decodeJSON(w, r, &input) {
		return
	}
	normalizeUnitInput(&input)
	if fields := validateUnit(input); len(fields) > 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please correct the highlighted fields.", fields)
		return
	}
	var unit Unit
	err := s.db.QueryRow(r.Context(), `
		INSERT INTO units (property_id, unit_label, bedrooms, bathrooms, rent_amount, deposit_amount, availability_status)
		SELECT p.id, $1, $2, $3, $4, $5, $6 FROM properties p WHERE p.id=$7 AND p.organization_id=$8
		RETURNING id, property_id, unit_label, bedrooms, bathrooms::float8, rent_amount::float8, deposit_amount::float8, availability_status, created_at`,
		input.UnitLabel, input.Bedrooms, input.Bathrooms, input.RentAmount, input.DepositAmount, input.AvailabilityStatus, propertyID, actor.OrganizationID).
		Scan(&unit.ID, &unit.PropertyID, &unit.UnitLabel, &unit.Bedrooms, &unit.Bathrooms, &unit.RentAmount, &unit.DepositAmount, &unit.AvailabilityStatus, &unit.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		writeError(w, r, http.StatusNotFound, "not_found", "Property not found.", nil)
		return
	}
	if err != nil {
		writeError(w, r, http.StatusConflict, "unit_conflict", "The unit label must be unique for this property.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "unit.create", "unit", unit.ID, map[string]any{"property_id": propertyID})
	writeData(w, http.StatusCreated, unit, nil)
}

func (s *Server) updateUnit(w http.ResponseWriter, r *http.Request) {
	unitID, ok := parseUUIDParam(w, r, "unitId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input unitInput
	if !decodeJSON(w, r, &input) {
		return
	}
	normalizeUnitInput(&input)
	if fields := validateUnit(input); len(fields) > 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please correct the highlighted fields.", fields)
		return
	}
	command, err := s.db.Exec(r.Context(), `UPDATE units u SET unit_label=$1, bedrooms=$2, bathrooms=$3, rent_amount=$4, deposit_amount=$5, availability_status=$6, updated_at=now() FROM properties p WHERE u.id=$7 AND p.id=u.property_id AND p.organization_id=$8`, input.UnitLabel, input.Bedrooms, input.Bathrooms, input.RentAmount, input.DepositAmount, input.AvailabilityStatus, unitID, actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusConflict, "unit_conflict", "The unit could not be updated.", nil)
		return
	}
	if command.RowsAffected() == 0 {
		writeError(w, r, http.StatusNotFound, "not_found", "Unit not found.", nil)
		return
	}
	writeData(w, http.StatusOK, map[string]uuid.UUID{"id": unitID}, nil)
}

func (s *Server) deleteUnit(w http.ResponseWriter, r *http.Request) {
	unitID, ok := parseUUIDParam(w, r, "unitId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	command, err := s.db.Exec(r.Context(), `DELETE FROM units u USING properties p WHERE u.id=$1 AND p.id=u.property_id AND p.organization_id=$2 AND NOT EXISTS (SELECT 1 FROM tenancies t WHERE t.unit_id=u.id) AND NOT EXISTS (SELECT 1 FROM listings l WHERE l.unit_id=u.id)`, unitID, actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusConflict, "unit_in_use", "The unit is used by a listing or tenancy.", nil)
		return
	}
	if command.RowsAffected() == 0 {
		writeError(w, r, http.StatusConflict, "unit_in_use", "The unit cannot be deleted while it has a listing or tenancy.", nil)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) unitsForProperty(r *http.Request, propertyID, organizationID uuid.UUID) ([]Unit, error) {
	rows, err := s.db.Query(r.Context(), `
		SELECT u.id, u.property_id, u.unit_label, u.bedrooms, u.bathrooms::float8, u.rent_amount::float8, u.deposit_amount::float8,
		       u.availability_status, l.id, l.status, u.created_at
		FROM units u JOIN properties p ON p.id=u.property_id LEFT JOIN listings l ON l.unit_id=u.id
		WHERE u.property_id=$1 AND p.organization_id=$2 ORDER BY u.unit_label`, propertyID, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	units := []Unit{}
	for rows.Next() {
		var unit Unit
		if err := rows.Scan(&unit.ID, &unit.PropertyID, &unit.UnitLabel, &unit.Bedrooms, &unit.Bathrooms, &unit.RentAmount, &unit.DepositAmount, &unit.AvailabilityStatus, &unit.ListingID, &unit.ListingStatus, &unit.CreatedAt); err != nil {
			return nil, err
		}
		units = append(units, unit)
	}
	return units, rows.Err()
}

func normalizePropertyInput(input *propertyInput) {
	input.Name = strings.TrimSpace(input.Name)
	input.Description = strings.TrimSpace(input.Description)
	input.AddressLine = strings.TrimSpace(input.AddressLine)
	input.Locality = strings.TrimSpace(input.Locality)
	input.County = strings.TrimSpace(input.County)
	input.Status = strings.TrimSpace(input.Status)
	if input.Status == "" {
		input.Status = "active"
	}
}
func validateProperty(input propertyInput) map[string]string {
	fields := map[string]string{}
	if len(input.Name) < 2 {
		fields["name"] = "Enter a property name."
	}
	if input.AddressLine == "" {
		fields["address_line"] = "Enter an address."
	}
	if input.Locality == "" {
		fields["locality"] = "Enter a locality."
	}
	if input.County == "" {
		fields["county"] = "Enter a county."
	}
	if input.Status != "active" && input.Status != "inactive" {
		fields["status"] = "Choose active or inactive."
	}
	return fields
}
func normalizeUnitInput(input *unitInput) {
	input.UnitLabel = strings.TrimSpace(input.UnitLabel)
	input.AvailabilityStatus = strings.TrimSpace(input.AvailabilityStatus)
	if input.AvailabilityStatus == "" {
		input.AvailabilityStatus = "available"
	}
}
func validateUnit(input unitInput) map[string]string {
	fields := map[string]string{}
	if input.UnitLabel == "" {
		fields["unit_label"] = "Enter a unit label."
	}
	if input.Bedrooms < 0 || input.Bedrooms > 20 {
		fields["bedrooms"] = "Bedrooms must be between 0 and 20."
	}
	if input.Bathrooms <= 0 || input.Bathrooms > 20 {
		fields["bathrooms"] = "Bathrooms must be greater than zero."
	}
	if input.RentAmount < 0 {
		fields["rent_amount"] = "Rent cannot be negative."
	}
	if input.DepositAmount < 0 {
		fields["deposit_amount"] = "Deposit cannot be negative."
	}
	if input.AvailabilityStatus != "available" && input.AvailabilityStatus != "occupied" && input.AvailabilityStatus != "unavailable" {
		fields["availability_status"] = "Choose a valid availability status."
	}
	return fields
}
