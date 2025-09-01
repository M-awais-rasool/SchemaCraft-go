import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Key,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Refresh,
  Security,
  Warning,
  CheckCircle
} from '@mui/icons-material'
import { UserService } from '../../../services/userService'
import { useAuth } from '../../../contexts/AuthContext'
 
const APIKeyManager = () => {
  const { user, updateUser } = useAuth()
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiKey = user?.api_key || ''
  const maskedKey = apiKey ? `${apiKey.substring(0, 8)}•••••••••••••••••••••••••••••••••••••` : ''

  const handleCopy = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true)
      setError(null)
      const response = await UserService.regenerateAPIKey()
      
      // Update user data
      await updateUser()
      
      setShowRegenerateModal(false)
      alert(`API Key regenerated successfully!\nNew key: ${response.api_key}`)
    } catch (err: any) {
      console.error('Failed to regenerate API key:', err)
      setError(err.response?.data?.error || 'Failed to regenerate API key')
    } finally {
      setIsRegenerating(false)
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
          <h1 className="text-2xl font-bold text-gray-900">API Key Management</h1>
          <p className="text-gray-600 mt-1">Manage your authentication credentials for API access</p>
        </div>
      </motion.div>

      {/* Main API Key Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-lg bg-black">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your API Key</h2>
            <p className="text-sm text-gray-600">Use this key to authenticate your API requests</p>
          </div>
        </div>

        {/* API Key Display */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex items-center space-x-3">
                <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">
                  {showKey ? apiKey : maskedKey}
                </code>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                  title={showKey ? 'Hide API Key' : 'Show API Key'}
                >
                  {showKey ? <VisibilityOff className="w-5 h-5" /> : <Visibility className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                  title="Copy API Key"
                >
                  <ContentCopy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center space-x-2 mt-2 text-sm text-black"
            >
              <CheckCircle className="w-4 h-4" />
              <span>API Key copied to clipboard!</span>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => setShowRegenerateModal(true)}
            disabled={isRegenerating}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Refresh className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate API Key'}</span>
          </button>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Security className="w-4 h-4" />
            <span>View Usage</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <Warning className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Security Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Security className="w-6 h-6 text-black" />
          <h2 className="text-lg font-semibold text-gray-900">Security Guidelines</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-black mt-2" />
            <div>
              <h3 className="font-medium text-gray-900">Keep your API key secure</h3>
              <p className="text-sm text-gray-600">
                Never share your API key in public repositories, client-side code, or unsecured locations.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-black mt-2" />
            <div>
              <h3 className="font-medium text-gray-900">Use environment variables</h3>
              <p className="text-sm text-gray-600">
                Store your API key in environment variables or secure configuration files.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-black mt-2" />
            <div>
              <h3 className="font-medium text-gray-900">Regenerate if compromised</h3>
              <p className="text-sm text-gray-600">
                If you suspect your API key has been compromised, regenerate it immediately.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 rounded-full bg-black mt-2" />
            <div>
              <h3 className="font-medium text-gray-900">Monitor usage</h3>
              <p className="text-sm text-gray-600">
                Regularly check your API usage to detect any unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Usage Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Example</h2>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-gray-100 text-sm">
{`// Using your API key in JavaScript
const response = await fetch('${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/users', {
  headers: {
    'X-API-Key': '${apiKey}',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`}
          </pre>
        </div>
      </motion.div>

      {/* Regenerate Confirmation Modal */}
      {showRegenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Warning className="w-6 h-6 text-black" />
              <h3 className="text-lg font-semibold text-gray-900">Regenerate API Key</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to regenerate your API key? This action cannot be undone, 
              and your current key will stop working immediately.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegenerating ? 'Regenerating...' : 'Yes, Regenerate'}
              </button>
              <button
                onClick={() => setShowRegenerateModal(false)}
                disabled={isRegenerating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default APIKeyManager
