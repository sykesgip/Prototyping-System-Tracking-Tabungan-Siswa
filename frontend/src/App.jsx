import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { useAuthStore } from './store/authStore'

import LoginPage from './pages/auth/LoginPage'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import StudentsPage from './pages/admin/StudentsPage'
import SavingsPage from './pages/admin/SavingsPage'
import WithdrawalsPage from './pages/admin/WithdrawalsPage'

// Wali
import WaliDashboard from './pages/wali/WaliDashboard'
import WaliStudentsPage from './pages/wali/WaliStudentsPage'
import StudentDetailPage from './pages/wali/StudentDetailPage'
import WaliWithdrawalsPage from './pages/wali/WaliWithdrawalsPage'
import ReminderPage from './pages/wali/ReminderPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function AdminRoutes() {
  return (
    <ProtectedRoute role="admin">
      <AppLayout role="admin">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="savings" element={<SavingsPage />} />
          <Route path="withdrawals" element={<WithdrawalsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  )
}

function WaliRoutes() {
  return (
    <ProtectedRoute role="wali">
      <AppLayout role="wali">
        <Routes>
          <Route index element={<WaliDashboard />} />
          <Route path="students" element={<WaliStudentsPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="withdrawals" element={<WaliWithdrawalsPage />} />
          <Route path="reminder" element={<ReminderPage />} />
          <Route path="*" element={<Navigate to="/wali" replace />} />
        </Routes>
      </AppLayout>
    </ProtectedRoute>
  )
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/wali'} replace />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/wali/*" element={<WaliRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
