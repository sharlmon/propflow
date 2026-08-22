package platform

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Listing struct {
	ID               uuid.UUID  `json:"id"`
	PropertyID       uuid.UUID  `json:"property_id"`
	UnitID           uuid.UUID  `json:"unit_id"`
	Slug             string     `json:"slug"`
	Title            string     `json:"title"`
	Description      string     `json:"description"`
	RentAmount       float64    `json:"rent_amount"`
	DepositAmount    float64    `json:"deposit_amount"`
	Amenities        []string   `json:"amenities"`
	Status           string     `json:"status"`
	PublishedAt      *time.Time `json:"published_at,omitempty"`
	PropertyName     string     `json:"property_name"`
	Locality         string     `json:"locality"`
	County           string     `json:"county"`
	Bedrooms         int        `json:"bedrooms"`
	Bathrooms        float64    `json:"bathrooms"`
	ImageURL         string     `json:"image_url"`
	ImageAlt         string     `json:"image_alt"`
	OrganizationName string     `json:"organization_name,omitempty"`
}

type listingInput struct {
	Title         string   `json:"title"`
	Description   string   `json:"description"`
	RentAmount    float64  `json:"rent_amount"`
	DepositAmount float64  `json:"deposit_amount"`
	Amenities     []string `json:"amenities"`
}

func (s *Server) listListings(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("query"))
	county := strings.TrimSpace(r.URL.Query().Get("county"))
	locality := strings.TrimSpace(r.URL.Query().Get("locality"))
	minRent, _ := strconv.ParseFloat(r.URL.Query().Get("min_rent"), 64)
	maxRent, _ := strconv.ParseFloat(r.URL.Query().Get("max_rent"), 64)
	bedrooms := -1
	if value := r.URL.Query().Get("bedrooms"); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			bedrooms = parsed
		}
	}
	page := parsePositiveInt(r.URL.Query().Get("page"), 1, 100000)
	pageSize := parsePositiveInt(r.URL.Query().Get("page_size"), 12, 50)
	offset := (page - 1) * pageSize
	order := "l.published_at DESC"
	switch r.URL.Query().Get("sort") {
	case "rent_asc":
		order = "l.rent_amount ASC, l.published_at DESC"
	case "rent_desc":
		order = "l.rent_amount DESC, l.published_at DESC"
	}
	where := `l.status='published' AND ($1='' OR l.title ILIKE '%'||$1||'%' OR p.name ILIKE '%'||$1||'%' OR p.locality ILIKE '%'||$1||'%') AND ($2='' OR p.county=$2) AND ($3='' OR p.locality=$3) AND ($4=0 OR l.rent_amount >= $4) AND ($5=0 OR l.rent_amount <= $5) AND ($6=-1 OR u.bedrooms=$6)`
	var total int
	if err := s.db.QueryRow(r.Context(), `SELECT count(*) FROM listings l JOIN properties p ON p.id=l.property_id JOIN units u ON u.id=l.unit_id WHERE `+where, query, county, locality, minRent, maxRent, bedrooms).Scan(&total); err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to search listings.", nil)
		return
	}
	rows, err := s.db.Query(r.Context(), fmt.Sprintf(`
		SELECT l.id,l.property_id,l.unit_id,l.slug,l.title,l.description,l.rent_amount::float8,l.deposit_amount::float8,l.amenities,l.status,l.published_at,
		p.name,p.locality,p.county,u.bedrooms,u.bathrooms::float8,COALESCE(i.image_url,'/demo/kilimani.svg'),COALESCE(i.alt_text,l.title),o.name
		FROM listings l JOIN properties p ON p.id=l.property_id JOIN units u ON u.id=l.unit_id JOIN organizations o ON o.id=p.organization_id
		LEFT JOIN LATERAL (SELECT image_url,alt_text FROM listing_images WHERE listing_id=l.id ORDER BY sort_order LIMIT 1) i ON true
		WHERE %s ORDER BY %s LIMIT $7 OFFSET $8`, where, order), query, county, locality, minRent, maxRent, bedrooms, pageSize, offset)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to search listings.", nil)
		return
	}
	defer rows.Close()
	listings := []Listing{}
	for rows.Next() {
		var listing Listing
		if err := scanListing(rows, &listing); err != nil {
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to search listings.", nil)
			return
		}
		listings = append(listings, listing)
	}
	totalPages := (total + pageSize - 1) / pageSize
	writeData(w, http.StatusOK, listings, map[string]int{"page": page, "page_size": pageSize, "total": total, "total_pages": totalPages})
}

func (s *Server) getListingBySlug(w http.ResponseWriter, r *http.Request) {
	slug := strings.TrimSpace(chi.URLParam(r, "listingRef"))
	var listing Listing
	err := s.db.QueryRow(r.Context(), `
		SELECT l.id,l.property_id,l.unit_id,l.slug,l.title,l.description,l.rent_amount::float8,l.deposit_amount::float8,l.amenities,l.status,l.published_at,
		p.name,p.locality,p.county,u.bedrooms,u.bathrooms::float8,COALESCE(i.image_url,'/demo/kilimani.svg'),COALESCE(i.alt_text,l.title),o.name
		FROM listings l JOIN properties p ON p.id=l.property_id JOIN units u ON u.id=l.unit_id JOIN organizations o ON o.id=p.organization_id
		LEFT JOIN LATERAL (SELECT image_url,alt_text FROM listing_images WHERE listing_id=l.id ORDER BY sort_order LIMIT 1) i ON true
		WHERE l.slug=$1 AND l.status='published'`, slug).Scan(listingScanTargets(&listing)...)
	if isNotFound(err) {
		writeError(w, r, http.StatusNotFound, "not_found", "Listing not found.", nil)
		return
	}
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load the listing.", nil)
		return
	}
	writeData(w, http.StatusOK, listing, nil)
}

