package repository

import (
	"context"

	"tabungan-siswa/backend/internal/domain/entity"

	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error)
	FindByEmail(ctx context.Context, email string) (*entity.User, error)
	List(ctx context.Context) ([]entity.User, error)
	Update(ctx context.Context, user *entity.User) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type StudentRepository interface {
	Create(ctx context.Context, student *entity.Student) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.Student, error)
	FindByNIS(ctx context.Context, nis string) (*entity.Student, error)
	FindByWali(ctx context.Context, waliID uuid.UUID) ([]entity.Student, error)
	List(ctx context.Context) ([]entity.Student, error)
	Update(ctx context.Context, student *entity.Student) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type SavingEntryRepository interface {
	Create(ctx context.Context, entry *entity.SavingEntry) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.SavingEntry, error)
	FindByStudent(ctx context.Context, studentID uuid.UUID) ([]entity.SavingEntry, error)
	// GetBalance returns total balance (deposits - withdrawals) for a student.
	GetBalance(ctx context.Context, studentID uuid.UUID) (int64, error)
	// MonthlySummary returns per-month totals for a student.
	MonthlySummary(ctx context.Context, studentID uuid.UUID) ([]MonthlySummaryRow, error)
	Update(ctx context.Context, entry *entity.SavingEntry) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type MonthlySummaryRow struct {
	Year   int   `json:"year"`
	Month  int   `json:"month"`
	Total  int64 `json:"total"`
}

type WithdrawalRequestRepository interface {
	Create(ctx context.Context, req *entity.WithdrawalRequest) error
	FindByID(ctx context.Context, id uuid.UUID) (*entity.WithdrawalRequest, error)
	FindByStudent(ctx context.Context, studentID uuid.UUID) ([]entity.WithdrawalRequest, error)
	FindByRequester(ctx context.Context, requesterID uuid.UUID) ([]entity.WithdrawalRequest, error)
	List(ctx context.Context) ([]entity.WithdrawalRequest, error)
	Update(ctx context.Context, req *entity.WithdrawalRequest) error
}

type DailyReminderRepository interface {
	Upsert(ctx context.Context, reminder *entity.DailyReminder) error
	FindByWali(ctx context.Context, waliID uuid.UUID) (*entity.DailyReminder, error)
	ListActive(ctx context.Context) ([]entity.DailyReminder, error)
}
