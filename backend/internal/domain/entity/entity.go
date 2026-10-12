package entity

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	RoleAdmin Role = "admin"
	RoleWali  Role = "wali"
)

// User represents a system user (admin or wali murid).
type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	Role      Role           `gorm:"type:varchar(20);not null;default:'wali'" json:"role"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Students []Student `gorm:"foreignKey:WaliID" json:"students,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// Student represents a school student linked to a wali.
type Student struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	NIS       string         `gorm:"uniqueIndex;not null" json:"nis"`
	Name      string         `gorm:"not null" json:"name"`
	Class     string         `gorm:"not null" json:"class"`
	WaliID    uuid.UUID      `gorm:"type:uuid;not null" json:"wali_id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Wali         User          `gorm:"foreignKey:WaliID" json:"wali,omitempty"`
	SavingLedger []SavingEntry `gorm:"foreignKey:StudentID" json:"saving_ledger,omitempty"`
}

func (s *Student) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// SavingEntry records a single deposit or withdrawal for a student.
type EntryType string

const (
	EntryDeposit    EntryType = "deposit"
	EntryWithdrawal EntryType = "withdrawal"
)

type SavingEntry struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	StudentID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"student_id"`
	Type        EntryType  `gorm:"type:varchar(20);not null" json:"type"`
	Amount      int64      `gorm:"not null" json:"amount"` // in IDR cents (or whole IDR)
	Note        string     `json:"note"`
	RecordedAt  time.Time  `gorm:"not null" json:"recorded_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	Student Student `gorm:"foreignKey:StudentID" json:"student,omitempty"`
}

func (e *SavingEntry) BeforeCreate(tx *gorm.DB) error {
	if e.ID == uuid.Nil {
		e.ID = uuid.New()
	}
	return nil
}

// WithdrawalRequest tracks admin-managed withdrawal requests.
type RequestStatus string

const (
	StatusPending  RequestStatus = "pending"
	StatusApproved RequestStatus = "approved"
	StatusRejected RequestStatus = "rejected"
)

type WithdrawalRequest struct {
	ID          uuid.UUID     `gorm:"type:uuid;primaryKey" json:"id"`
	StudentID   uuid.UUID     `gorm:"type:uuid;not null;index" json:"student_id"`
	RequestedBy uuid.UUID     `gorm:"type:uuid;not null" json:"requested_by"` // wali user id
	Amount      int64         `gorm:"not null" json:"amount"`
	Reason      string        `json:"reason"`
	Status      RequestStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	ReviewedBy  *uuid.UUID    `gorm:"type:uuid" json:"reviewed_by,omitempty"`
	ReviewNote  string        `json:"review_note"`
	ReviewedAt  *time.Time    `json:"reviewed_at,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`

	Student   Student `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Requester User    `gorm:"foreignKey:RequestedBy" json:"requester,omitempty"`
}

func (w *WithdrawalRequest) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}

// DailyReminder stores per-wali daily reminder settings.
type DailyReminder struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	WaliID    uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"wali_id"`
	Message   string    `gorm:"not null" json:"message"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Wali User `gorm:"foreignKey:WaliID" json:"wali,omitempty"`
}

func (d *DailyReminder) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}
