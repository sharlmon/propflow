package platform

import (
	"net/http"
)

func (s *Server) landlordDashboard(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	var metrics struct {
		TotalProperties    int     `json:"total_properties"`
		TotalUnits         int     `json:"total_units"`
		AvailableUnits     int     `json:"available_units"`
		OccupiedUnits      int     `json:"occupied_units"`
		PublishedListings  int     `json:"published_listings"`
		NewInquiries       int     `json:"new_inquiries"`
		ActiveTenancies    int     `json:"active_tenancies"`
		PaymentsThisMonth  int     `json:"payments_this_month"`
		OutstandingBalance float64 `json:"outstanding_balance"`
		OpenMaintenance    int     `json:"open_maintenance_requests"`
	}
	err := s.db.QueryRow(r.Context(), `SELECT (SELECT count(*) FROM properties WHERE organization_id=$1),(SELECT count(*) FROM units u JOIN properties p ON p.id=u.property_id WHERE p.organization_id=$1),(SELECT count(*) FROM units u JOIN properties p ON p.id=u.property_id WHERE p.organization_id=$1 AND u.availability_status='available'),(SELECT count(*) FROM units u JOIN properties p ON p.id=u.property_id WHERE p.organization_id=$1 AND u.availability_status='occupied'),(SELECT count(*) FROM listings l JOIN properties p ON p.id=l.property_id WHERE p.organization_id=$1 AND l.status='published'),(SELECT count(*) FROM inquiries i JOIN listings l ON l.id=i.listing_id JOIN properties p ON p.id=l.property_id WHERE p.organization_id=$1 AND i.status='new'),(SELECT count(*) FROM tenancies WHERE organization_id=$1 AND status='active'),(SELECT count(*) FROM payments pay JOIN tenancies t ON t.id=pay.tenancy_id WHERE t.organization_id=$1 AND pay.status='recorded' AND date_trunc('month',pay.paid_at)=date_trunc('month',now())),(SELECT COALESCE(sum(GREATEST(t.monthly_rent-COALESCE(month_pay.total,0),0)),0)::float8 FROM tenancies t LEFT JOIN LATERAL(SELECT sum(pay.amount) total FROM payments pay WHERE pay.tenancy_id=t.id AND pay.status='recorded' AND date_trunc('month',pay.paid_at)=date_trunc('month',now())) month_pay ON true WHERE t.organization_id=$1 AND t.status='active'),(SELECT count(*) FROM maintenance_requests WHERE organization_id=$1 AND status IN('open','acknowledged','in_progress'))`, actor.OrganizationID).Scan(&metrics.TotalProperties, &metrics.TotalUnits, &metrics.AvailableUnits, &metrics.OccupiedUnits, &metrics.PublishedListings, &metrics.NewInquiries, &metrics.ActiveTenancies, &metrics.PaymentsThisMonth, &metrics.OutstandingBalance, &metrics.OpenMaintenance)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load dashboard metrics.", nil)
		return
	}
	recentInquiries, err := s.db.Query(r.Context(), `SELECT i.id,i.listing_id,i.renter_id,i.message,i.status,i.created_at,l.title,l.slug,p.locality,u.full_name,u.email FROM inquiries i JOIN listings l ON l.id=i.listing_id JOIN properties p ON p.id=l.property_id JOIN users u ON u.id=i.renter_id WHERE p.organization_id=$1 ORDER BY i.created_at DESC LIMIT 5`, actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load recent activity.", nil)
		return
	}
	inquiries, err := collectInquiries(recentInquiries)
	recentInquiries.Close()
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load recent activity.", nil)
		return
	}
	payments, err := s.queryPayments(r, "t.organization_id=$1", actor.OrganizationID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load recent payments.", nil)
		return
	}
	if len(payments) > 5 {
		payments = payments[:5]
	}
	writeData(w, http.StatusOK, map[string]any{"metrics": metrics, "recent_inquiries": inquiries, "recent_payments": payments}, nil)
}

func (s *Server) renterDashboard(w http.ResponseWriter, r *http.Request) {
	actor := actorFromContext(r.Context())
	var tenancy *Tenancy
	var item Tenancy
	err := s.db.QueryRow(r.Context(), `SELECT t.id,t.property_id,t.unit_id,t.tenant_id,p.name,u.unit_label,tenant.full_name,tenant.email,t.start_date,t.end_date,t.monthly_rent::float8,t.deposit_amount::float8,t.status FROM tenancies t JOIN properties p ON p.id=t.property_id JOIN units u ON u.id=t.unit_id JOIN users tenant ON tenant.id=t.tenant_id WHERE t.tenant_id=$1 AND t.status='active' ORDER BY t.start_date DESC LIMIT 1`, actor.ID).Scan(&item.ID, &item.PropertyID, &item.UnitID, &item.TenantID, &item.PropertyName, &item.UnitLabel, &item.TenantName, &item.TenantEmail, &item.StartDate, &item.EndDate, &item.MonthlyRent, &item.DepositAmount, &item.Status)
	if err == nil {
		tenancy = &item
	} else if !isNotFound(err) {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load renter dashboard.", nil)
		return
	}
	payments, err := s.queryPayments(r, "t.tenant_id=$1", actor.ID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load payments.", nil)
		return
	}
	rows, err := s.db.Query(r.Context(), `SELECT m.id,m.tenancy_id,m.property_id,m.unit_id,m.created_by,m.title,m.description,m.priority,m.status,p.name,u.unit_label,creator.full_name,m.created_at,m.updated_at FROM maintenance_requests m JOIN properties p ON p.id=m.property_id JOIN units u ON u.id=m.unit_id JOIN users creator ON creator.id=m.created_by WHERE m.created_by=$1 AND m.status IN('open','acknowledged','in_progress') ORDER BY m.created_at DESC LIMIT 5`, actor.ID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load maintenance requests.", nil)
		return
	}
	maintenance := []MaintenanceRequest{}
	for rows.Next() {
		var request MaintenanceRequest
		if err := rows.Scan(&request.ID, &request.TenancyID, &request.PropertyID, &request.UnitID, &request.CreatedBy, &request.Title, &request.Description, &request.Priority, &request.Status, &request.PropertyName, &request.UnitLabel, &request.RenterName, &request.CreatedAt, &request.UpdatedAt); err != nil {
			rows.Close()
			writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load maintenance requests.", nil)
			return
		}
		maintenance = append(maintenance, request)
	}
	rows.Close()
	inquiryRows, err := s.db.Query(r.Context(), `SELECT i.id,i.listing_id,i.renter_id,i.message,i.status,i.created_at,l.title,l.slug,p.locality,'','' FROM inquiries i JOIN listings l ON l.id=i.listing_id JOIN properties p ON p.id=l.property_id WHERE i.renter_id=$1 ORDER BY i.created_at DESC LIMIT 5`, actor.ID)
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load inquiries.", nil)
		return
	}
	inquiries, err := collectInquiries(inquiryRows)
	inquiryRows.Close()
	if err != nil {
		writeError(w, r, http.StatusInternalServerError, "internal_error", "Unable to load inquiries.", nil)
		return
	}
	if len(payments) > 5 {
		payments = payments[:5]
	}
	writeData(w, http.StatusOK, map[string]any{"active_tenancy": tenancy, "recent_payments": payments, "open_maintenance": maintenance, "inquiries": inquiries}, nil)
}
