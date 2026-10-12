package usecase

import (
	"context"
	"errors"
	"time"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/repository"

	"github.com/google/uuid"
)

type SavingUseCase struct {
	savingRepo  repository.SavingEntryRepository
	studentRepo repository.StudentRepository
}

func NewSavingUseCase(
	savingRepo repository.SavingEntryRepository,
	studentRepo repository.StudentRepository,
) *SavingUseCase {
	return &SavingUseCase{savingRepo, studentRepo}
}

type CreateEntryInput struct {
	StudentID  uuid.UUID        `json:"student_id" binding:"required"`
	Type       entity.EntryType `json:"type" binding:"required,oneof=deposit withdrawal"`
	Amount     int64            `json:"amount" binding:"required,min=1"`
	Note       string           `json:"note"`
	RecordedAt *time.Time       `json:"recorded_at"`
}

func (uc *SavingUseCase) CreateEntry(ctx context.Context, in CreateEntryInput) (*entity.SavingEntry, error) {
	if _, err := uc.studentRepo.FindByID(ctx, in.StudentID); err != nil {
		return nil, errors.New("student not found")
	}

	recordedAt := time.Now()
	if in.RecordedAt != nil {
		recordedAt = *in.RecordedAt
	}

	// Prevent negative balance on withdrawal
	if in.Type == entity.EntryWithdrawal {
		balance, err := uc.savingRepo.GetBalance(ctx, in.StudentID)
		if err != nil {
			return nil, err
		}
		if balance < in.Amount {
			return nil, errors.New("insufficient balance")
		}
	}

	entry := &entity.SavingEntry{
		StudentID:  in.StudentID,
		Type:       in.Type,
		Amount:     in.Amount,
		Note:       in.Note,
		RecordedAt: recordedAt,
	}
	return entry, uc.savingRepo.Create(ctx, entry)
}

func (uc *SavingUseCase) GetBalance(ctx context.Context, studentID uuid.UUID) (int64, error) {
	return uc.savingRepo.GetBalance(ctx, studentID)
}

type BalanceDetail struct {
	StudentID uuid.UUID                    `json:"student_id"`
	Balance   int64                        `json:"balance"`
	Entries   []entity.SavingEntry         `json:"entries"`
	Monthly   []repository.MonthlySummaryRow `json:"monthly_summary"`
}

func (uc *SavingUseCase) GetBalanceDetail(ctx context.Context, studentID uuid.UUID) (*BalanceDetail, error) {
	balance, err := uc.savingRepo.GetBalance(ctx, studentID)
	if err != nil {
		return nil, err
	}
	entries, err := uc.savingRepo.FindByStudent(ctx, studentID)
	if err != nil {
		return nil, err
	}
	monthly, err := uc.savingRepo.MonthlySummary(ctx, studentID)
	if err != nil {
		return nil, err
	}
	return &BalanceDetail{
		StudentID: studentID,
		Balance:   balance,
		Entries:   entries,
		Monthly:   monthly,
	}, nil
}

func (uc *SavingUseCase) ListByStudent(ctx context.Context, studentID uuid.UUID) ([]entity.SavingEntry, error) {
	return uc.savingRepo.FindByStudent(ctx, studentID)
}

func (uc *SavingUseCase) DeleteEntry(ctx context.Context, id uuid.UUID) error {
	if _, err := uc.savingRepo.FindByID(ctx, id); err != nil {
		return errors.New("entry not found")
	}
	return uc.savingRepo.Delete(ctx, id)
}

func (uc *SavingUseCase) UpdateEntry(ctx context.Context, id uuid.UUID, in CreateEntryInput) (*entity.SavingEntry, error) {
	e, err := uc.savingRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("entry not found")
	}
	if in.Amount > 0 {
		e.Amount = in.Amount
	}
	if in.Note != "" {
		e.Note = in.Note
	}
	if in.RecordedAt != nil {
		e.RecordedAt = *in.RecordedAt
	}
	return e, uc.savingRepo.Update(ctx, e)
}
