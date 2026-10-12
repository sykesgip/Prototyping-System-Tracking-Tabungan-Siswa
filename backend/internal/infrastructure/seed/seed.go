package seed

import (
	"context"
	"log"
	"time"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/repository"
	"tabungan-siswa/backend/pkg/hash"

	"github.com/google/uuid"
)

// Run seeds default users and demo data idempotently (safe to call on every boot).
func Run(
	ctx context.Context,
	userRepo repository.UserRepository,
	studentRepo repository.StudentRepository,
	savingRepo repository.SavingEntryRepository,
) {
	admin := ensureUser(ctx, userRepo, "Admin Yayasan", "admin@tabungan.id", "admin123", entity.RoleAdmin)
	wali := ensureUser(ctx, userRepo, "Budi Santoso", "wali@tabungan.id", "wali123", entity.RoleWali)

	if wali == nil {
		return
	}

	s1 := ensureStudent(ctx, studentRepo, "202401", "Andi Saputra", "1A", wali.ID)
	s2 := ensureStudent(ctx, studentRepo, "202402", "Dewi Rahayu", "2B", wali.ID)

	if s1 != nil {
		ensureSavings(ctx, savingRepo, s1.ID)
	}
	if s2 != nil {
		ensureSavings(ctx, savingRepo, s2.ID)
	}

	_ = admin
	log.Println("[Seed] ✓ default data ready")
	log.Println("[Seed]   admin : admin@tabungan.id / admin123")
	log.Println("[Seed]   wali  : wali@tabungan.id  / wali123")
}

// ensureUser creates a user only if the email does not already exist.
func ensureUser(ctx context.Context, repo repository.UserRepository, name, email, password string, role entity.Role) *entity.User {
	existing, err := repo.FindByEmail(ctx, email)
	if err == nil && existing != nil {
		return existing
	}

	hashed, err := hash.Hash(password)
	if err != nil {
		log.Printf("[Seed] hash error: %v", err)
		return nil
	}

	u := &entity.User{Name: name, Email: email, Password: hashed, Role: role}
	if err := repo.Create(ctx, u); err != nil {
		log.Printf("[Seed] create user %s: %v", email, err)
		return nil
	}
	return u
}

// ensureStudent creates a student only if the NIS does not already exist.
func ensureStudent(ctx context.Context, repo repository.StudentRepository, nis, name, class string, waliID uuid.UUID) *entity.Student {
	existing, err := repo.FindByNIS(ctx, nis)
	if err == nil && existing != nil {
		return existing
	}

	s := &entity.Student{NIS: nis, Name: name, Class: class, WaliID: waliID}
	if err := repo.Create(ctx, s); err != nil {
		log.Printf("[Seed] create student %s: %v", nis, err)
		return nil
	}
	return s
}

// ensureSavings adds demo saving entries for a student if none exist yet.
func ensureSavings(ctx context.Context, repo repository.SavingEntryRepository, studentID uuid.UUID) {
	existing, _ := repo.FindByStudent(ctx, studentID)
	if len(existing) > 0 {
		return
	}

	entries := []entity.SavingEntry{
		{StudentID: studentID, Type: entity.EntryDeposit, Amount: 50000, Note: "Setoran awal", RecordedAt: time.Now().AddDate(0, -2, 0)},
		{StudentID: studentID, Type: entity.EntryDeposit, Amount: 50000, Note: "Setoran bulan 1", RecordedAt: time.Now().AddDate(0, -1, 0)},
		{StudentID: studentID, Type: entity.EntryDeposit, Amount: 75000, Note: "Setoran bulan 2", RecordedAt: time.Now()},
	}

	for i := range entries {
		if err := repo.Create(ctx, &entries[i]); err != nil {
			log.Printf("[Seed] create saving entry: %v", err)
		}
	}
}
