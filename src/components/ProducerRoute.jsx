import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProducerRoute() {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (role !== 'PRODUCER') return <Navigate to="/catalogue" replace />
  return <Outlet />
}