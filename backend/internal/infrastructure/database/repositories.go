package database

import (
	"context"

	"tabungan-siswa/backend/internal/domain/entity"
	"tabungan-siswa/backend/internal/domain/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ----- User -----

type userRepo struct{ db *gorm.DB }

func NewUserRepository(db *gorm.DB) repository.UserRepository { return &userRepo{db} }

func (r *userRepo) Create(ctx context.Context, u *entity.User) error {
	return r.db.WithContext(ctx).Create(u).Error
}
func (r *userRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.User, error) {
	var u entity.User
	return &u, r.db.WithContext(ctx).First(&u, "id = ?", id).Error
}
func (r *userRepo) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	var u entity.User
	return &u, r.db.WithContext(ctx).Where("email = ?", email).First(&u).Error
}
func (r *userRepo) List(ctx context.Context) ([]entity.User, error) {
	var users []entity.User
	return users, r.db.WithContext(ctx).Find(&users).Error
}
func (r *userRepo) Update(ctx context.Context, u *entity.User) error {
	return r.db.WithContext(ctx).Save(u).Error
}
func (r *userRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entity.User{}, "id = ?", id).Error
}

// ----- Student -----

type studentRepo struct{ db *gorm.DB }

func NewStudentRepository(db *gorm.DB) repository.StudentRepository { return &studentRepo{db} }

func (r *studentRepo) Create(ctx context.Context, s *entity.Student) error {
	return r.db.WithContext(ctx).Create(s).Error
}
func (r *studentRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.Student, error) {
	var s entity.Student
	return &s, r.db.WithContext(ctx).Preload("Wali").First(&s, "id = ?", id).Error
}
func (r *studentRepo) FindByNIS(ctx context.Context, nis string) (*entity.Student, error) {
	var s entity.Student
	return &s, r.db.WithContext(ctx).Where("nis = ?", nis).First(&s).Error
}
func (r *studentRepo) FindByWali(ctx context.Context, waliID uuid.UUID) ([]entity.Student, error) {
	var students []entity.Student
	return students, r.db.WithContext(ctx).Where("wali_id = ?", waliID).Find(&students).Error
}
func (r *studentRepo) List(ctx context.Context) ([]entity.Student, error) {
	var students []entity.Student
	return students, r.db.WithContext(ctx).Preload("Wali").Find(&students).Error
}
func (r *studentRepo) Update(ctx context.Context, s *entity.Student) error {
	return r.db.WithContext(ctx).Save(s).Error
}
func (r *studentRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entity.Student{}, "id = ?", id).Error
}

// ----- SavingEntry -----

type savingEntryRepo struct{ db *gorm.DB }

func NewSavingEntryRepository(db *gorm.DB) repository.SavingEntryRepository {
	return &savingEntryRepo{db}
}

func (r *savingEntryRepo) Create(ctx context.Context, e *entity.SavingEntry) error {
	return r.db.WithContext(ctx).Create(e).Error
}
func (r *savingEntryRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.SavingEntry, error) {
	var e entity.SavingEntry
	return &e, r.db.WithContext(ctx).First(&e, "id = ?", id).Error
}
func (r *savingEntryRepo) FindByStudent(ctx context.Context, studentID uuid.UUID) ([]entity.SavingEntry, error) {
	var entries []entity.SavingEntry
	return entries, r.db.WithContext(ctx).
		Where("student_id = ?", studentID).
		Order("recorded_at desc").
		Find(&entries).Error
}
func (r *savingEntryRepo) GetBalance(ctx context.Context, studentID uuid.UUID) (int64, error) {
	var balance int64
	err := r.db.WithContext(ctx).
		Model(&entity.SavingEntry{}).
		Select("COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE -amount END), 0)").
		Where("student_id = ?", studentID).
		Scan(&balance).Error
	return balance, err
}
func (r *savingEntryRepo) MonthlySummary(ctx context.Context, studentID uuid.UUID) ([]repository.MonthlySummaryRow, error) {
	var rows []repository.MonthlySummaryRow
	err := r.db.WithContext(ctx).
		Model(&entity.SavingEntry{}).
		Select("EXTRACT(YEAR FROM recorded_at)::int AS year, EXTRACT(MONTH FROM recorded_at)::int AS month, SUM(CASE WHEN type = 'deposit' THEN amount ELSE -amount END) AS total").
		Where("student_id = ?", studentID).
		Group("year, month").
		Order("year desc, month desc").
		Scan(&rows).Error
	return rows, err
}
func (r *savingEntryRepo) Update(ctx context.Context, e *entity.SavingEntry) error {
	return r.db.WithContext(ctx).Save(e).Error
}
func (r *savingEntryRepo) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&entity.SavingEntry{}, "id = ?", id).Error
}

