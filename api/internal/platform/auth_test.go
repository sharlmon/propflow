package platform

import "testing"

func TestPasswordHashAndVerify(t *testing.T) {
	hash, err := HashPassword("DemoPass2026!")
	if err != nil {
		t.Fatalf("HashPassword returned an error: %v", err)
	}
	if hash == "DemoPass2026!" {
		t.Fatal("password was not hashed")
	}
	if !VerifyPassword("DemoPass2026!", hash) {
		t.Fatal("correct password did not verify")
	}
	if VerifyPassword("wrong-password", hash) {
		t.Fatal("incorrect password verified")
	}
}

func TestVerifyPasswordRejectsUnsafeOrMalformedEncoding(t *testing.T) {
	for _, encoded := range []string{"", "plain", "$argon2id$v=19$m=999999,t=3,p=2$bad$bad"} {
		if VerifyPassword("password", encoded) {
			t.Fatalf("malformed encoding verified: %q", encoded)
		}
	}
}

func TestValidateRegistrationRejectsAdminRole(t *testing.T) {
	fields := validateRegistration(registerInput{
		Email: "admin@example.com", Password: "DemoPass2026!", FullName: "Admin User", Role: "admin",
	})
	if fields["role"] == "" {
		t.Fatal("public registration accepted an admin role")
	}
}
