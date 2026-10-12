package usecase

import (
	"context"
	"errors"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/repository"

	"github.com/google/uuid"
)

type StudentUseCase struct {
	studentRepo repository.StudentRepository
}

func NewStudentUseCase(studentRepo repository.StudentRepository) *StudentUseCase {
	return &StudentUseCase{studentRepo}
}

type CreateStudentInput struct {
	NIS    string    `json:"nis" binding:"required"`
	Name   string    `json:"name" binding:"required"`
	Class  string    `json:"class" binding:"required"`
	WaliID uuid.UUID `json:"wali_id" binding:"required"`
}

func (uc *StudentUseCase) Create(ctx context.Context, in CreateStudentInput) (*entity.Student, error) {
	existing, _ := uc.studentRepo.FindByNIS(ctx, in.NIS)
	if existing != nil && existing.ID.String() != "" {
		return nil, errors.New("NIS already registered")
	}
	s := &entity.Student{NIS: in.NIS, Name: in.Name, Class: in.Class, WaliID: in.WaliID}
	return s, uc.studentRepo.Create(ctx, s)
}

func (uc *StudentUseCase) GetByID(ctx context.Context, id uuid.UUID) (*entity.Student, error) {
	return uc.studentRepo.FindByID(ctx, id)
}

func (uc *StudentUseCase) ListAll(ctx context.Context) ([]entity.Student, error) {
	return uc.studentRepo.List(ctx)
}

func (uc *StudentUseCase) ListByWali(ctx context.Context, waliID uuid.UUID) ([]entity.Student, error) {
	return uc.studentRepo.FindByWali(ctx, waliID)
}

type UpdateStudentInput struct {
	NIS   string `json:"nis"`
	Name  string `json:"name"`
	Class string `json:"class"`
}

func (uc *StudentUseCase) Update(ctx context.Context, id uuid.UUID, in UpdateStudentInput) (*entity.Student, error) {
	s, err := uc.studentRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("student not found")
	}
	if in.NIS != "" {
		s.NIS = in.NIS
	}
	if in.Name != "" {
		s.Name = in.Name
	}
	if in.Class != "" {
		s.Class = in.Class
	}
	return s, uc.studentRepo.Update(ctx, s)
}

func (uc *StudentUseCase) Delete(ctx context.Context, id uuid.UUID) error {
	if _, err := uc.studentRepo.FindByID(ctx, id); err != nil {
		return errors.New("student not found")
	}
	return uc.studentRepo.Delete(ctx, id)
}
