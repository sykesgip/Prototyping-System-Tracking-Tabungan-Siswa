# Tabungan Siswa — Frontend

Web application for Student Savings Management System built with React.js, Tailwind CSS, and Vite.

## Stack
- **React 18** + **Vite** — UI framework & build tool
- **Tailwind CSS v4** — Utility-first styling
- **React Router v6** — Client-side routing
- **TanStack Query** — Server state management
- **Zustand** — Client state (auth)
- **Axios** — HTTP client
- **react-hot-toast** — Notifications
- **lucide-react** — Icons

## Architecture
```
src/
  api/
    axios.js          ← Axios instance with JWT interceptor
    endpoints.js      ← Typed API functions per domain
  store/
    authStore.js      ← Zustand persisted auth state
  components/
    ui/               ← Reusable primitives (Button, Card, Modal, Badge, Spinner, FormField)
    layout/           ← AppLayout, Sidebar, ProtectedRoute
  pages/
    auth/             ← LoginPage
    admin/            ← AdminDashboard, StudentsPage, SavingsPage, WithdrawalsPage
    wali/             ← WaliDashboard, WaliStudentsPage, StudentDetailPage, WaliWithdrawalsPage, ReminderPage
  utils/
    format.js         ← Rupiah, date, status formatters
```

## Role-based routing
| Path | Role | Description |
|------|------|-------------|
| `/login` | Public | Login |
| `/admin` | Admin | Dashboard |
| `/admin/students` | Admin | Manage students |
| `/admin/savings` | Admin | Manage saving entries + balance tracking |
| `/admin/withdrawals` | Admin | Review withdrawal requests |
| `/wali` | Wali | Dashboard |
| `/wali/students` | Wali | My children |
| `/wali/students/:id` | Wali | Student saving detail + monthly summary |
| `/wali/withdrawals` | Wali | Submit & track withdrawal requests |
| `/wali/reminder` | Wali | Daily reminder settings |

## Setup

```bash
cp .env.example .env  # optional, proxy handles API routing
npm install
npm run dev
```

The Vite dev proxy forwards `/api/*` → `http://localhost:8080`.
