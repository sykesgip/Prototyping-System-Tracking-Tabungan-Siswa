package router

import (
	"net/http"
	"strings"

	"tabungan-siswa/backend/internal/delivery/http/handler"
	"tabungan-siswa/backend/internal/delivery/http/middleware"
	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/pkg/token"

	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth       *handler.AuthHandler
	Student    *handler.StudentHandler
	Saving     *handler.SavingHandler
	Withdrawal *handler.WithdrawalHandler
	Reminder   *handler.ReminderHandler
}

// Setup wires all routes.
// staticDir: path to the built frontend dist folder (empty = API-only mode).
func Setup(tm *token.Manager, allowedOrigins string, staticDir string, h Handlers) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	// CORS only needed when frontend is on a different origin (dev proxy / Vercel).
	// When serving static from the same Go process CORS is a no-op but kept for flexibility.
	if allowedOrigins != "" {
		r.Use(corsMiddleware(allowedOrigins))
	}

	api := r.Group("/api")

	// Health check (Railway, uptime monitors)
	api.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Public
	auth := api.Group("/auth")
	{
		auth.POST("/login", h.Auth.Login)
		auth.POST("/register", h.Auth.Register)
	}

	// Authenticated
	protected := api.Group("/")
	protected.Use(middleware.Auth(tm))

	// Admin routes
	admin := protected.Group("/")
	admin.Use(middleware.RequireRole(entity.RoleAdmin))
	{
		admin.GET("/students", h.Student.List)
		admin.POST("/students", h.Student.Create)
		admin.PUT("/students/:id", h.Student.Update)
		admin.DELETE("/students/:id", h.Student.Delete)

		admin.POST("/savings", h.Saving.Create)
		admin.PUT("/savings/:id", h.Saving.Update)
		admin.DELETE("/savings/:id", h.Saving.Delete)

		admin.GET("/withdrawals", h.Withdrawal.ListAll)
		admin.GET("/withdrawals/:id", h.Withdrawal.Get)
		admin.PATCH("/withdrawals/:id/review", h.Withdrawal.Review)
		admin.DELETE("/withdrawals/:id", h.Withdrawal.AdminDelete)
	}

	// Shared: any authenticated user can view a student's savings/balance
	protected.GET("/students/:id", h.Student.Get)
	protected.GET("/students/:id/savings", h.Saving.ListByStudent)
	protected.GET("/students/:id/savings/balance", h.Saving.Balance)

	// Wali routes
	wali := protected.Group("/wali")
	wali.Use(middleware.RequireRole(entity.RoleWali))
	{
		wali.GET("/students", h.Student.ListByWali)
		wali.GET("/withdrawals", h.Withdrawal.ListByWali)
		wali.POST("/withdrawals", h.Withdrawal.Create)
		wali.GET("/reminder", h.Reminder.Get)
		wali.PUT("/reminder", h.Reminder.Upsert)
	}

	// Serve compiled React SPA — all non-/api routes fall through to index.html
	if staticDir != "" {
		r.Static("/assets", staticDir+"/assets")
		r.StaticFile("/favicon.svg", staticDir+"/favicon.svg")
		// Catch-all: return index.html so React Router handles client-side navigation
		r.NoRoute(func(c *gin.Context) {
			if !strings.HasPrefix(c.Request.URL.Path, "/api") {
				c.File(staticDir + "/index.html")
				return
			}
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		})
	}

	return r
}

func corsMiddleware(allowedOrigins string) gin.HandlerFunc {
	origins := strings.Split(allowedOrigins, ",")
	set := make(map[string]struct{}, len(origins))
	for _, o := range origins {
		set[strings.TrimSpace(o)] = struct{}{}
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if _, ok := set[origin]; ok {
			c.Header("Access-Control-Allow-Origin", origin)
		}
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization,Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}
