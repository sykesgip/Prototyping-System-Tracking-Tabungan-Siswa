package scheduler

import (
	"context"
	"log"

	"tabungan-siswa/backend/internal/domain/usecase"

	"github.com/robfig/cron/v3"
)

type DailyReminderScheduler struct {
	uc   *usecase.ReminderUseCase
	cron *cron.Cron
}

func NewDailyReminderScheduler(uc *usecase.ReminderUseCase) *DailyReminderScheduler {
	return &DailyReminderScheduler{uc: uc, cron: cron.New()}
}

// Start registers the daily 07:00 WIB (UTC+7) job.
func (s *DailyReminderScheduler) Start() {
	// 0 0 7 * * * = every day at 07:00 (server time — set TZ=Asia/Jakarta)
	s.cron.AddFunc("0 7 * * *", func() {
		ctx := context.Background()
		reminders, err := s.uc.ListActive(ctx)
		if err != nil {
			log.Printf("[Reminder] error fetching reminders: %v", err)
			return
		}
		for _, r := range reminders {
			// In production this would send push notification / email / SMS.
			// For the prototype we log it and expose it via the GET /wali/reminder API.
			log.Printf("[Reminder] wali_id=%s message=%q", r.WaliID, r.Message)
		}
	})
	s.cron.Start()
	log.Println("[Scheduler] daily reminder scheduler started")
}

func (s *DailyReminderScheduler) Stop() {
	s.cron.Stop()
}
