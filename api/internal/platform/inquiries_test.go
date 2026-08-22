package platform

import "testing"

func TestInquiryStatuses(t *testing.T) {
	for _, status := range []string{"new", "contacted", "viewing_scheduled", "accepted", "closed"} {
		if !isInquiryStatus(status) {
			t.Fatalf("valid status rejected: %s", status)
		}
	}
	if isInquiryStatus("deleted") {
		t.Fatal("invalid status accepted")
	}
}
