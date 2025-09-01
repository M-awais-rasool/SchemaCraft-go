import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Storage,
  CheckCircle,
  Error as ErrorIcon,
  Visibility,
  VisibilityOff,
  Save,
  Refresh,
  Info
} from '@mui/icons-material'
import { AuthService } from '../../../services/authService'
import NotificationService from '../../../services/notificationService'
import { useAuth } from '../../../contexts/AuthContext'

const MongoConnection = () => {
  const { user, updateUser } = useAuth()
  const [mongoUri, setMongoUri] = useState('')
  const [databaseName, setDatabaseName] = useState('')
  const [showUri, setShowUri] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
 
  // Initialize form with existing user data
  useEffect(() => {
    if (user?.mongodb_uri) {
      setMongoUri(user.mongodb_uri)
      setConnectionStatus('connected')
    }
    if (user?.database_name) {
      setDatabaseName(user.database_name)
    }
  }, [user])

  const handleTestConnection = async () => {
    if (!mongoUri.trim() || !databaseName.trim()) {
      setError('Please enter both MongoDB URI and database name')
      return
    }
    
    setIsLoading(true)
    setConnectionStatus('connecting')
    setError(null)
    
    try {
      // Test the connection using the new test endpoint
      const result = await NotificationService.testMongoConnection(mongoUri, databaseName)
      
      if (result.connected) {
        setConnectionStatus('connected')
        setError(null)
      } else {
        setConnectionStatus('error')
        setError(result.error || 'Connection failed')
      }
    } catch (err: any) {
      console.error('MongoDB connection test failed:', err)
      setConnectionStatus('error')
      setError(err.response?.data?.error || 'Failed to connect to MongoDB')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (connectionStatus !== 'connected') {
      setError('Please test the connection first')
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      
      // Save the MongoDB URI using the original endpoint
      await AuthService.updateMongoURI(mongoUri, databaseName)
      
      // Update user context
      await updateUser()
      
      alert('MongoDB connection saved successfully!')
    } catch (err: any) {
      console.error('Failed to save MongoDB connection:', err)
      setError('Failed to save MongoDB connection')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-black" />
      case 'error':
        return <ErrorIcon className="w-5 h-5 text-black" />
      case 'connecting':
        return <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      default:
        return <Storage className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected successfully'
      case 'error':
        return 'Connection failed'
      case 'connecting':
        return 'Testing connection...'
      default:
        return 'Not connected'
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-black'
      case 'error':
        return 'text-black'
      case 'connecting':
        return 'text-black'
      default:
        return 'text-gray-500'
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
          <h1 className="text-2xl font-bold text-gray-900">MongoDB Connection</h1>
          <p className="text-gray-600 mt-1">Connect your MongoDB database to start building APIs</p>
        </div>
      </motion.div>

      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-black">
              <Storage className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Database Status</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>
          {connectionStatus === 'connected' && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
              <CheckCircle className="w-4 h-4 text-black" />
              <span className="text-sm font-medium text-black">Active</span>
            </div>
          )}
        </div>

        {connectionStatus === 'connected' && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">Connection Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="font-mono text-gray-900">{databaseName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="text-gray-900">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="text-gray-900">{user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <ErrorIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Connection Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">MongoDB Connection String</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Connection URI
            </label>
            <div className="relative">
              <input
                type={showUri ? "text" : "password"}
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                placeholder="mongodb+srv://username:password@cluster.mongodb.net/"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                onClick={() => setShowUri(!showUri)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showUri ? <VisibilityOff className="w-5 h-5" /> : <Visibility className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Database Name
            </label>
            <input
              type="text"
              value={databaseName}
              onChange={(e) => setDatabaseName(e.target.value)}
              placeholder="mydatabase"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTestConnection}
              disabled={!mongoUri.trim() || !databaseName.trim() || isLoading}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Refresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Testing...' : 'Test Connection'}</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={connectionStatus !== 'connected' || isSaving}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Connection'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Setup Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Info className="w-6 h-6 text-black" />
          <h2 className="text-lg font-semibold text-gray-900">Setup Instructions</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create a MongoDB Account</h3>
              <p className="text-sm text-gray-600">
                Sign up for a free MongoDB Atlas account at{' '}
                <a href="#" className="text-black hover:underline">mongodb.com/atlas</a>
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Create a Cluster</h3>
              <p className="text-sm text-gray-600">
                Set up a new cluster in your preferred region. The free tier is perfect for getting started.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Get Connection String</h3>
              <p className="text-sm text-gray-600">
                Click "Connect" → "Connect your application" → Copy the connection string and paste it above.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
              4
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Configure Access</h3>
              <p className="text-sm text-gray-600">
                Make sure to whitelist your IP address and create a database user with appropriate permissions.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Example Connection String */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Example Connection String</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-gray-100 text-sm">
{`mongodb+srv://username:password@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority`}
          </pre>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Replace <code className="bg-gray-100 px-1 rounded">username</code>, <code className="bg-gray-100 px-1 rounded">password</code>, 
          and <code className="bg-gray-100 px-1 rounded">mydatabase</code> with your actual credentials.
        </p>
      </motion.div>
    </div>
  )
}

export default MongoConnection
