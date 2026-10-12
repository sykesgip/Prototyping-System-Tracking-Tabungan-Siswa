package usecase

import (
	"context"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/repository"

	"github.com/google/uuid"
)

type ReminderUseCase struct {
	repo repository.DailyReminderRepository
}

func NewReminderUseCase(repo repository.DailyReminderRepository) *ReminderUseCase {
	return &ReminderUseCase{repo}
}

type UpsertReminderInput struct {
	Message  string `json:"message" binding:"required"`
	IsActive bool   `json:"is_active"`
}

func (uc *ReminderUseCase) Upsert(ctx context.Context, waliID uuid.UUID, in UpsertReminderInput) (*entity.DailyReminder, error) {
	dr := &entity.DailyReminder{
		WaliID:   waliID,
		Message:  in.Message,
		IsActive: in.IsActive,
	}
	return dr, uc.repo.Upsert(ctx, dr)
}

func (uc *ReminderUseCase) GetByWali(ctx context.Context, waliID uuid.UUID) (*entity.DailyReminder, error) {
	return uc.repo.FindByWali(ctx, waliID)
}

func (uc *ReminderUseCase) ListActive(ctx context.Context) ([]entity.DailyReminder, error) {
	return uc.repo.ListActive(ctx)
}
