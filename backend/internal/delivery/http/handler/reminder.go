package handler

import (
	"tabungan-siswa/backend/internal/delivery/http/middleware"
	"tabungan-siswa/backend/internal/domain/usecase"
	"tabungan-siswa/backend/pkg/response"

	"github.com/gin-gonic/gin"
)

type ReminderHandler struct {
	uc *usecase.ReminderUseCase
}

func NewReminderHandler(uc *usecase.ReminderUseCase) *ReminderHandler {
	return &ReminderHandler{uc}
}

// GET /api/wali/reminder
func (h *ReminderHandler) Get(c *gin.Context) {
	waliID := middleware.CurrentUserID(c)
	dr, err := h.uc.GetByWali(c.Request.Context(), waliID)
	if err != nil {
		response.NotFound(c, "reminder not set")
		return
	}
	response.OK(c, dr)
}

// PUT /api/wali/reminder
func (h *ReminderHandler) Upsert(c *gin.Context) {
	waliID := middleware.CurrentUserID(c)
	var in usecase.UpsertReminderInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	dr, err := h.uc.Upsert(c.Request.Context(), waliID, in)
	if err != nil {
		response.InternalError(c, err)
		return
	}
	response.OK(c, dr)
}
