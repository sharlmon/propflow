package platform

import "testing"

func TestValidateProperty(t *testing.T) {
	fields := validateProperty(propertyInput{Status: "active"})
	for _, field := range []string{"name", "address_line", "locality", "county"} {
		if fields[field] == "" {
			t.Fatalf("expected validation error for %s", field)
		}
	}
}

func TestValidateUnit(t *testing.T) {
	valid := unitInput{UnitLabel: "A-1", Bedrooms: 1, Bathrooms: 1, RentAmount: 25000, DepositAmount: 25000, AvailabilityStatus: "available"}
	if fields := validateUnit(valid); len(fields) != 0 {
		t.Fatalf("valid unit was rejected: %v", fields)
	}
	valid.RentAmount = -1
	if validateUnit(valid)["rent_amount"] == "" {
		t.Fatal("negative rent was accepted")
	}
}
