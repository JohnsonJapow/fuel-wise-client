import { Routes, Route, Navigate } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Register } from './pages/Register'
import { Login } from './pages/Login'
import { VerifyEmail } from './pages/VerifyEmail'
import { Dashboard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
