import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Person,
  Security,
  Notifications,
  Palette,
  Storage,
  Api,
  Shield,
  Key,
  Save,
  Refresh,
  DarkMode,
  LightMode,
  Edit,
} from '@mui/icons-material'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: true
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Person },
    { id: 'security', label: 'Security', icon: Security },
    { id: 'notifications', label: 'Notifications', icon: Notifications },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'system', label: 'System', icon: Storage },
    { id: 'api', label: 'API Settings', icon: Api }
  ]

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
            A
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-gray-200 hover:bg-gray-50 transition-colors">
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Admin User</h3>
          <p className="text-gray-600">System Administrator</p>
          <button className="mt-2 text-black hover:text-gray-600 text-sm font-medium">Change Avatar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            defaultValue="Admin"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            defaultValue="User"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            defaultValue="admin@schemacraft.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            defaultValue="+1 (555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            rows={3}
            defaultValue="System administrator for SchemaCraft platform. Managing user accounts, API configurations, and system security."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-black" />
          <h4 className="font-medium text-black">Security Status</h4>
        </div>
        <p className="text-sm text-gray-600 mt-1">Your account security is good. Last password change: 45 days ago</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Authenticator App</p>
            <p className="text-sm text-gray-500">Use an app like Google Authenticator</p>
          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Enabled
          </button>
        </div>
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">SMS Authentication</p>
            <p className="text-sm text-gray-500">Receive codes via SMS</p>
          </div>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
            Disabled
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">API Keys</h4>
        <div className="space-y-3">
          {[
            { name: 'Admin API Key', key: 'sk_admin_xxxxxxxxxx', created: '2024-01-15', lastUsed: '2 hours ago' },
            { name: 'Backup API Key', key: 'sk_backup_xxxxxxxxx', created: '2024-02-01', lastUsed: '1 week ago' }
          ].map((apiKey, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{apiKey.name}</p>
                <p className="text-sm font-mono text-gray-500">{apiKey.key}</p>
                <p className="text-xs text-gray-400">Created: {apiKey.created} | Last used: {apiKey.lastUsed}</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <Key className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Security className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Generate New API Key
        </button>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Email Notifications</h4>
        {[
          { key: 'email', label: 'Email notifications', description: 'Receive notifications via email' },
          { key: 'marketing', label: 'Marketing emails', description: 'Receive product updates and marketing' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  [item.key]: e.target.checked
                }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">System Notifications</h4>
        {[
          { key: 'push', label: 'Push notifications', description: 'Receive browser push notifications' },
          { key: 'sms', label: 'SMS notifications', description: 'Receive notifications via SMS' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={notifications[item.key as keyof typeof notifications]}
                onChange={(e) => setNotifications(prev => ({
                  ...prev,
                  [item.key]: e.target.checked
                }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Theme</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            !darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setDarkMode(false)}>
            <div className="flex items-center space-x-3">
              <LightMode className="w-6 h-6 text-black" />
              <div>
                <p className="font-medium text-gray-900">Light Mode</p>
                <p className="text-sm text-gray-500">Clean and bright interface</p>
              </div>
            </div>
          </div>
          <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
            darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`} onClick={() => setDarkMode(true)}>
            <div className="flex items-center space-x-3">
              <DarkMode className="w-6 h-6 text-gray-700" />
              <div>
                <p className="font-medium text-gray-900">Dark Mode</p>
                <p className="text-sm text-gray-500">Easy on the eyes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Display Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="utc">UTC</option>
              <option value="est">Eastern Time</option>
              <option value="pst">Pacific Time</option>
              <option value="cet">Central European Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Storage className="w-5 h-5 text-black" />
          <h4 className="font-medium text-black">System Status</h4>
        </div>
        <p className="text-sm text-gray-600 mt-1">All systems operational. Last backup: 2 hours ago</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Database Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Database Size</span>
              <span className="text-sm font-medium text-gray-900">2.4 GB</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Active Connections</span>
              <span className="text-sm font-medium text-gray-900">24</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Performance</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">CPU Usage</span>
              <span className="text-sm font-medium text-black">23%</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="text-sm font-medium text-black">67%</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Storage Usage</span>
              <span className="text-sm font-medium text-gray-900">45%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">System Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Storage className="w-4 h-4" />
            <span>Backup Now</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Refresh className="w-4 h-4" />
            <span>Clear Cache</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors">
            <Security className="w-4 h-4" />
            <span>System Reset</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderAPISettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/minute)</label>
          <input
            type="number"
            defaultValue="1000"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max API Keys per User</label>
          <input
            type="number"
            defaultValue="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Default API Version</label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="v1">Version 1</option>
            <option value="v2">Version 2</option>
            <option value="v3">Version 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cache TTL (seconds)</label>
          <input
            type="number"
            defaultValue="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">API Features</h4>
        {[
          { label: 'Enable CORS', description: 'Allow cross-origin requests' },
          { label: 'Enable Swagger UI', description: 'Auto-generate API documentation' },
          { label: 'Enable Rate Limiting', description: 'Limit requests per user' },
          { label: 'Enable API Analytics', description: 'Track API usage and performance' }
        ].map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{feature.label}</p>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings()
      case 'security':
        return renderSecuritySettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'appearance':
        return renderAppearanceSettings()
      case 'system':
        return renderSystemSettings()
      case 'api':
        return renderAPISettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and system preferences.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </motion.div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gray-100 text-black border-r-2 border-black'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminSettings
