import { useState } from 'react'
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
  NavigateNext
} from '@mui/icons-material'

interface DataRecord {
  id: string
  [key: string]: any
}

const DataViewer = () => {
  const [selectedTable, setSelectedTable] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)

  const tables = ['users', 'products', 'orders']
  const recordsPerPage = 10

  const sampleData: Record<string, DataRecord[]> = {
    users: [
      { id: '1', name: 'John Doe', email: 'john@example.com', age: 28, active: true },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 32, active: true },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 45, active: false },
      { id: '4', name: 'Alice Brown', email: 'alice@example.com', age: 29, active: true },
      { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', age: 35, active: true }
    ],
    products: [
      { id: '1', title: 'Laptop', price: 999, inStock: true, category: 'Electronics' },
      { id: '2', title: 'Mouse', price: 25, inStock: false, category: 'Electronics' },
      { id: '3', title: 'Keyboard', price: 75, inStock: true, category: 'Electronics' }
    ],
    orders: [
      { id: '1', userId: '1', total: 1024, status: 'completed', date: '2024-08-20' },
      { id: '2', userId: '2', total: 25, status: 'pending', date: '2024-08-21' }
    ]
  }

  const currentData = sampleData[selectedTable] || []
  const filteredData = currentData.filter(record =>
    Object.values(record).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filteredData.length / recordsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  )

  const getTableColumns = () => {
    if (currentData.length === 0) return []
    return Object.keys(currentData[0])
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
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Add className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </motion.div>

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
              {tables.map(table => (
                <option key={table} value={table}>{table}</option>
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
                {selectedTable} ({filteredData.length} records)
              </h2>
            </div>
          </div>
        </div>

        {paginatedData.length > 0 ? (
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
                  {paginatedData.map((record, index) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {getTableColumns().map(column => (
                        <td key={column} className="py-3 px-6">
                          {renderCellValue(record[column])}
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
                          <button className="p-1 text-gray-400 hover:text-black transition-colors">
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
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * recordsPerPage + 1} to{' '}
                  {Math.min(currentPage * recordsPerPage, filteredData.length)} of{' '}
                  {filteredData.length} results
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
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
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add New {selectedTable.slice(0, -1)}
              </h3>
              <p className="text-gray-600 mb-4">
                This is a demo. In a real application, you would have a form here to add new records to your {selectedTable} table.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    alert('Record added successfully!')
                  }}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Record
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default DataViewer
