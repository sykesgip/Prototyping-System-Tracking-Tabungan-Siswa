package usecase

import (
	"context"
	"errors"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/repository"
	"tabungan-siswa/backend/pkg/hash"
	"tabungan-siswa/backend/pkg/token"
)

type AuthUseCase struct {
	userRepo repository.UserRepository
	tokens   *token.Manager
}

func NewAuthUseCase(userRepo repository.UserRepository, tokens *token.Manager) *AuthUseCase {
	return &AuthUseCase{userRepo, tokens}
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginOutput struct {
	Token string      `json:"token"`
	User  entity.User `json:"user"`
}

func (uc *AuthUseCase) Login(ctx context.Context, in LoginInput) (*LoginOutput, error) {
	user, err := uc.userRepo.FindByEmail(ctx, in.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	if !hash.Verify(user.Password, in.Password) {
		return nil, errors.New("invalid credentials")
	}
	t, err := uc.tokens.Generate(user.ID, user.Role)
	if err != nil {
		return nil, err
	}
	return &LoginOutput{Token: t, User: *user}, nil
}

type RegisterInput struct {
	Name     string      `json:"name" binding:"required"`
	Email    string      `json:"email" binding:"required,email"`
	Password string      `json:"password" binding:"required,min=6"`
	Role     entity.Role `json:"role"`
}

func (uc *AuthUseCase) Register(ctx context.Context, in RegisterInput) (*entity.User, error) {
	existing, _ := uc.userRepo.FindByEmail(ctx, in.Email)
	if existing != nil && existing.ID.String() != "" {
		return nil, errors.New("email already registered")
	}

	hashed, err := hash.Hash(in.Password)
	if err != nil {
		return nil, err
	}

	role := in.Role
	if role == "" {
		role = entity.RoleWali
	}

	user := &entity.User{
		Name:     in.Name,
		Email:    in.Email,
		Password: hashed,
		Role:     role,
	}
	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}
