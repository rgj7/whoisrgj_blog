import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const loggedIn = localStorage.getItem('logged_in')
  if (!loggedIn) {
    return <Navigate to="/login" replace />
  }
  return children
}
