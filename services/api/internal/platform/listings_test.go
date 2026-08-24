package platform

import "testing"

func TestSlugify(t *testing.T) {
	if got := slugify("Bright 2-Bedroom — Kilimani!"); got != "bright-2-bedroom-kilimani" {
		t.Fatalf("unexpected slug: %s", got)
	}
}

func TestValidateListing(t *testing.T) {
	valid := listingInput{Title: "Kilimani home", Description: "A bright and secure rental home.", RentAmount: 45000, DepositAmount: 45000}
	if fields := validateListing(valid); len(fields) != 0 {
		t.Fatalf("valid listing rejected: %v", fields)
	}
	valid.RentAmount = -1
	if validateListing(valid)["rent_amount"] == "" {
		t.Fatal("negative rent accepted")
	}
}
