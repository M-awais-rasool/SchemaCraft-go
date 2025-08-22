import { BrowserRouter as Router, Routes, Route,  } from 'react-router-dom'

// Pages
import LandingPage from './pages/auth/LandingPage'

import './App.css'

function App() {
  return (
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              
            </Routes>
          </div>
        </Router>
  )
}

export default App
