package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"tabungan-siswa/backend/internal/config"
	"tabungan-siswa/backend/internal/delivery/http/handler"
	"tabungan-siswa/backend/internal/delivery/http/router"
	"tabungan-siswa/backend/internal/domain/usecase"
	"tabungan-siswa/backend/internal/infrastructure/database"
	"tabungan-siswa/backend/internal/infrastructure/scheduler"
	"tabungan-siswa/backend/internal/infrastructure/seed"
	"tabungan-siswa/backend/pkg/token"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	db, err := database.NewPostgres(cfg.DBDsn)
	if err != nil {
		log.Fatalf("database: %v", err)
	}

	// Repositories
	userRepo := database.NewUserRepository(db)
	studentRepo := database.NewStudentRepository(db)
	savingRepo := database.NewSavingEntryRepository(db)
	withdrawalRepo := database.NewWithdrawalRequestRepository(db)
	reminderRepo := database.NewDailyReminderRepository(db)

	// Seed default data (idempotent)
	seed.Run(context.Background(), userRepo, studentRepo, savingRepo)

	// Token manager
	tm := token.NewManager(cfg.JWTSecret, cfg.JWTExpiryHours)

	// Use cases
	authUC := usecase.NewAuthUseCase(userRepo, tm)
	studentUC := usecase.NewStudentUseCase(studentRepo)
	savingUC := usecase.NewSavingUseCase(savingRepo, studentRepo)
	withdrawalUC := usecase.NewWithdrawalUseCase(withdrawalRepo, savingRepo, studentRepo)
	reminderUC := usecase.NewReminderUseCase(reminderRepo)

	// Handlers
	handlers := router.Handlers{
		Auth:       handler.NewAuthHandler(authUC),
		Student:    handler.NewStudentHandler(studentUC),
		Saving:     handler.NewSavingHandler(savingUC),
		Withdrawal: handler.NewWithdrawalHandler(withdrawalUC),
		Reminder:   handler.NewReminderHandler(reminderUC),
	}

	// Scheduler
	sched := scheduler.NewDailyReminderScheduler(reminderUC)
	sched.Start()
	defer sched.Stop()

	// Router — serve frontend dist if STATIC_DIR env var is set
	engine := router.Setup(tm, cfg.CORSAllowedOrigins, cfg.StaticDir, handlers)

	srv := &http.Server{
		Addr:    ":" + cfg.AppPort,
		Handler: engine,
	}

	go func() {
		log.Printf("[Server] listening on :%s", cfg.AppPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("graceful shutdown: %v", err)
	}
	log.Println("[Server] shutdown complete")
}
