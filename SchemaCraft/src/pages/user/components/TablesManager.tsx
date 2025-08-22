import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Add,
  TableChart,
  Edit,
  Delete,
  Visibility,
  Code,
  Close,
  Save
} from '@mui/icons-material'

interface Field {
  name: string
  type: string
  required: boolean
}

interface Table {
  id: number
  name: string
  createdDate: string
  endpoints: string[]
  fields: Field[]
}

const TablesManager = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [tableName, setTableName] = useState('')
  const [fields, setFields] = useState<Field[]>([
    { name: 'id', type: 'String', required: true }
  ])

  const [tables] = useState<Table[]>([
    {
      id: 1,
      name: 'users',
      createdDate: '2024-08-20',
      endpoints: ['GET /api/users', 'POST /api/users', 'PUT /api/users/:id', 'DELETE /api/users/:id'],
      fields: [
        { name: 'id', type: 'String', required: true },
        { name: 'name', type: 'String', required: true },
        { name: 'email', type: 'String', required: true },
        { name: 'age', type: 'Number', required: false }
      ]
    },
    {
      id: 2,
      name: 'products',
      createdDate: '2024-08-19',
      endpoints: ['GET /api/products', 'POST /api/products', 'PUT /api/products/:id'],
      fields: [
        { name: 'id', type: 'String', required: true },
        { name: 'title', type: 'String', required: true },
        { name: 'price', type: 'Number', required: true },
        { name: 'inStock', type: 'Boolean', required: false }
      ]
    }
  ])

  const fieldTypes = ['String', 'Number', 'Boolean', 'Array', 'Object']

  const addField = () => {
    setFields([...fields, { name: '', type: 'String', required: false }])
  }

  const updateField = (index: number, field: Partial<Field>) => {
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
          required: field.required
        }
      }
    })
    return JSON.stringify(schema, null, 2)
  }

  const handleCreateTable = () => {
    if (tableName && fields.every(f => f.name)) {
      alert(`Table "${tableName}" created successfully!`)
      setShowCreateModal(false)
      setTableName('')
      setFields([{ name: 'id', type: 'String', required: true }])
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
          <h1 className="text-2xl font-bold text-gray-900">Tables Management</h1>
          <p className="text-gray-600 mt-1">Create and manage your database tables and API endpoints</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Add className="w-4 h-4" />
          <span>Create New Table</span>
        </button>
      </motion.div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {tables.map((table, index) => (
          <motion.div
            key={table.id}
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
                  <h3 className="font-semibold text-gray-900">{table.name}</h3>
                  <p className="text-xs text-gray-500">Created {table.createdDate}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Fields ({table.fields.length})</h4>
                <div className="space-y-1">
                  {table.fields.slice(0, 3).map((field, idx) => (
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
                  {table.fields.length > 3 && (
                    <p className="text-xs text-gray-500">+{table.fields.length - 3} more</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">API Endpoints</h4>
                <div className="space-y-1">
                  {table.endpoints.slice(0, 2).map((endpoint, idx) => (
                    <div key={idx} className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      {endpoint}
                    </div>
                  ))}
                  {table.endpoints.length > 2 && (
                    <p className="text-xs text-gray-500">+{table.endpoints.length - 2} more</p>
                  )}
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
              <button className="p-1 text-gray-400 hover:text-black transition-colors">
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Table Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create New Table</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-gray-400 hover:text-black transition-colors"
                >
                  <Close className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Schema Builder */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Builder</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Table Name
                        </label>
                        <input
                          type="text"
                          value={tableName}
                          onChange={(e) => setTableName(e.target.value)}
                          placeholder="e.g., users, products, orders"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Fields
                          </label>
                          <button
                            onClick={addField}
                            className="text-sm text-black hover:underline"
                          >
                            Add Field
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {fields.map((field, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) => updateField(index, { name: e.target.value })}
                                placeholder="Field name"
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                              <select
                                value={field.type}
                                onChange={(e) => updateField(index, { type: e.target.value })}
                                className="px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                {fieldTypes.map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                              <label className="flex items-center space-x-1">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => updateField(index, { required: e.target.checked })}
                                  className="rounded"
                                />
                                <span className="text-xs text-gray-600">Required</span>
                              </label>
                              {fields.length > 1 && (
                                <button
                                  onClick={() => removeField(index)}
                                  className="p-1 text-gray-400 hover:text-black"
                                >
                                  <Delete className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schema Preview */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Preview</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">JSON Schema</h4>
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                          <pre className="text-gray-100 text-sm">
                            {generateSchema()}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Endpoints</h4>
                        <div className="space-y-2">
                          {tableName && (
                            <>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="bg-black text-white px-2 py-1 rounded text-xs font-mono">GET</span>
                                <span className="font-mono text-gray-600">/api/{tableName}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="bg-black text-white px-2 py-1 rounded text-xs font-mono">POST</span>
                                <span className="font-mono text-gray-600">/api/{tableName}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="bg-black text-white px-2 py-1 rounded text-xs font-mono">PUT</span>
                                <span className="font-mono text-gray-600">/api/{tableName}/:id</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="bg-black text-white px-2 py-1 rounded text-xs font-mono">DELETE</span>
                                <span className="font-mono text-gray-600">/api/{tableName}/:id</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTable}
                  className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Create Table</span>
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
