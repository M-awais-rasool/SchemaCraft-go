import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TableChart,
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Visibility,
  NavigateBefore,
  NavigateNext,
  Warning
} from '@mui/icons-material'
import { SchemaService, type Schema } from '../../../services/schemaService'
import { DataService, type DataRecord, type PaginatedResponse } from '../../../services/dataService'
import { useAuth } from '../../../contexts/AuthContext'

const DataViewer = () => {
  const { user } = useAuth()
  const [schemas, setSchemas] = useState<Schema[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [data, setData] = useState<PaginatedResponse<DataRecord> | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRecord, setNewRecord] = useState<Record<string, any>>({})

  const recordsPerPage = 10

  // Check if user has MongoDB connection configured
  const hasMongoConnection = user?.mongodb_uri && user?.database_name

  useEffect(() => {
    fetchSchemas()
  }, [])

  useEffect(() => {
    if (selectedTable) {
      fetchData()
    }
  }, [selectedTable, currentPage, searchTerm])

  const fetchSchemas = async () => {
    try {
      setLoading(true)
      const data = await SchemaService.getSchemas()
      setSchemas(data)
      if (data.length > 0 && !selectedTable) {
        setSelectedTable(data[0].collection_name)
      }
    } catch (err: any) {
      console.error('Failed to fetch schemas:', err)
      setError(err.response?.data?.error || 'Failed to load schemas')
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    if (!selectedTable) return

    try {
      setLoadingData(true)
      setError(null)
      
      const response = await DataService.getDocuments(selectedTable, currentPage, recordsPerPage)
      setData(response)
    } catch (err: any) {
      console.error('Failed to fetch data:', err)
      setError(err.response?.data?.error || 'Failed to load data')
      setData(null)
    } finally {
      setLoadingData(false)
    }
  }

  const getSelectedSchema = () => {
    return schemas.find(schema => schema.collection_name === selectedTable)
  }

  // const initializeNewRecord = () => {
  //   const schema = getSelectedSchema()
  //   if (!schema) return {}

  //   const record: Record<string, any> = {}
  //   schema.fields.forEach(field => {
  //     if (field.name !== 'id') { // Skip ID field as it's auto-generated
  //       record[field.name] = field.default || ''
  //     }
  //   })
  //   return record
  // }

  const handleAddRecord = async () => {
    if (!hasMongoConnection) {
      alert('Please configure your MongoDB connection first')
      return
    }

    if (!selectedTable) return

    try {
      const recordData = { ...newRecord }
      await DataService.createDocument(selectedTable, recordData)
      
      setShowAddModal(false)
      setNewRecord({})
      fetchData() // Refresh data
      alert('Record added successfully!')
    } catch (err: any) {
      console.error('Failed to add record:', err)
      alert(err.response?.data?.error || 'Failed to add record')
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!selectedTable || !confirm('Are you sure you want to delete this record?')) return

    try {
      await DataService.deleteDocument(selectedTable, recordId)
      fetchData() // Refresh data
      alert('Record deleted successfully!')
    } catch (err: any) {
      console.error('Failed to delete record:', err)
      alert(err.response?.data?.error || 'Failed to delete record')
    }
  }

  const getTableColumns = () => {
    const schema = getSelectedSchema()
    if (!schema) return []
    
    // Include ID and all schema fields that are public
    const columns = ['id']
    schema.fields.forEach(field => {
      if (field.visibility === 'public' && field.name !== 'id') {
        columns.push(field.name)
      }
    })
    return columns
  }

  const getCurrentData = () => {
    return data?.data || []
  }

  const getTotalRecords = () => {
    return data?.total || 0
  }

  const getTotalPages = () => {
    return data?.total_pages || 0
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  const renderCellValue = (value: any) => {
    if (typeof value === 'boolean') {
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'true' : 'false'}
        </span>
      )
    }
    return value?.toString() || ''
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
          <h1 className="text-2xl font-bold text-gray-900">Data Viewer</h1>
          <p className="text-gray-600 mt-1">View and manage your table data</p>
        </div>
        <button
          onClick={() => hasMongoConnection ? setShowAddModal(true) : setError('Please configure your MongoDB connection first')}
          disabled={!hasMongoConnection}
          className={`mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            hasMongoConnection 
              ? 'bg-black text-white hover:bg-gray-800' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Add className="w-4 h-4" />
          <span>Add Record</span>
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
              Please configure your MongoDB connection first before viewing data. 
              Go to the MongoDB Connection tab to set up your database.
            </span>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Table
            </label>
            <select
              value={selectedTable}
              onChange={(e) => {
                setSelectedTable(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="">Select a table...</option>
              {schemas.map(schema => (
                <option key={schema.id} value={schema.collection_name}>
                  {schema.collection_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Records
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search in all fields..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-end">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FilterList className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TableChart className="w-5 h-5 text-black" />
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedTable} ({getTotalRecords()} records)
              </h2>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-6 bg-red-50 border-l-4 border-red-400">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loadingData ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : getCurrentData().length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {getTableColumns().map(column => (
                      <th key={column} className="text-left py-3 px-6 font-semibold text-gray-900 capitalize">
                        {column}
                      </th>
                    ))}
                    <th className="text-left py-3 px-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentData().map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {getTableColumns().map(column => (
                        <td key={column} className="py-3 px-6">
                          {column === 'id' ? record.id : renderCellValue(record.data?.[column])}
                        </td>
                      ))}
                      <td className="py-3 px-6">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-400 hover:text-black transition-colors">
                            <Visibility className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-black transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Delete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {getTotalPages() > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to{' '}
                  {Math.min(currentPage * recordsPerPage, getTotalRecords())} of{' '}
                  {getTotalRecords()} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <NavigateBefore className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-black text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                    disabled={currentPage === getTotalPages()}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <NavigateNext className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <TableChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No records match your search criteria.' : 'This table is empty.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Add First Record
            </button>
          </div>
        )}
      </motion.div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New {selectedTable.slice(0, -1)}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {getSelectedSchema() ? (
                <div className="space-y-4">
                  {getSelectedSchema()!.fields
                    .filter(field => field.name !== 'id') // Skip ID field
                    .map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'boolean' ? (
                        <select
                          value={newRecord[field.name] || 'false'}
                          onChange={(e) => setNewRecord(prev => ({
                            ...prev,
                            [field.name]: e.target.value === 'true'
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="false">False</option>
                          <option value="true">True</option>
                        </select>
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          value={newRecord[field.name] || ''}
                          onChange={(e) => setNewRecord(prev => ({
                            ...prev,
                            [field.name]: parseFloat(e.target.value) || 0
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={newRecord[field.name] || ''}
                          onChange={(e) => setNewRecord(prev => ({
                            ...prev,
                            [field.name]: e.target.value
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Schema not found for this table.</p>
              )}
            </div>
            
            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewRecord({})
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add Record
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default DataViewer
