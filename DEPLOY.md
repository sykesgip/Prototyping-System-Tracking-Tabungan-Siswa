# TabunganSiswa — Deploy Guide

> Frontend → **Vercel** (static SPA)  
> Backend → **Railway** (Docker container)  
> Database → **Railway PostgreSQL** (managed)

---

## 1. Deploy Backend ke Railway

### 1a. Buat project di Railway
1. Buka [railway.app](https://railway.app) → **New Project**
2. Pilih **Deploy from GitHub repo** → pilih folder `backend/` (atau push ke repo terpisah)

### 1b. Tambah PostgreSQL
1. Di dalam project Railway → **Add Plugin → PostgreSQL**
2. Railway akan auto-inject `DATABASE_URL`. Kita akan pakai manual env vars.

### 1c. Set Environment Variables di Railway
Pergi ke tab **Variables** dan isi:

| Variable | Value |
|----------|-------|
| `APP_PORT` | `8080` |
| `APP_ENV` | `production` |
| `DB_HOST` | *(dari PostgreSQL plugin → Connect → Host)* |
| `DB_PORT` | `5432` |
| `DB_USER` | `postgres` |
| `DB_PASSWORD` | *(dari PostgreSQL plugin → Connect → Password)* |
| `DB_NAME` | `railway` |
| `JWT_SECRET` | *(string random panjang, min 32 karakter)* |
| `JWT_EXPIRY_HOURS` | `24` |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` *(isi setelah deploy Vercel)* |

### 1d. Set Root Directory
Di Railway → **Settings → Source** → set **Root Directory** = `backend`

### 1e. Railway akan build via Dockerfile otomatis
Railway deteksi `Dockerfile` dan build + deploy. Tunggu hingga status **Active**.

### 1f. Catat backend URL
Setelah deploy, Railway akan beri URL seperti:  
`https://tabungan-siswa-backend.up.railway.app`

---

## 2. Deploy Frontend ke Vercel

### 2a. Push ke GitHub
Pastikan folder `frontend/` ada di repo GitHub.

### 2b. Import di Vercel
1. Buka [vercel.com](https://vercel.com) → **New Project**
2. Import repo → set **Root Directory** = `frontend`
3. Framework preset: **Vite**

### 2c. Set Environment Variable
Di Vercel → **Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://tabungan-siswa-backend.up.railway.app` *(URL dari Railway)* |

### 2d. Deploy
Klik **Deploy**. Vercel build dan deploy otomatis.  
`vercel.json` sudah dikonfigurasi untuk SPA routing.

---

## 3. Update CORS di Railway

Setelah Vercel deploy, catat URL Vercel (misal `https://tabungan-siswa.vercel.app`).  
Kembali ke Railway → **Variables** → update `CORS_ALLOWED_ORIGINS`:
```
CORS_ALLOWED_ORIGINS=https://tabungan-siswa.vercel.app
```
Railway akan re-deploy otomatis.

---

## 4. Akun Demo

Setelah backend pertama kali boot, seed data otomatis dibuat:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@tabungan.id` | `admin123` |
| Wali Murid | `wali@tabungan.id` | `wali123` |

---

## 5. Checklist Deploy

- [ ] Railway project created
- [ ] PostgreSQL plugin added
- [ ] All env vars set di Railway
- [ ] Backend deployed & Active di Railway
- [ ] Vercel project created with Root Directory = `frontend`
- [ ] `VITE_API_URL` set di Vercel
- [ ] Frontend deployed di Vercel
- [ ] `CORS_ALLOWED_ORIGINS` updated di Railway dengan Vercel URL
- [ ] Login test dengan `admin@tabungan.id / admin123`

---

## 6. Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env   # isi kredensial PostgreSQL lokal
go run ./cmd/server    # → http://localhost:8080

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev            # → http://localhost:5173
# (Vite proxy /api → :8080, tidak perlu VITE_API_URL)
```
