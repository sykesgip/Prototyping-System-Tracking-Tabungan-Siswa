package middleware

import (
	"strings"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/pkg/response"
	"tabungan-siswa/backend/pkg/token"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	ContextUserID = "userID"
	ContextRole   = "role"
)

func Auth(tm *token.Manager) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			response.Unauthorized(c)
			c.Abort()
			return
		}

		claims, err := tm.Verify(strings.TrimPrefix(header, "Bearer "))
		if err != nil {
			response.Unauthorized(c)
			c.Abort()
			return
		}

		c.Set(ContextUserID, claims.UserID)
		c.Set(ContextRole, claims.Role)
		c.Next()
	}
}

func RequireRole(roles ...entity.Role) gin.HandlerFunc {
	allowed := make(map[entity.Role]struct{}, len(roles))
	for _, r := range roles {
		allowed[r] = struct{}{}
	}
	return func(c *gin.Context) {
		role, _ := c.Get(ContextRole)
		r, ok := role.(entity.Role)
		if !ok {
			response.Forbidden(c)
			c.Abort()
			return
		}
		if _, ok := allowed[r]; !ok {
			response.Forbidden(c)
			c.Abort()
			return
		}
		c.Next()
	}
}

func CurrentUserID(c *gin.Context) uuid.UUID {
	id, _ := c.Get(ContextUserID)
	uid, _ := id.(uuid.UUID)
	return uid
}
