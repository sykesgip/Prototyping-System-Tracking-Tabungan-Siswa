package database

import (
	"log"

	"tabungan-siswa/backend/internal/domain/entity"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewPostgres(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	if err := autoMigrate(db); err != nil {
		return nil, err
	}

	log.Println("[DB] connected and migrated")
	return db, nil
}

func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&entity.User{},
		&entity.Student{},
		&entity.SavingEntry{},
		&entity.WithdrawalRequest{},
		&entity.DailyReminder{},
	)
}
