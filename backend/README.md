# Tabungan Siswa — Backend

REST API for Student Savings Management System built with Go, Gin, GORM, and PostgreSQL.

## Stack
- **Go 1.21+**
- **Gin** — HTTP framework
- **GORM + PostgreSQL** — ORM & database
- **JWT** — Authentication
- **Cron** — Daily reminder scheduler

## Architecture
Clean Architecture: `entity → repository interface → usecase → handler → router`

```
cmd/server/          ← entrypoint
internal/
  config/            ← env config loader
  domain/
    entity/          ← domain models (User, Student, SavingEntry, WithdrawalRequest, DailyReminder)
    repository/      ← repository interfaces
    usecase/         ← business logic (auth, student, saving, withdrawal, reminder)
  delivery/http/
    handler/         ← HTTP handlers (thin — delegate to usecase)
    middleware/       ← JWT auth + RBAC middleware
    router/          ← route wiring + CORS
  infrastructure/
    database/        ← GORM implementations of all repositories
    scheduler/       ← cron-based daily reminder
pkg/
  hash/              ← bcrypt wrapper
  token/             ← JWT manager
  response/          ← standardised JSON envelope
```

## Setup

```bash
cp .env.example .env
# edit .env with your Postgres credentials

go run ./cmd/server
```

## API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/register` | Public | Register |
| GET | `/api/students` | Admin | List all students |
| POST | `/api/students` | Admin | Create student |
| PUT | `/api/students/:id` | Admin | Update student |
| DELETE | `/api/students/:id` | Admin | Delete student |
| GET | `/api/students/:id` | Auth | Get student detail |
| GET | `/api/students/:id/savings` | Auth | List saving entries |
| GET | `/api/students/:id/savings/balance` | Auth | Balance + monthly summary |
| POST | `/api/savings` | Admin | Add saving entry |
| PUT | `/api/savings/:id` | Admin | Update saving entry |
| DELETE | `/api/savings/:id` | Admin | Delete saving entry |
| GET | `/api/withdrawals` | Admin | List all withdrawal requests |
| GET | `/api/withdrawals/:id` | Admin | Get withdrawal request |
| PATCH | `/api/withdrawals/:id/review` | Admin | Approve / reject request |
| DELETE | `/api/withdrawals/:id` | Admin | Delete pending request |
| GET | `/api/wali/students` | Wali | My students |
| GET | `/api/wali/withdrawals` | Wali | My withdrawal requests |
| POST | `/api/wali/withdrawals` | Wali | Submit withdrawal request |
| GET | `/api/wali/reminder` | Wali | Get my reminder setting |
| PUT | `/api/wali/reminder` | Wali | Set my reminder |
