import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  // Block pending/banned users from protected routes
  if (user.status === 'pending') return <Navigate to="/login" replace />
  if (user.status === 'banned') return <Navigate to="/login" replace />
  return children
}
