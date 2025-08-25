import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dashboard as DashboardIcon,
  Key,
  Storage,
  TableChart,
  Visibility,
  Settings,
  Menu,
  Close,
  Notifications,
  Search,
  Person,
  Description,
  Security
} from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'

// Import user dashboard components
import UserOverview from './components/UserOverview'
import APIKeyManager from './components/APIKeyManager'
import MongoConnection from './components/MongoConnection'
import TablesManager from './components/TablesManager'
import DataViewer from './components/DataViewer'
import AccountSettings from './components/AccountSettings'
import APIDocumentation from './components/APIDocumentation'
import AuthManager from './components/AuthManager'

const UserDashboard = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'apikey', label: 'API Key', icon: Key },
    { id: 'mongodb', label: 'MongoDB Connection', icon: Storage },
    { id: 'tables', label: 'Tables', icon: TableChart },
    { id: 'auth', label: 'Authentication', icon: Security },
    { id: 'data', label: 'Data Viewer', icon: Visibility },
    { id: 'api-docs', label: 'API Documentation', icon: Description },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <UserOverview />
      case 'apikey':
        return <APIKeyManager />
      case 'mongodb':
        return <MongoConnection />
      case 'tables':
        return <TablesManager />
      case 'auth':
        return <AuthManager />
      case 'data':
        return <DataViewer />
      case 'api-docs':
        return <APIDocumentation />
      case 'settings':
        return <AccountSettings />
      default:
        return <UserOverview />
    }
  }

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <motion.div
        className={`fixed left-0 top-0 h-full bg-black text-white z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <DashboardIcon className="w-6 h-6 text-black" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="text-xl font-bold">SchemaCraft</h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setMobileMenuOpen(false)
              }}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-800 transition-colors relative group ${
                activeTab === item.id ? 'bg-gray-800 border-r-4 border-white' : ''
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <item.icon className="w-5 h-5 min-w-[20px]" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-3 overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Active indicator */}
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Top Navbar */}
        <motion.header
          className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-black" />
            </button>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <Close className="w-5 h-5 text-black" />
              ) : (
                <Menu className="w-5 h-5 text-black" />
              )}
            </button>

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent w-80"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Notifications className="w-5 h-5 text-black" />
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Person className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
                  >
                    <div className="py-2">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                      <hr className="my-2" />
                      <button 
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}

export default UserDashboard
