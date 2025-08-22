import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Delete,
  PlayArrow,
  Pause,
  Visibility,
  Code,
  TrendingUp,
  Error,
  CheckCircle,
  Schedule,
  Edit
} from '@mui/icons-material'

const APIManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-black text-white'
      case 'Inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUpDownColor = (rate: number) => {
    if (rate >= 99) return 'text-black'
    if (rate >= 95) return 'text-black'
    return 'text-black'
  }

  const apis = [
    {
      id: 1,
      name: 'User Management API',
      endpoint: '/api/v1/users',
      owner: 'John Doe',
      status: 'Active',
      requestCount: 12456,
      lastUsed: '2 minutes ago',
      created: '2024-01-15',
      responseTime: '120ms',
      successRate: 99.8,
      method: 'REST'
    },
    {
      id: 2,
      name: 'Product Catalog API',
      endpoint: '/api/v1/products',
      owner: 'Jane Smith',
      status: 'Active',
      requestCount: 9876,
      lastUsed: '5 minutes ago',
      created: '2024-02-10',
      responseTime: '95ms',
      successRate: 99.5,
      method: 'REST'
    },
    {
      id: 3,
      name: 'Payment Processing API',
      endpoint: '/api/v1/payments',
      owner: 'Mike Johnson',
      status: 'Inactive',
      requestCount: 7654,
      lastUsed: '2 hours ago',
      created: '2024-01-20',
      responseTime: '200ms',
      successRate: 98.2,
      method: 'REST'
    },
    {
      id: 4,
      name: 'Inventory API',
      endpoint: '/api/v1/inventory',
      owner: 'Sarah Wilson',
      status: 'Error',
      requestCount: 5432,
      lastUsed: '1 hour ago',
      created: '2024-03-05',
      responseTime: '350ms',
      successRate: 85.7,
      method: 'GraphQL'
    },
    {
      id: 5,
      name: 'Analytics API',
      endpoint: '/api/v1/analytics',
      owner: 'David Brown',
      status: 'Active',
      requestCount: 3210,
      lastUsed: '10 minutes ago',
      created: '2024-02-28',
      responseTime: '75ms',
      successRate: 99.9,
      method: 'REST'
    }
  ]

  const filteredAPIs = apis.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.owner.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || api.status.toLowerCase() === filterStatus

    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-3 h-3 mr-1" />
      case 'inactive':
        return <Pause className="w-3 h-3 mr-1" />
      case 'error':
        return <Error className="w-3 h-3 mr-1" />
      case 'maintenance':
        return <Schedule className="w-3 h-3 mr-1" />
      default:
        return <CheckCircle className="w-3 h-3 mr-1" />
    }
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99) return 'text-green-600'
    if (rate >= 95) return 'text-yellow-600'
    return 'text-red-600'
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
          <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all APIs created by your users.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export APIs
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2">
            <Add className="w-4 h-4" />
            <span>Create API</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total APIs', value: '1,234', icon: Code, color: 'bg-black' },
          { title: 'Active APIs', value: '987', icon: CheckCircle, color: 'bg-black' },
          { title: 'Total Requests Today', value: '45.6K', icon: TrendingUp, color: 'bg-black' },
          { title: 'Error Rate', value: '0.8%', icon: Error, color: 'bg-black' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search APIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="error">Error</option>
              <option value="maintenance">Maintenance</option>
            </select>

            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FilterList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* APIs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">API Details</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Owner</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Requests</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Performance</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Last Used</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAPIs.map((api, index) => (
                <motion.tr
                  key={api.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900">{api.name}</p>
                      <p className="text-sm text-gray-500 font-mono">{api.endpoint}</p>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {api.method}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {api.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-gray-900">{api.owner}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(api.status)}`}>
                      {getStatusIcon(api.status)}
                      {api.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{api.requestCount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">total requests</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{api.responseTime}</p>
                      <p className={`text-xs font-medium ${getSuccessRateColor(api.successRate)}`}>
                        {api.successRate}% success
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{api.lastUsed}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Visibility className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Code className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      {api.status === 'Active' ? (
                        <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                          <Pause className="w-4 h-4 text-gray-400 hover:text-orange-600" />
                        </button>
                      ) : (
                        <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                          <PlayArrow className="w-4 h-4 text-gray-400 hover:text-green-600" />
                        </button>
                      )}
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Delete className="w-4 h-4 text-gray-400 hover:text-red-600" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreVert className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Showing</span>
            <span className="font-medium text-gray-900">1-{filteredAPIs.length}</span>
            <span>of</span>
            <span className="font-medium text-gray-900">{apis.length}</span>
            <span>APIs</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default APIManagement
