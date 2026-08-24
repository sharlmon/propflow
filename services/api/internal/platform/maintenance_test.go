package platform

import "testing"

func TestMaintenanceTransitions(t *testing.T) {
	cases := []struct {
		from, to string
		allowed  bool
	}{{"open", "acknowledged", true}, {"acknowledged", "in_progress", true}, {"in_progress", "resolved", true}, {"open", "resolved", false}, {"resolved", "in_progress", false}, {"open", "cancelled", true}}
	for _, item := range cases {
		if got := validMaintenanceTransition(item.from, item.to); got != item.allowed {
			t.Fatalf("transition %s -> %s: got %v", item.from, item.to, got)
		}
	}
}
