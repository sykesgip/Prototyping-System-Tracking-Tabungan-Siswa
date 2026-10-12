package handler

import (
	"tabungan-siswa/backend/internal/delivery/http/middleware"
	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/usecase"
	"tabungan-siswa/backend/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WithdrawalHandler struct {
	uc *usecase.WithdrawalUseCase
}

func NewWithdrawalHandler(uc *usecase.WithdrawalUseCase) *WithdrawalHandler {
	return &WithdrawalHandler{uc}
}

// GET /api/withdrawals — admin only
func (h *WithdrawalHandler) ListAll(c *gin.Context) {
	reqs, err := h.uc.ListAll(c.Request.Context())
	if err != nil {
		response.InternalError(c, err)
		return
	}
	response.OK(c, reqs)
}

// GET /api/wali/withdrawals — wali sees their own requests
func (h *WithdrawalHandler) ListByWali(c *gin.Context) {
	waliID := middleware.CurrentUserID(c)
	reqs, err := h.uc.ListByRequester(c.Request.Context(), waliID)
	if err != nil {
		response.InternalError(c, err)
		return
	}
	response.OK(c, reqs)
}

// GET /api/withdrawals/:id
func (h *WithdrawalHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	req, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "not found")
		return
	}
	response.OK(c, req)
}

// POST /api/withdrawals — wali creates request
func (h *WithdrawalHandler) Create(c *gin.Context) {
	waliID := middleware.CurrentUserID(c)
	var in usecase.CreateWithdrawalInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	req, err := h.uc.Create(c.Request.Context(), waliID, in)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Created(c, req)
}

// PATCH /api/withdrawals/:id/review — admin reviews
func (h *WithdrawalHandler) Review(c *gin.Context) {
	adminID := middleware.CurrentUserID(c)
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	var in usecase.ReviewInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	req, err := h.uc.Review(c.Request.Context(), adminID, id, in)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.OK(c, req)
}

// DELETE /api/withdrawals/:id — admin only
func (h *WithdrawalHandler) AdminDelete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	req, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "not found")
		return
	}
	if req.Status != entity.StatusPending {
		response.BadRequest(c, "only pending requests can be deleted")
		return
	}
	response.NoContent(c)
}
