import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Add,
  TableChart,
  Edit,
  Delete,
  Visibility,
  Code,
  Close,
  Save,
  Warning
} from '@mui/icons-material'
import { SchemaService, type Schema, type SchemaField } from '../../../services/schemaService'
import { useAuth } from '../../../contexts/AuthContext'

const TablesManager = () => {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [tableName, setTableName] = useState('')
  const [fields, setFields] = useState<SchemaField[]>([
    { name: 'id', type: 'string', visibility: 'public', required: true }
  ])
  const [endpointProtection, setEndpointProtection] = useState({
    get: false,
    post: false,
    put: false,
    delete: false
  })
  const [availableAuthSystems, setAvailableAuthSystems] = useState<Schema[]>([])
  const [selectedAuthSystem, setSelectedAuthSystem] = useState<string>('')
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fieldTypes = ['string', 'number', 'boolean', 'array', 'object', 'date']

  // Check if user has MongoDB connection configured
  const hasMongoConnection = user?.mongodb_uri && user?.database_name

  useEffect(() => {
    fetchSchemas()
  }, [])

  useEffect(() => {
    if (showCreateModal) {
      fetchAvailableAuthSystems()
    }
  }, [showCreateModal])

  const fetchAvailableAuthSystems = async () => {
    try {
      const data = await SchemaService.getSchemas()
      // Filter schemas that have authentication enabled
      const authEnabledSchemas = data.filter(schema => schema.auth_config?.enabled)
      setAvailableAuthSystems(authEnabledSchemas)
    } catch (err: any) {
      console.error('Failed to fetch auth systems:', err)
    }
  }

  const fetchSchemas = async () => {
    try {
      setLoading(true)
      const data = await SchemaService.getSchemas()
      setSchemas(data)
    } catch (err: any) {
      console.error('Failed to fetch schemas:', err)
      setError(err.response?.data?.error || 'Failed to load schemas')
    } finally {
      setLoading(false)
    }
  }

  const addField = () => {
    setFields([...fields, { name: '', type: 'string', visibility: 'public', required: false }])
  }

  const updateField = (index: number, field: Partial<SchemaField>) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], ...field }
    setFields(updatedFields)
  }

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const generateSchema = () => {
    const schema: any = {}
    fields.forEach(field => {
      if (field.name) {
        schema[field.name] = {
          type: field.type,
          required: field.required,
          visibility: field.visibility
        }
      }
    })
    return JSON.stringify(schema, null, 2)
  }

  const handleCreateTable = async () => {
    if (!hasMongoConnection) {
      setError('Please first add a MongoDB connection')
      return
    }

    if (!tableName || !fields.every(f => f.name)) {
      setError('Please provide table name and ensure all fields have names')
      return
    }

    try {
      setCreating(true)
      setError(null)
      
      await SchemaService.createSchema({
        collection_name: tableName,
        fields: fields,
        endpoint_protection: endpointProtection
      })
      
      // Refresh schemas list
      await fetchSchemas()
      
      // Reset form
      setShowCreateModal(false)
      setTableName('')
      setFields([{ name: 'id', type: 'string', visibility: 'public', required: true }])
      setEndpointProtection({
        get: false,
        post: false,
        put: false,
        delete: false
      })
      setSelectedAuthSystem('')
      
      alert(`Table "${tableName}" created successfully!`)
    } catch (err: any) {
      console.error('Failed to create schema:', err)
      setError(err.response?.data?.error || 'Failed to create table')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSchema = async (schemaId: string) => {
    if (!confirm('Are you sure you want to delete this schema? This action cannot be undone.')) {
      return
    }

    try {
      await SchemaService.deleteSchema(schemaId)
      await fetchSchemas()
      alert('Schema deleted successfully!')
    } catch (err: any) {
      console.error('Failed to delete schema:', err)
      alert(err.response?.data?.error || 'Failed to delete schema')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-900">Tables Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your database tables and API endpoints</p>
        </div>
        <button
          onClick={() => hasMongoConnection ? setShowCreateModal(true) : setError('Please first add a MongoDB connection')}
          disabled={!hasMongoConnection}
          className={`mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            hasMongoConnection 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Add className="w-4 h-4" />
          <span>Create New Table</span>
        </button>
      </motion.div>

      {/* MongoDB Connection Warning */}
      {!hasMongoConnection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <Warning className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-600">
              Please configure your MongoDB connection first before creating tables. 
              Go to the MongoDB Connection tab to set up your database.
            </span>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-2">
            <Delete className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        </motion.div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {schemas.length > 0 ? schemas.map((schema, index) => (
          <motion.div
            key={schema.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-black">
                  <TableChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{schema.collection_name}</h3>
                  <p className="text-xs text-gray-500">
                    Created {new Date(schema.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Fields ({schema.fields.length})
                </h4>
                <div className="space-y-1">
                  {schema.fields.slice(0, 3).map((field, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-gray-600">{field.name}</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">{field.type}</span>
                        {field.required && (
                          <span className="text-black">*</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {schema.fields.length > 3 && (
                    <p className="text-xs text-gray-500">+{schema.fields.length - 3} more</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">API Endpoints</h4>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    GET /api/{schema.collection_name}
                  </div>
                  <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    POST /api/{schema.collection_name}
                  </div>
                  <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    PUT /api/{schema.collection_name}/:id
                  </div>
                  <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    DELETE /api/{schema.collection_name}/:id
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-black transition-colors">
                  <Visibility className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-black transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-black transition-colors">
                  <Code className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => handleDeleteSchema(schema.id)}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )) : (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <TableChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tables Yet</h3>
            <p className="text-gray-600 mb-6">Create your first table to start building APIs</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors mx-auto"
            >
              <Add className="w-4 h-4" />
              <span>Create Your First Table</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-100"
            >
              <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Create New Table</h2>
                  <p className="text-gray-600 text-sm">Design your database schema and API endpoints</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-3 text-gray-400 hover:text-white hover:bg-black rounded-full transition-all duration-200 ease-in-out transform hover:scale-110"
                >
                  <Close className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[70vh] bg-white">
                <div className="space-y-10">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Schema Builder */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-black rounded-xl">
                          <TableChart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Schema Builder</h3>
                          <p className="text-gray-600 text-sm">Define your table structure</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="group">
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Table Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={tableName}
                              onChange={(e) => setTableName(e.target.value)}
                              placeholder="e.g., users, products, orders"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-gray-900 placeholder-gray-500 font-medium"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                              <div className="w-2 h-2 bg-black rounded-full opacity-20"></div>
                            </div>
                          </div>
                        </div>

                        <div className="group">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900">
                                Fields
                              </label>
                              <p className="text-xs text-gray-600 mt-1">Define your table columns</p>
                            </div>
                            <button
                              onClick={addField}
                              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              <Add className="w-4 h-4" />
                              <span>Add Field</span>
                            </button>
                          </div>
                          
                          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {fields.map((field, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group/field bg-gradient-to-r from-gray-50 to-white p-5 border-2 border-gray-100 rounded-xl hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <div className="grid grid-cols-12 gap-3 items-center">
                                  <div className="col-span-4">
                                    <input
                                      type="text"
                                      value={field.name}
                                      onChange={(e) => updateField(index, { name: e.target.value })}
                                      placeholder="Field name"
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-200"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <select
                                      value={field.type}
                                      onChange={(e) => updateField(index, { type: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-200 bg-white"
                                    >
                                      {fieldTypes.map(type => (
                                        <option key={type} value={type} className="font-medium">{type}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="col-span-2">
                                    <select
                                      value={field.visibility}
                                      onChange={(e) => updateField(index, { visibility: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-black/10 focus:border-black transition-all duration-200 bg-white"
                                    >
                                      <option value="public" className="font-medium">Public</option>
                                      <option value="private" className="font-medium">Private</option>
                                    </select>
                                  </div>
                                  <div className="col-span-3">
                                    <label className="flex items-center space-x-2 cursor-pointer group/checkbox">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={field.required}
                                          onChange={(e) => updateField(index, { required: e.target.checked })}
                                          className="sr-only"
                                        />
                                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                          field.required 
                                            ? 'bg-black border-black' 
                                            : 'border-gray-300 group-hover/checkbox:border-gray-400'
                                        }`}>
                                          {field.required && (
                                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-sm text-gray-700 font-medium">Required</span>
                                    </label>
                                  </div>
                                  <div className="col-span-1 flex justify-end">
                                    {fields.length > 1 && (
                                      <button
                                        onClick={() => removeField(index)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover/field:opacity-100"
                                      >
                                        <Delete className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schema Preview */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-black rounded-xl">
                          <Code className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Schema Preview</h3>
                          <p className="text-gray-600 text-sm">Live preview of your schema</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="group">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                            <span>JSON Schema</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </h4>
                          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-xl p-6 overflow-x-auto shadow-xl border border-gray-700">
                            <pre className="text-green-400 text-sm font-mono leading-relaxed">
                              {generateSchema()}
                            </pre>
                          </div>
                        </div>

                        <div className="group">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">Generated Endpoints</h4>
                          <div className="space-y-3">
                            {tableName ? (
                              <>
                                <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>Data Operations {selectedAuthSystem ? '(Some endpoints protected)' : ''}</span>
                                </div>
                                
                                {/* CRUD Endpoints */}
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <span className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold">GET</span>
                                    <span className="font-mono text-gray-700 font-medium">/api/{tableName}</span>
                                    {endpointProtection.get && <span className="text-amber-600 font-bold">🔒</span>}
                                  </div>
                                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">POST</span>
                                    <span className="font-mono text-gray-700 font-medium">/api/{tableName}</span>
                                    {endpointProtection.post && <span className="text-amber-600 font-bold">🔒</span>}
                                  </div>
                                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                    <span className="bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-bold">PUT</span>
                                    <span className="font-mono text-gray-700 font-medium">/api/{tableName}/:id</span>
                                    {endpointProtection.put && <span className="text-amber-600 font-bold">🔒</span>}
                                  </div>
                                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                                    <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">DELETE</span>
                                    <span className="font-mono text-gray-700 font-medium">/api/{tableName}/:id</span>
                                    {endpointProtection.delete && <span className="text-amber-600 font-bold">🔒</span>}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                <TableChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">Enter a table name to see endpoints</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Endpoint Protection Configuration */}
                  <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-100 shadow-lg">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Endpoint Protection</h3>
                        <p className="text-gray-600 text-sm">Secure your API endpoints with authentication</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Authentication System
                        </label>
                        <div className="relative">
                          <select
                            value={selectedAuthSystem}
                            onChange={(e) => setSelectedAuthSystem(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-white font-medium text-gray-900 appearance-none"
                          >
                            <option value="" className="font-medium">No authentication required</option>
                            {availableAuthSystems.map(authSystem => (
                              <option key={authSystem.id} value={authSystem.id} className="font-medium">
                                {authSystem.collection_name} (Auth System)
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>
                            {availableAuthSystems.length === 0 
                              ? "Create an authentication system first in the Authentication tab"
                              : "Select an auth system to protect endpoints"
                            }
                          </span>
                        </p>
                      </div>

                      {selectedAuthSystem && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                          className="bg-white rounded-xl p-6 border border-indigo-200 shadow-sm"
                        >
                          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span>Protect Endpoints</span>
                          </h4>
                          <p className="text-xs text-gray-600 mb-4">Select which endpoints require authentication</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="group/check flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={endpointProtection.get}
                                  onChange={(e) => setEndpointProtection(prev => ({ ...prev, get: e.target.checked }))}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                  endpointProtection.get 
                                    ? 'bg-black border-black' 
                                    : 'border-gray-300 group-hover/check:border-blue-400'
                                }`}>
                                  {endpointProtection.get && (
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-900">GET</span>
                                <p className="text-xs text-gray-600">Read data</p>
                              </div>
                            </label>
                            <label className="group/check flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all duration-200">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={endpointProtection.post}
                                  onChange={(e) => setEndpointProtection(prev => ({ ...prev, post: e.target.checked }))}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                  endpointProtection.post 
                                    ? 'bg-black border-black' 
                                    : 'border-gray-300 group-hover/check:border-green-400'
                                }`}>
                                  {endpointProtection.post && (
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-900">POST</span>
                                <p className="text-xs text-gray-600">Create data</p>
                              </div>
                            </label>
                            <label className="group/check flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-100 hover:border-yellow-200 hover:bg-yellow-50 transition-all duration-200">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={endpointProtection.put}
                                  onChange={(e) => setEndpointProtection(prev => ({ ...prev, put: e.target.checked }))}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                  endpointProtection.put 
                                    ? 'bg-black border-black' 
                                    : 'border-gray-300 group-hover/check:border-yellow-400'
                                }`}>
                                  {endpointProtection.put && (
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-900">PUT</span>
                                <p className="text-xs text-gray-600">Update data</p>
                              </div>
                            </label>
                            <label className="group/check flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 transition-all duration-200">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  checked={endpointProtection.delete}
                                  onChange={(e) => setEndpointProtection(prev => ({ ...prev, delete: e.target.checked }))}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                                  endpointProtection.delete 
                                    ? 'bg-black border-black' 
                                    : 'border-gray-300 group-hover/check:border-red-400'
                                }`}>
                                  {endpointProtection.delete && (
                                    <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <div className="flex-1">
                                <span className="text-sm font-semibold text-gray-900">DELETE</span>
                                <p className="text-xs text-gray-600">Remove data</p>
                              </div>
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  disabled={creating || !tableName || !fields.every(f => f.name)}
                  className="flex items-center space-x-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save className="w-5 h-5" />
                  <span>{creating ? 'Creating Table...' : 'Create Table'}</span>
                  {creating && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TablesManager
