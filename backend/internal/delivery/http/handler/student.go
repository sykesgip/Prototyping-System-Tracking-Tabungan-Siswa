package handler

import (
	"tabungan-siswa/backend/internal/delivery/http/middleware"
	"tabungan-siswa/backend/internal/domain/usecase"
	"tabungan-siswa/backend/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type StudentHandler struct {
	uc *usecase.StudentUseCase
}

func NewStudentHandler(uc *usecase.StudentUseCase) *StudentHandler {
	return &StudentHandler{uc}
}

// GET /api/students
func (h *StudentHandler) List(c *gin.Context) {
	students, err := h.uc.ListAll(c.Request.Context())
	if err != nil {
		response.InternalError(c, err)
		return
	}
	response.OK(c, students)
}

// GET /api/wali/students — wali sees only their own students
func (h *StudentHandler) ListByWali(c *gin.Context) {
	waliID := middleware.CurrentUserID(c)
	students, err := h.uc.ListByWali(c.Request.Context(), waliID)
	if err != nil {
		response.InternalError(c, err)
		return
	}
	response.OK(c, students)
}

// GET /api/students/:id
func (h *StudentHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	s, err := h.uc.GetByID(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "student not found")
		return
	}
	response.OK(c, s)
}

// POST /api/students
func (h *StudentHandler) Create(c *gin.Context) {
	var in usecase.CreateStudentInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	s, err := h.uc.Create(c.Request.Context(), in)
	if err != nil {
		response.Conflict(c, err.Error())
		return
	}
	response.Created(c, s)
}

// PUT /api/students/:id
func (h *StudentHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	var in usecase.UpdateStudentInput
	if err := c.ShouldBindJSON(&in); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	s, err := h.uc.Update(c.Request.Context(), id, in)
	if err != nil {
		response.NotFound(c, err.Error())
		return
	}
	response.OK(c, s)
}

// DELETE /api/students/:id
func (h *StudentHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "invalid id")
		return
	}
	if err := h.uc.Delete(c.Request.Context(), id); err != nil {
		response.NotFound(c, err.Error())
		return
	}
	response.NoContent(c)
}
