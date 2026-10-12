# TabunganSiswa — Sistem Manajemen Tabungan Siswa

> Prototyping sistem tracking berbasis web manajemen keuangan tabungan siswa yayasan sekolah dasar.

## Struktur Monorepo

```
capstoneProject/
├── backend/    ← Go REST API (Gin + GORM + PostgreSQL)
└── frontend/   ← React.js + Tailwind CSS + Vite
```

## Fitur

### Admin
- ✅ CRUD data siswa (tambah, lihat, edit, hapus)
- ✅ CRUD tabungan siswa (setoran & penarikan)
- ✅ Tracking balance aktif per siswa (balance / deficit)
- ✅ Ringkasan tabungan per bulan
- ✅ Review pengajuan penarikan dana (approve / reject)
- ✅ Hapus pengajuan pending

### Wali Murid
- ✅ Login dengan role wali
- ✅ Sync & lihat data siswa milik sendiri
- ✅ Lihat detail tabungan bulanan siswa
- ✅ Lihat status saldo & riwayat transaksi
- ✅ Ajukan pengajuan penarikan dana
- ✅ Tracking status pengajuan (pending / approved / rejected)
- ✅ Atur pengingat harian untuk menabung (07:00 WIB)

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env sesuai konfigurasi PostgreSQL
go run ./cmd/server
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend dev proxy otomatis forward `/api/*` ke `http://localhost:8080`.

## Arsitektur Backend (Clean Architecture)

```
entity (domain) → repository interface → usecase → handler → router
```

- **Domain layer**: entity, repository contracts, use cases — bebas dari framework
- **Infrastructure layer**: GORM repository implementations, scheduler
- **Delivery layer**: Gin HTTP handlers, middleware, router

## Role-Based Access Control

| Role | Akses |
|------|-------|
| `admin` | CRUD siswa, kelola tabungan, review pengajuan |
| `wali` | Lihat siswa sendiri, lihat tabungan, ajukan penarikan, atur reminder |

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Go, Gin, GORM, PostgreSQL, JWT, bcrypt, cron |
| Frontend | React 18, Vite, Tailwind CSS v4, Zustand, TanStack Query, Axios |
