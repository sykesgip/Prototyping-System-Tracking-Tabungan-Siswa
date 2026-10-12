package usecase

import (
	"context"
	"errors"
	"time"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/repository"

	"github.com/google/uuid"
)

type WithdrawalUseCase struct {
	withdrawalRepo repository.WithdrawalRequestRepository
	savingRepo     repository.SavingEntryRepository
	studentRepo    repository.StudentRepository
}

func NewWithdrawalUseCase(
	withdrawalRepo repository.WithdrawalRequestRepository,
	savingRepo repository.SavingEntryRepository,
	studentRepo repository.StudentRepository,
) *WithdrawalUseCase {
	return &WithdrawalUseCase{withdrawalRepo, savingRepo, studentRepo}
}

type CreateWithdrawalInput struct {
	StudentID uuid.UUID `json:"student_id" binding:"required"`
	Amount    int64     `json:"amount" binding:"required,min=1"`
	Reason    string    `json:"reason"`
}

func (uc *WithdrawalUseCase) Create(ctx context.Context, requesterID uuid.UUID, in CreateWithdrawalInput) (*entity.WithdrawalRequest, error) {
	if _, err := uc.studentRepo.FindByID(ctx, in.StudentID); err != nil {
		return nil, errors.New("student not found")
	}

	balance, err := uc.savingRepo.GetBalance(ctx, in.StudentID)
	if err != nil {
		return nil, err
	}
	if balance < in.Amount {
		return nil, errors.New("insufficient balance")
	}

	req := &entity.WithdrawalRequest{
		StudentID:   in.StudentID,
		RequestedBy: requesterID,
		Amount:      in.Amount,
		Reason:      in.Reason,
		Status:      entity.StatusPending,
	}
	return req, uc.withdrawalRepo.Create(ctx, req)
}

func (uc *WithdrawalUseCase) ListAll(ctx context.Context) ([]entity.WithdrawalRequest, error) {
	return uc.withdrawalRepo.List(ctx)
}

func (uc *WithdrawalUseCase) ListByRequester(ctx context.Context, requesterID uuid.UUID) ([]entity.WithdrawalRequest, error) {
	return uc.withdrawalRepo.FindByRequester(ctx, requesterID)
}

type ReviewInput struct {
	Status     entity.RequestStatus `json:"status" binding:"required,oneof=approved rejected"`
	ReviewNote string               `json:"review_note"`
}

func (uc *WithdrawalUseCase) Review(ctx context.Context, adminID uuid.UUID, reqID uuid.UUID, in ReviewInput) (*entity.WithdrawalRequest, error) {
	req, err := uc.withdrawalRepo.FindByID(ctx, reqID)
	if err != nil {
		return nil, errors.New("request not found")
	}
	if req.Status != entity.StatusPending {
		return nil, errors.New("request already reviewed")
	}

	now := time.Now()
	req.Status = in.Status
	req.ReviewedBy = &adminID
	req.ReviewNote = in.ReviewNote
	req.ReviewedAt = &now

	if in.Status == entity.StatusApproved {
		// Book the withdrawal entry into saving ledger
		entry := &entity.SavingEntry{
			StudentID:  req.StudentID,
			Type:       entity.EntryWithdrawal,
			Amount:     req.Amount,
			Note:       "withdrawal request approved",
			RecordedAt: now,
		}
		if err := uc.savingRepo.Create(ctx, entry); err != nil {
			return nil, err
		}
	}

	return req, uc.withdrawalRepo.Update(ctx, req)
}

func (uc *WithdrawalUseCase) GetByID(ctx context.Context, id uuid.UUID) (*entity.WithdrawalRequest, error) {
	return uc.withdrawalRepo.FindByID(ctx, id)
}