// ----- WithdrawalRequest -----

type withdrawalRequestRepo struct{ db *gorm.DB }

func NewWithdrawalRequestRepository(db *gorm.DB) repository.WithdrawalRequestRepository {
	return &withdrawalRequestRepo{db}
}

func (r *withdrawalRequestRepo) Create(ctx context.Context, req *entity.WithdrawalRequest) error {
	return r.db.WithContext(ctx).Create(req).Error
}
func (r *withdrawalRequestRepo) FindByID(ctx context.Context, id uuid.UUID) (*entity.WithdrawalRequest, error) {
	var req entity.WithdrawalRequest
	return &req, r.db.WithContext(ctx).
		Preload("Student").Preload("Requester").
		First(&req, "id = ?", id).Error
}
func (r *withdrawalRequestRepo) FindByStudent(ctx context.Context, studentID uuid.UUID) ([]entity.WithdrawalRequest, error) {
	var reqs []entity.WithdrawalRequest
	return reqs, r.db.WithContext(ctx).
		Where("student_id = ?", studentID).
		Order("created_at desc").
		Find(&reqs).Error
}
func (r *withdrawalRequestRepo) FindByRequester(ctx context.Context, requesterID uuid.UUID) ([]entity.WithdrawalRequest, error) {
	var reqs []entity.WithdrawalRequest
	return reqs, r.db.WithContext(ctx).
		Where("requested_by = ?", requesterID).
		Order("created_at desc").
		Find(&reqs).Error
}
func (r *withdrawalRequestRepo) List(ctx context.Context) ([]entity.WithdrawalRequest, error) {
	var reqs []entity.WithdrawalRequest
	return reqs, r.db.WithContext(ctx).
		Preload("Student").Preload("Requester").
		Order("created_at desc").
		Find(&reqs).Error
}
func (r *withdrawalRequestRepo) Update(ctx context.Context, req *entity.WithdrawalRequest) error {
	return r.db.WithContext(ctx).Save(req).Error
}

// ----- DailyReminder -----

type dailyReminderRepo struct{ db *gorm.DB }

func NewDailyReminderRepository(db *gorm.DB) repository.DailyReminderRepository {
	return &dailyReminderRepo{db}
}

func (r *dailyReminderRepo) Upsert(ctx context.Context, reminder *entity.DailyReminder) error {
	return r.db.WithContext(ctx).
		Where(entity.DailyReminder{WaliID: reminder.WaliID}).
		Assign(*reminder).
		FirstOrCreate(reminder).Error
}
func (r *dailyReminderRepo) FindByWali(ctx context.Context, waliID uuid.UUID) (*entity.DailyReminder, error) {
	var dr entity.DailyReminder
	return &dr, r.db.WithContext(ctx).Where("wali_id = ?", waliID).First(&dr).Error
}
func (r *dailyReminderRepo) ListActive(ctx context.Context) ([]entity.DailyReminder, error) {
	var reminders []entity.DailyReminder
	return reminders, r.db.WithContext(ctx).Where("is_active = true").Find(&reminders).Error
}
