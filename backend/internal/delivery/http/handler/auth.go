package handler

import (
	"tabungan-siswa/backend/internal/domain/usecase"
	"tabungan-siswa/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	uc *usecase.AuthUseCase
}

func NewAuthHandler(uc *usecase.AuthUseCase) *AuthHandler {
	return &AuthHandler{uc}
}

// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var in usecase.LoginInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	out, err := h.uc.Login(c.Request.Context(), in)
	if err != nil {
		response.Unauthorized(c)
		return
	}
	response.OK(c, out)
}

// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var in usecase.RegisterInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	user, err := h.uc.Register(c.Request.Context(), in)
	if err != nil {
		response.Conflict(c, err.Error())
		return
	}
	response.Created(c, user)
}
