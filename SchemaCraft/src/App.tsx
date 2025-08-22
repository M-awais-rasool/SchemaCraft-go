import { BrowserRouter as Router, Routes, Route,  } from 'react-router-dom'

// Pages
import LandingPage from './pages/auth/LandingPage'
import LoginScreen from './pages/auth/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserDashboard from './pages/user/UserDashboard'

function App() {
  return (
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/user" element={<UserDashboard />} />

            </Routes>
          </div>
        </Router>
  )
}

export default App
