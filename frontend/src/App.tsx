import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import GuestRoute from './components/GuestRoute'
import ProtectedLayout from './components/ProtectedLayout'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Route>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
