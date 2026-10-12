package handler

import (
	"tabungan-siswa/backend/internal/domain/usecase"
	"tabungan-siswa/backend/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SavingHandler struct {
	uc *usecase.SavingUseCase
}

func NewSavingHandler(uc *usecase.SavingUseCase) *SavingHandler {
	return &SavingHandler{uc}
}

// GET /api/students/:id/savings
func (h *SavingHandler) ListByStudent(c *gin.Context) {
	studentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid student id")
		return
	}
	entries, err := h.uc.ListByStudent(c.Request.Context(), studentID)
	if err != nil {
		response.InternalError(c, err)
		return
	}
	response.OK(c, entries)
}

// GET /api/students/:id/savings/balance
func (h *SavingHandler) Balance(c *gin.Context) {
	studentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid student id")
		return
	}
	detail, err := h.uc.GetBalanceDetail(c.Request.Context(), studentID)
	if err != nil {
		response.InternalError(c, err)
		return
	}
	response.OK(c, detail)
}

// POST /api/savings
func (h *SavingHandler) Create(c *gin.Context) {
	var in usecase.CreateEntryInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	entry, err := h.uc.CreateEntry(c.Request.Context(), in)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Created(c, entry)
}

// PUT /api/savings/:id
func (h *SavingHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	var in usecase.CreateEntryInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	entry, err := h.uc.UpdateEntry(c.Request.Context(), id, in)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}
	response.OK(c, entry)
}

// DELETE /api/savings/:id
func (h *SavingHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	if err := h.uc.DeleteEntry(c.Request.Context(), id); err != nil {
		response.NotFound(c, err.Error())
		return
	}
	response.NoContent(c)
}
