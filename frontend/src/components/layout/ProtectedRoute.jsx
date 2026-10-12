import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute({ children, role }) {
  const { token, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/wali'} replace />
  }
  return children
}