func (s *Server) createListing(w http.ResponseWriter, r *http.Request) {
	unitID, ok := parseUUIDParam(w, r, "unitId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input listingInput
	if !decodeJSON(w, r, &input) {
		return
	}
	normalizeListingInput(&input)
	if fields := validateListing(input); len(fields) > 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please correct the highlighted fields.", fields)
		return
	}
	slug := slugify(input.Title) + "-" + strings.ToLower(uuid.NewString()[:8])
	var id uuid.UUID
	err := s.db.QueryRow(r.Context(), `INSERT INTO listings(property_id,unit_id,slug,title,description,rent_amount,deposit_amount,amenities,status) SELECT p.id,u.id,$1,$2,$3,COALESCE(NULLIF($4,0),u.rent_amount),COALESCE(NULLIF($5,0),u.deposit_amount),$6,'draft' FROM units u JOIN properties p ON p.id=u.property_id WHERE u.id=$7 AND p.organization_id=$8 AND u.availability_status='available' RETURNING id`, slug, input.Title, input.Description, input.RentAmount, input.DepositAmount, input.Amenities, unitID, actor.OrganizationID).Scan(&id)
	if err != nil {
		writeError(w, r, http.StatusConflict, "listing_conflict", "Only an available unit without a listing can be listed.", nil)
		return
	}
	writeData(w, http.StatusCreated, map[string]any{"id": id, "slug": slug, "status": "draft"}, nil)
}

func (s *Server) updateListing(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "listingRef")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input listingInput
	if !decodeJSON(w, r, &input) {
		return
	}
	normalizeListingInput(&input)
	if fields := validateListing(input); len(fields) > 0 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please correct the highlighted fields.", fields)
		return
	}
	command, err := s.db.Exec(r.Context(), `UPDATE listings l SET title=$1,description=$2,rent_amount=$3,deposit_amount=$4,amenities=$5,updated_at=now() FROM properties p WHERE l.id=$6 AND p.id=l.property_id AND p.organization_id=$7`, input.Title, input.Description, input.RentAmount, input.DepositAmount, input.Amenities, id, actor.OrganizationID)
	if err != nil || command.RowsAffected() == 0 {
		writeError(w, r, http.StatusNotFound, "not_found", "Listing not found.", nil)
		return
	}
	writeData(w, http.StatusOK, map[string]uuid.UUID{"id": id}, nil)
}

func (s *Server) publishListing(w http.ResponseWriter, r *http.Request) {
	s.changeListingStatus(w, r, "published")
}
func (s *Server) unpublishListing(w http.ResponseWriter, r *http.Request) {
	s.changeListingStatus(w, r, "unpublished")
}
func (s *Server) changeListingStatus(w http.ResponseWriter, r *http.Request, status string) {
	id, ok := parseUUIDParam(w, r, "listingId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	command, err := s.db.Exec(r.Context(), `UPDATE listings l SET status=$1,published_at=CASE WHEN $1='published' THEN COALESCE(l.published_at,now()) ELSE l.published_at END,updated_at=now() FROM properties p JOIN units u ON u.property_id=p.id WHERE l.id=$2 AND p.id=l.property_id AND u.id=l.unit_id AND p.organization_id=$3 AND ($1<>'published' OR u.availability_status='available') AND l.status<>'rented'`, status, id, actor.OrganizationID)
	if err != nil || command.RowsAffected() == 0 {
		writeError(w, r, http.StatusConflict, "listing_transition", "The listing cannot change to that status.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "listing."+status, "listing", id, nil)
	writeData(w, http.StatusOK, map[string]string{"id": id.String(), "status": status}, nil)
}

type rowScanner interface{ Scan(dest ...any) error }

func scanListing(row rowScanner, listing *Listing) error {
	return row.Scan(listingScanTargets(listing)...)
}
func listingScanTargets(l *Listing) []any {
	return []any{&l.ID, &l.PropertyID, &l.UnitID, &l.Slug, &l.Title, &l.Description, &l.RentAmount, &l.DepositAmount, &l.Amenities, &l.Status, &l.PublishedAt, &l.PropertyName, &l.Locality, &l.County, &l.Bedrooms, &l.Bathrooms, &l.ImageURL, &l.ImageAlt, &l.OrganizationName}
}
func normalizeListingInput(i *listingInput) {
	i.Title = strings.TrimSpace(i.Title)
	i.Description = strings.TrimSpace(i.Description)
	for index := range i.Amenities {
		i.Amenities[index] = strings.TrimSpace(i.Amenities[index])
	}
}
func validateListing(i listingInput) map[string]string {
	fields := map[string]string{}
	if len(i.Title) < 3 {
		fields["title"] = "Enter a listing title."
	}
	if len(i.Description) < 10 {
		fields["description"] = "Enter at least 10 characters."
	}
	if i.RentAmount < 0 {
		fields["rent_amount"] = "Rent cannot be negative."
	}
	if i.DepositAmount < 0 {
		fields["deposit_amount"] = "Deposit cannot be negative."
	}
	return fields
}

var slugPattern = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(value string) string {
	slug := strings.Trim(slugPattern.ReplaceAllString(strings.ToLower(value), "-"), "-")
	if slug == "" {
		return "rental-home"
	}
	return slug
}
