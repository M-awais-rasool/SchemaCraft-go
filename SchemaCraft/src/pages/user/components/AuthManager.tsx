import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Security,
  Edit,
  Delete,
  Visibility,
  Close,
  Save,
  CheckCircle,
  Warning,
  Key
} from '@mui/icons-material'
import { SchemaService, type Schema, type SchemaField, type AuthConfig } from '../../../services/schemaService'
import { useAuth } from '../../../contexts/AuthContext'

const AuthManager = () => {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [authSchemas, setAuthSchemas] = useState<Schema[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
 
  // Form state
  const [tableName, setTableName] = useState('')
  const [userFields, setUserFields] = useState<SchemaField[]>([
    { name: 'id', type: 'string', visibility: 'public', required: true },
    { name: 'email', type: 'string', visibility: 'public', required: true },
    { name: 'password', type: 'string', visibility: 'private', required: true },
    { name: 'name', type: 'string', visibility: 'public', required: true },
    { name: 'created_at', type: 'date', visibility: 'public', required: true }
  ])
  const [authConfig, setAuthConfig] = useState<AuthConfig>({
    enabled: true,
    user_collection: '',
    login_fields: {
      email_field: 'email',
      username_field: '',
      allow_both: false
    },
    response_fields: ['id', 'email', 'name', 'created_at'],
    password_field: 'password',
    token_expiration: 24,
    require_email_verification: false,
    allow_signup: true
  })

  const fieldTypes = ['string', 'number', 'boolean', 'array', 'object', 'date']
  const hasMongoConnection = user?.mongodb_uri && user?.database_name

  useEffect(() => {
    fetchAuthSchemas()
  }, [])

  const fetchAuthSchemas = async () => {
    try {
      setLoading(true)
      const data = await SchemaService.getSchemas()
      // Filter schemas that have authentication enabled
      const authEnabledSchemas = data.filter(schema => schema.auth_config?.enabled)
      setAuthSchemas(authEnabledSchemas)
    } catch (err: any) {
      console.error('Failed to fetch auth schemas:', err)
      setError(err.response?.data?.error || 'Failed to load authentication configurations')
    } finally {
      setLoading(false)
    }
  }

  const addUserField = () => {
    setUserFields([...userFields, { name: '', type: 'string', visibility: 'public', required: false }])
  }

  const updateUserField = (index: number, field: Partial<SchemaField>) => {
    const updatedFields = [...userFields]
    updatedFields[index] = { ...updatedFields[index], ...field }
    setUserFields(updatedFields)

    // Auto-update auth config when field names change
    if (field.name !== undefined) {
      const oldField = userFields[index]
      const newConfig = { ...authConfig }
      
      // Update email field reference
      if (newConfig.login_fields.email_field === oldField.name) {
        newConfig.login_fields.email_field = field.name
      }
      
      // Update password field reference
      if (newConfig.password_field === oldField.name) {
        newConfig.password_field = field.name
      }
      
      // Update username field reference
      if (newConfig.login_fields.username_field === oldField.name) {
        newConfig.login_fields.username_field = field.name
      }
      
      // Update response fields
      const responseIndex = newConfig.response_fields.indexOf(oldField.name)
      if (responseIndex !== -1 && field.name) {
        newConfig.response_fields[responseIndex] = field.name
      }
      
      setAuthConfig(newConfig)
    }
  }

  const removeUserField = (index: number) => {
    if (userFields.length > 1) {
      const fieldToRemove = userFields[index]
      setUserFields(userFields.filter((_, i) => i !== index))
      
      // Remove from auth config references
      const newConfig = { ...authConfig }
      if (newConfig.login_fields.email_field === fieldToRemove.name) {
        newConfig.login_fields.email_field = ''
      }
      if (newConfig.password_field === fieldToRemove.name) {
        newConfig.password_field = ''
      }
      if (newConfig.login_fields.username_field === fieldToRemove.name) {
        newConfig.login_fields.username_field = ''
      }
      newConfig.response_fields = newConfig.response_fields.filter(f => f !== fieldToRemove.name)
      setAuthConfig(newConfig)
    }
  }

  const handleCreateAuth = async () => {
    if (!hasMongoConnection) {
      setError('Please first add a MongoDB connection')
      return
    }

    if (!tableName || !userFields.every(f => f.name)) {
      setError('Please provide table name and ensure all fields have names')
      return
    }

    // Validate auth configuration
    if (!authConfig.login_fields.email_field) {
      setError('Email field is required')
      return
    }
    if (!authConfig.password_field) {
      setError('Password field is required')
      return
    }

    // Check if selected fields exist in schema
    const fieldNames = userFields.map(f => f.name)
    if (!fieldNames.includes(authConfig.login_fields.email_field)) {
      setError(`Email field '${authConfig.login_fields.email_field}' not found in schema`)
      return
    }
    if (!fieldNames.includes(authConfig.password_field)) {
      setError(`Password field '${authConfig.password_field}' not found in schema`)
      return
    }

    try {
      setCreating(true)
      setError(null)
      
      const finalAuthConfig = {
        ...authConfig,
        user_collection: authConfig.user_collection || `${tableName}_users`
      }
      
      await SchemaService.createSchema({
        collection_name: tableName,
        fields: userFields,
        auth_config: finalAuthConfig
      })
      
      // Refresh auth schemas list
      await fetchAuthSchemas()
      
      // Reset form
      setShowCreateModal(false)
      setTableName('')
      setUserFields([
        { name: 'id', type: 'string', visibility: 'public', required: true },
        { name: 'email', type: 'string', visibility: 'public', required: true },
        { name: 'password', type: 'string', visibility: 'private', required: true },
        { name: 'name', type: 'string', visibility: 'public', required: true },
        { name: 'created_at', type: 'date', visibility: 'public', required: true }
      ])
      setAuthConfig({
        enabled: true,
        user_collection: '',
        login_fields: {
          email_field: 'email',
          username_field: '',
          allow_both: false
        },
        response_fields: ['id', 'email', 'name', 'created_at'],
        password_field: 'password',
        token_expiration: 24,
        require_email_verification: false,
        allow_signup: true
      })
      
      alert(`Authentication system "${tableName}" created successfully!`)
    } catch (err: any) {
      console.error('Failed to create auth system:', err)
      setError(err.response?.data?.error || 'Failed to create authentication system')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAuthSchema = async (schemaId: string) => {
    if (!confirm('Are you sure you want to delete this authentication system? This action cannot be undone.')) {
      return
    }

    try {
      await SchemaService.deleteSchema(schemaId)
      await fetchAuthSchemas()
      alert('Authentication system deleted successfully!')
    } catch (err: any) {
      console.error('Failed to delete auth schema:', err)
      alert(err.response?.data?.error || 'Failed to delete authentication system')
    }
  }

  const stringFields = userFields.filter(field => field.type === 'string')
  const allFieldNames = userFields.map(field => field.name).filter(name => name)

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-8 animate-pulse">
          <div className="h-10 bg-gray-200 rounded-xl w-1/3 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-8 animate-pulse">
              <div className="h-8 bg-gray-200 rounded-xl w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-black">Authentication Management</h1>
          <p className="text-gray-600 mt-2">Create and manage authentication systems for your APIs</p>
        </div>
        <button
          onClick={() => hasMongoConnection ? setShowCreateModal(true) : setError('Please first add a MongoDB connection')}
          disabled={!hasMongoConnection}
          className={`mt-6 sm:mt-0 flex items-center space-x-3 px-6 py-3 rounded-xl transition-all ${
            hasMongoConnection 
              ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Security className="w-5 h-5" />
          <span className="font-semibold">Create Auth System</span>
        </button>
      </motion.div>

      {/* MongoDB Connection Warning */}
      {!hasMongoConnection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3">
            <Warning className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              Please configure your MongoDB connection first before creating authentication systems.
            </span>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6"
        >
          <div className="flex items-center space-x-3">
            <Delete className="w-5 h-5 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Auth Systems Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {authSchemas.length > 0 ? authSchemas.map((schema, index) => (
          <motion.div
            key={schema.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-8 hover:shadow-lg hover:border-gray-200 transition-all"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-black">
                  <Security className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black">{schema.collection_name}</h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(schema.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-black" />
                <span className="text-sm font-semibold text-black">Active</span>
              </div>
            </div>

            <div className="space-y-6 mb-6">
              <div>
                <h4 className="text-sm font-bold text-black mb-3">
                  User Fields ({schema.fields.length})
                </h4>
                <div className="space-y-2">
                  {schema.fields.slice(0, 3).map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                      <span className="font-mono font-medium text-black">{field.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 text-xs">{field.type}</span>
                        {field.required && (
                          <span className="text-black font-bold">*</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {schema.fields.length > 3 && (
                    <p className="text-sm text-gray-500 font-medium">+{schema.fields.length - 3} more fields</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-black mb-3">Auth Endpoints</h4>
                <div className="space-y-2">
                  {schema.auth_config?.allow_signup && (
                    <div className="text-xs font-mono text-black bg-gray-100 px-3 py-2 rounded-lg border-2 border-gray-200">
                      POST /api/{schema.collection_name}/auth/signup
                    </div>
                  )}
                  <div className="text-xs font-mono text-black bg-gray-100 px-3 py-2 rounded-lg border-2 border-gray-200">
                    POST /api/{schema.collection_name}/auth/login
                  </div>
                  <div className="text-xs font-mono text-black bg-gray-100 px-3 py-2 rounded-lg border-2 border-gray-200">
                    GET /api/{schema.collection_name}/auth/validate
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-black mb-3">Configuration</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Email Field:</span>
                    <span className="font-mono font-medium text-black">{schema.auth_config?.login_fields.email_field}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Expiry:</span>
                    <span className="font-medium text-black">{schema.auth_config?.token_expiration}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Signup:</span>
                    <span className="font-medium text-black">{schema.auth_config?.allow_signup ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t-2 border-gray-100">
              <div className="flex space-x-3">
                <button className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                  <Visibility className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => handleDeleteAuthSchema(schema.id)}
                className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-16 text-center">
            <Security className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-black mb-3">No Authentication Systems</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Create your first authentication system to secure your APIs with user login and registration functionality</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-3 px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all mx-auto shadow-lg hover:shadow-xl"
            >
              <Security className="w-5 h-5" />
              <span className="font-semibold">Create Auth System</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Auth Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-8 border-b-2 border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-black">Create Authentication System</h2>
                  <p className="text-gray-600 mt-1">Configure user authentication for your API</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                >
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[75vh]">
                <div className="space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* User Schema Builder */}
                    <div className="bg-gray-50 rounded-2xl p-8">
                      <h3 className="text-xl font-bold text-black mb-6 flex items-center">
                        <Security className="mr-3 w-6 h-6" />
                        User Schema
                      </h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-bold text-black mb-3">
                            Auth System Name
                          </label>
                          <input
                            type="text"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            placeholder="e.g., user_auth, customer_auth"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-sm font-bold text-black">
                              User Fields
                            </label>
                            <button
                              onClick={addUserField}
                              className="text-sm font-semibold text-black hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                            >
                              + Add Field
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {userFields.map((field, index) => (
                              <div key={index} className="bg-white p-4 rounded-xl border-2 border-gray-200">
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <input
                                    type="text"
                                    value={field.name}
                                    onChange={(e) => updateUserField(index, { name: e.target.value })}
                                    placeholder="Field name"
                                    className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-black focus:ring-2 focus:ring-gray-400 transition-all"
                                  />
                                  <select
                                    value={field.type}
                                    onChange={(e) => updateUserField(index, { type: e.target.value })}
                                    className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-black focus:ring-2 focus:ring-gray-400 transition-all"
                                  >
                                    {fieldTypes.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4">
                                    <select
                                      value={field.visibility}
                                      onChange={(e) => updateUserField(index, { visibility: e.target.value })}
                                      className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-black focus:ring-2 focus:ring-gray-400 transition-all"
                                    >
                                      <option value="public">Public</option>
                                      <option value="private">Private</option>
                                    </select>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateUserField(index, { required: e.target.checked })}
                                        className="w-4 h-4 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                                      />
                                      <span className="text-sm font-medium text-black">Required</span>
                                    </label>
                                  </div>
                                  {userFields.length > 1 && (
                                    <button
                                      onClick={() => removeUserField(index)}
                                      className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
                                    >
                                      <Delete className="w-5 h-5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auth Configuration */}
                    <div className="bg-gray-50 rounded-2xl p-8">
                      <h3 className="text-xl font-bold text-black mb-6 flex items-center">
                        <Key className="mr-3 w-6 h-6" />
                        Authentication Configuration
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Field Mapping */}
                        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                          <h4 className="text-lg font-bold text-black mb-4">Field Mapping</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-bold text-black mb-3">
                                Email Field *
                              </label>
                              <select
                                value={authConfig.login_fields.email_field}
                                onChange={(e) => setAuthConfig({
                                  ...authConfig,
                                  login_fields: { ...authConfig.login_fields, email_field: e.target.value }
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

                            <div>
                              <label className="block text-sm font-bold text-black mb-3">
                                Password Field *
                              </label>
                              <select
                                value={authConfig.password_field}
                                onChange={(e) => setAuthConfig({ ...authConfig, password_field: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                                required
                              >
                                <option value="">Select password field</option>
                                {stringFields.map(field => (
                                  <option key={field.name} value={field.name}>{field.name}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-black mb-3">
                                Username Field (Optional)
                              </label>
                              <select
                                value={authConfig.login_fields.username_field || ''}
                                onChange={(e) => setAuthConfig({
                                  ...authConfig,
                                  login_fields: { ...authConfig.login_fields, username_field: e.target.value }
                                })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                              >
                                <option value="">No username field</option>
                                {stringFields.map(field => (
                                  <option key={field.name} value={field.name}>{field.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Response Fields */}
                        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                          <h4 className="text-lg font-bold text-black mb-4">Response Fields</h4>
                          <p className="text-sm text-gray-600 mb-4">Select which fields to include in authentication responses</p>
                          
                          <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                            {allFieldNames.map(fieldName => {
                              if (fieldName === authConfig.password_field) return null // Never include password

                              return (
                                <label key={fieldName} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-100 hover:border-gray-300 transition-all">
                                  <input
                                    type="checkbox"
                                    checked={authConfig.response_fields.includes(fieldName)}
                                    onChange={(e) => {
                                      const newFields = e.target.checked
                                        ? [...authConfig.response_fields, fieldName]
                                        : authConfig.response_fields.filter(f => f !== fieldName)
                                      setAuthConfig({ ...authConfig, response_fields: newFields })
                                    }}
                                    className="w-4 h-4 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                                  />
                                  <span className="text-sm font-medium text-black">{fieldName}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>

                        {/* Settings */}
                        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                          <h4 className="text-lg font-bold text-black mb-4">Settings</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-bold text-black mb-3">
                                Token Expiration (hours)
                              </label>
                              <input
                                type="number"
                                value={authConfig.token_expiration}
                                onChange={(e) => setAuthConfig({ ...authConfig, token_expiration: parseInt(e.target.value) || 24 })}
                                min="1"
                                max="8760"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-black transition-all"
                              />
                            </div>

                            <div className="space-y-4">
                              <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-100 hover:border-gray-300 transition-all">
                                <input
                                  type="checkbox"
                                  checked={authConfig.allow_signup}
                                  onChange={(e) => setAuthConfig({ ...authConfig, allow_signup: e.target.checked })}
                                  className="w-4 h-4 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                                />
                                <span className="text-sm font-medium text-black">Allow user registration</span>
                              </label>

                              {authConfig.login_fields.username_field && (
                                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-100 hover:border-gray-300 transition-all">
                                  <input
                                    type="checkbox"
                                    checked={authConfig.login_fields.allow_both}
                                    onChange={(e) => setAuthConfig({
                                      ...authConfig,
                                      login_fields: { ...authConfig.login_fields, allow_both: e.target.checked }
                                    })}
                                    className="w-4 h-4 rounded border-2 border-gray-300 text-black focus:ring-gray-400"
                                  />
                                  <span className="text-sm font-medium text-black">Allow login with email or username</span>
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                    <h3 className="text-xl font-bold text-black mb-6">Generated Endpoints Preview</h3>
                    <div className="space-y-3">
                      {tableName && (
                        <>
                          {authConfig.allow_signup && (
                            <div className="flex items-center space-x-3 text-sm p-3 bg-white rounded-lg border border-gray-200">
                              <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-mono font-bold">POST</span>
                              <span className="font-mono font-medium text-black">/api/{tableName}/auth/signup</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3 text-sm p-3 bg-white rounded-lg border border-gray-200">
                            <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-mono font-bold">POST</span>
                            <span className="font-mono font-medium text-black">/api/{tableName}/auth/login</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm p-3 bg-white rounded-lg border border-gray-200">
                            <span className="bg-black text-white px-3 py-1 rounded-lg text-xs font-mono font-bold">GET</span>
                            <span className="font-mono font-medium text-black">/api/{tableName}/auth/validate</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 p-8 border-t-2 border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-6 py-3 border-2 border-gray-300 text-black rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAuth}
                  disabled={creating || !tableName || !userFields.every(f => f.name) || !authConfig.login_fields.email_field || !authConfig.password_field}
                  className="flex items-center space-x-3 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  <span className="font-semibold">{creating ? 'Creating...' : 'Create Auth System'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AuthManager
