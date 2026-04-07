import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import InternDashboard from './pages/InternDashboard'
import MentorDashboard from './pages/MentorDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ui/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/intern" element={
            <ProtectedRoute role="intern">
              <InternDashboard />
            </ProtectedRoute>
          } />
          <Route path="/mentor" element={
            <ProtectedRoute role="mentor">
              <MentorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager" element={
            <ProtectedRoute role="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
