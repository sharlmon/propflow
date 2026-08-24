package platform

import (
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Inquiry struct {
	ID          uuid.UUID `json:"id"`
	ListingID   uuid.UUID `json:"listing_id"`
	RenterID    uuid.UUID `json:"renter_id"`
	Message     string    `json:"message"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	Title       string    `json:"listing_title"`
	Slug        string    `json:"listing_slug"`
	Locality    string    `json:"locality"`
	RenterName  string    `json:"renter_name,omitempty"`
	RenterEmail string    `json:"renter_email,omitempty"`
}

type inquiryInput struct {
	Message string `json:"message"`
}
type inquiryStatusInput struct {
	Status string `json:"status"`
}

func (s *Server) createInquiry(w http.ResponseWriter, r *http.Request) {
	listingID, ok := parseUUIDParam(w, r, "listingId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input inquiryInput
	if !decodeJSON(w, r, &input) {
		return
	}
	input.Message = strings.TrimSpace(input.Message)
	if len(input.Message) < 10 || len(input.Message) > 2000 {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Please enter a message between 10 and 2,000 characters.", map[string]string{"message": "Enter 10 to 2,000 characters."})
		return
	}
	var inquiry Inquiry
	err := s.db.QueryRow(r.Context(), `INSERT INTO inquiries(listing_id,renter_id,message) SELECT l.id,$1,$2 FROM listings l WHERE l.id=$3 AND l.status='published' RETURNING id,listing_id,renter_id,message,status,created_at`, actor.ID, input.Message, listingID).Scan(&inquiry.ID, &inquiry.ListingID, &inquiry.RenterID, &inquiry.Message, &inquiry.Status, &inquiry.CreatedAt)
	if err != nil {
		writeError(w, r, http.StatusNotFound, "not_found", "Published listing not found.", nil)
		return
	}
	writeData(w, http.StatusCreated, inquiry, nil)
}

func (s *Server) renterInquiries(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	rows, err := s.db.Query(r.Context(), `SELECT i.id,i.listing_id,i.renter_id,i.message,i.status,i.created_at,l.title,l.slug,p.locality,'','' FROM inquiries i JOIN listings l ON l.id=i.listing_id JOIN properties p ON p.id=l.property_id WHERE i.renter_id=$1 ORDER BY i.created_at DESC`, actor.ID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load inquiries.", nil)
		return
	}
	defer rows.Close()
	items, err := collectInquiries(rows)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load inquiries.", nil)
		return
	}
	writeData(w, http.StatusOK, items, nil)
}

func (s *Server) landlordInquiries(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	status := strings.TrimSpace(r.URL.Query().Get("status"))
	rows, err := s.db.Query(r.Context(), `SELECT i.id,i.listing_id,i.renter_id,i.message,i.status,i.created_at,l.title,l.slug,p.locality,u.full_name,u.email FROM inquiries i JOIN listings l ON l.id=i.listing_id JOIN properties p ON p.id=l.property_id JOIN users u ON u.id=i.renter_id WHERE p.organization_id=$1 AND ($2='' OR i.status=$2) ORDER BY i.created_at DESC`, actor.OrganizationID, status)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load inquiries.", nil)
		return
	}
	defer rows.Close()
	items, err := collectInquiries(rows)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load inquiries.", nil)
		return
	}
	writeData(w, http.StatusOK, items, nil)
}

func (s *Server) updateInquiryStatus(w http.ResponseWriter, r *http.Request) {
	id, ok := parseUUIDParam(w, r, "inquiryId")
	if !ok {
		return
	}
	actor := actorFromContext(r.Context())
	var input inquiryStatusInput
	if !decodeJSON(w, r, &input) {
		return
	}
	if !isInquiryStatus(input.Status) {
		writeError(w, r, http.StatusUnprocessableEntity, "validation_error", "Choose a valid inquiry status.", nil)
		return
	}
	command, err := s.db.Exec(r.Context(), `UPDATE inquiries i SET status=$1,updated_at=now() FROM listings l JOIN properties p ON p.id=l.property_id WHERE i.id=$2 AND l.id=i.listing_id AND p.organization_id=$3`, input.Status, id, actor.OrganizationID)
	if err != nil || command.RowsAffected() == 0 {
		writeError(w, r, http.StatusNotFound, "not_found", "Inquiry not found.", nil)
		return
	}
	s.audit(r, actor.ID, actor.OrganizationID, "inquiry.status_change", "inquiry", id, map[string]any{"status": input.Status})
	writeData(w, http.StatusOK, map[string]string{"id": id.String(), "status": input.Status}, nil)
}

func collectInquiries(rows rowIterator) ([]Inquiry, error) {
	items := []Inquiry{}
	for rows.Next() {
		var item Inquiry
		if err := rows.Scan(&item.ID, &item.ListingID, &item.RenterID, &item.Message, &item.Status, &item.CreatedAt, &item.Title, &item.Slug, &item.Locality, &item.RenterName, &item.RenterEmail); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

type rowIterator interface {
	Next() bool
	Scan(dest ...any) error
	Err() error
}

func isInquiryStatus(status string) bool {
	return map[string]bool{"new": true, "contacted": true, "viewing_scheduled": true, "accepted": true, "closed": true}[status]
}
