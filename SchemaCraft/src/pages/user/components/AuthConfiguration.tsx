import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Security,
  Visibility,
  PersonAdd,
  Key,
  Settings
} from '@mui/icons-material'
import type { AuthConfig, SchemaField } from '../../../services/schemaService'

interface AuthConfigurationProps {
  authConfig: AuthConfig | null
  onAuthConfigChange: (config: AuthConfig | null) => void
  fields: SchemaField[]
}

const AuthConfiguration = ({ authConfig, onAuthConfigChange, fields }: AuthConfigurationProps) => {
  const [enabled, setEnabled] = useState(authConfig?.enabled || false)
  const [config, setConfig] = useState<AuthConfig>(
    authConfig || {
      enabled: false,
      user_collection: '',
      login_fields: {
        email_field: '',
        username_field: '',
        allow_both: false
      },
      response_fields: [],
      password_field: '',
      token_expiration: 24,
      require_email_verification: false,
      allow_signup: true
    }
  )

  const handleEnabledChange = (enabled: boolean) => {
    setEnabled(enabled)
    if (!enabled) {
      onAuthConfigChange(null)
    } else {
      const newConfig = { ...config, enabled }
      setConfig(newConfig)
      onAuthConfigChange(newConfig)
    }
  }

  const handleConfigChange = (updates: Partial<AuthConfig>) => {
    const newConfig = { ...config, ...updates, enabled }
    setConfig(newConfig)
    onAuthConfigChange(newConfig)
  }

  const stringFields = fields.filter(field => field.type === 'string')
  const allFields = fields.map(field => field.name)

  return (
    <div className="space-y-6">
      {/* Authentication Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-black p-3 rounded-xl">
              <Security className="text-white w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Enable Authentication</h3>
              <p className="text-gray-600 mt-1">Add secure login/signup functionality to your API</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-black"></div>
          </label>
        </div>
      </motion.div>

      {/* Authentication Configuration */}
      {enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* Basic Configuration */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-black mb-6 flex items-center">
              <Settings className="mr-3 text-black w-5 h-5" />
              Basic Configuration
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Collection */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  User Collection Name
                </label>
                <input
                  type="text"
                  value={config.user_collection}
                  onChange={(e) => handleConfigChange({ user_collection: e.target.value })}
                  placeholder="users (auto-generated if empty)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Collection where user accounts will be stored
                </p>
              </div>

              {/* Token Expiration */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Token Expiration (hours)
                </label>
                <input
                  type="number"
                  value={config.token_expiration}
                  onChange={(e) => handleConfigChange({ token_expiration: parseInt(e.target.value) || 24 })}
                  min="1"
                  max="8760"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                />
              </div>
            </div>
          </div>

          {/* Field Mapping */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-black mb-6 flex items-center">
              <Key className="mr-3 text-black w-5 h-5" />
              Field Mapping
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Email Field *
                </label>
                <select
                  value={config.login_fields.email_field}
                  onChange={(e) => handleConfigChange({
                    login_fields: { ...config.login_fields, email_field: e.target.value }
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                  required
                >
                  <option value="">Select email field</option>
                  {stringFields.map(field => (
                    <option key={field.name} value={field.name}>{field.name}</option>
                  ))}
                </select>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Password Field *
                </label>
                <select
                  value={config.password_field}
                  onChange={(e) => handleConfigChange({ password_field: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                  required
                >
                  <option value="">Select password field</option>
                  {stringFields.map(field => (
                    <option key={field.name} value={field.name}>{field.name}</option>
                  ))}
                </select>
              </div>

              {/* Username Field (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-black mb-3">
                  Username Field (Optional)
                </label>
                <select
                  value={config.login_fields.username_field || ''}
                  onChange={(e) => handleConfigChange({
                    login_fields: { ...config.login_fields, username_field: e.target.value }
                  })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                >
                  <option value="">No username field</option>
                  {stringFields.map(field => (
                    <option key={field.name} value={field.name}>{field.name}</option>
                  ))}
                </select>
              </div>

              {/* Allow Both */}
              {config.login_fields.username_field && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    id="allow-both"
                    checked={config.login_fields.allow_both}
                    onChange={(e) => handleConfigChange({
                      login_fields: { ...config.login_fields, allow_both: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                  />
                  <label htmlFor="allow-both" className="text-sm font-medium text-black">
                    Allow login with either email or username
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Response Fields */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-black mb-6 flex items-center">
              <Visibility className="mr-3 text-black w-5 h-5" />
              Response Fields
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              Select which fields to include in authentication responses (login/signup)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allFields.map(fieldName => {
                if (fieldName === config.password_field) return null // Never include password

                return (
                  <label key={fieldName} className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all">
                    <input
                      type="checkbox"
                      checked={config.response_fields.includes(fieldName)}
                      onChange={(e) => {
                        const newFields = e.target.checked
                          ? [...config.response_fields, fieldName]
                          : config.response_fields.filter(f => f !== fieldName)
                        handleConfigChange({ response_fields: newFields })
                      }}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                    />
                    <span className="text-sm font-medium text-black">{fieldName}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Additional Options */}
          <div className="bg-white rounded-xl border-2 border-gray-100 p-8 shadow-sm">
            <h4 className="text-lg font-bold text-black mb-6 flex items-center">
              <PersonAdd className="mr-3 text-black w-5 h-5" />
              Additional Options
            </h4>

            <div className="space-y-6">
              <label className="flex items-center space-x-4 cursor-pointer p-4 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all">
                <input
                  type="checkbox"
                  checked={config.allow_signup}
                  onChange={(e) => handleConfigChange({ allow_signup: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                />
                <span className="text-sm font-medium text-black">Allow user registration</span>
              </label>

              <label className="flex items-center space-x-4 cursor-pointer p-4 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all opacity-50">
                <input
                  type="checkbox"
                  checked={config.require_email_verification}
                  onChange={(e) => handleConfigChange({ require_email_verification: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                  disabled
                />
                <span className="text-sm font-medium text-black">Require email verification (coming soon)</span>
              </label>
            </div> 
          </div>

          {/* Configuration Preview */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-100">
            <h5 className="text-lg font-bold text-black mb-4">Configuration Preview</h5>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <pre className="text-xs text-gray-700 overflow-x-auto font-mono">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default AuthConfiguration
