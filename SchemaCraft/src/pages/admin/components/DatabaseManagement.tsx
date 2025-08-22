import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Add,
  Search,
  Edit,
  Delete,
  CheckCircle,
  Error,
  Warning,
  Storage,
  CloudSync,
  Security,
  Speed,
  Refresh,
  Visibility,
  VisibilityOff
} from '@mui/icons-material'

const DatabaseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showPasswords, setShowPasswords] = useState<{[key: number]: boolean}>({})

  const connections = [
    {
      id: 1,
      name: 'Production DB',
      user: 'John Doe',
      host: 'cluster0.mongodb.net',
      database: 'production_app',
      status: 'Connected',
      lastChecked: '2 minutes ago',
      responseTime: '45ms',
      collections: 12,
      size: '2.4 GB',
      connectionString: 'mongodb+srv://user:***@cluster0.mongodb.net/production_app',
      created: '2024-01-15'
    },
    {
      id: 2,
      name: 'Development DB',
      user: 'Jane Smith',
      host: 'cluster1.mongodb.net',
      database: 'dev_environment',
      status: 'Connected',
      lastChecked: '5 minutes ago',
      responseTime: '32ms',
      collections: 8,
      size: '458 MB',
      connectionString: 'mongodb+srv://devuser:***@cluster1.mongodb.net/dev_environment',
      created: '2024-02-01'
    },
    {
      id: 3,
      name: 'Analytics DB',
      user: 'Mike Johnson',
      host: 'analytics-cluster.mongodb.net',
      database: 'analytics_data',
      status: 'Error',
      lastChecked: '1 hour ago',
      responseTime: 'N/A',
      collections: 5,
      size: '1.2 GB',
      connectionString: 'mongodb+srv://analytics:***@analytics-cluster.mongodb.net/analytics_data',
      created: '2024-01-28'
    },
    {
      id: 4,
      name: 'Testing DB',
      user: 'Sarah Wilson',
      host: 'test-cluster.mongodb.net',
      database: 'test_suite',
      status: 'Disconnected',
      lastChecked: '30 minutes ago',
      responseTime: 'N/A',
      collections: 3,
      size: '125 MB',
      connectionString: 'mongodb+srv://tester:***@test-cluster.mongodb.net/test_suite',
      created: '2024-02-15'
    }
  ]

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.database.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'bg-green-100 text-green-800'
      case 'disconnected':
        return 'bg-gray-100 text-gray-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return <CheckCircle className="w-3 h-3 mr-1" />
      case 'disconnected':
        return <CloudSync className="w-3 h-3 mr-1" />
      case 'error':
        return <Error className="w-3 h-3 mr-1" />
      case 'warning':
        return <Warning className="w-3 h-3 mr-1" />
      default:
        return <CheckCircle className="w-3 h-3 mr-1" />
    }
  }

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const maskConnectionString = (connectionString: string, show: boolean) => {
    if (show) {
      return connectionString.replace('***', 'actualPassword123')
    }
    return connectionString
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
          <h1 className="text-2xl font-bold text-gray-900">Database Connections</h1>
          <p className="text-gray-600 mt-1">Manage MongoDB connections for all users and monitor their health.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Refresh className="w-4 h-4" />
            <span>Test All</span>
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center space-x-2">
            <Add className="w-4 h-4" />
            <span>Add Connection</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Connections', value: '24', icon: Storage, color: 'from-blue-500 to-blue-600' },
          { title: 'Active Connections', value: '18', icon: CheckCircle, color: 'from-green-500 to-green-600' },
          { title: 'Avg Response Time', value: '67ms', icon: Speed, color: 'from-purple-500 to-purple-600' },
          { title: 'Connection Errors', value: '3', icon: Error, color: 'from-red-500 to-red-600' }
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
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search connections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Connections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredConnections.map((connection, index) => (
          <motion.div
            key={connection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Storage className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{connection.name}</h3>
                  <p className="text-sm text-gray-500">Owner: {connection.user}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                  {getStatusIcon(connection.status)}
                  {connection.status}
                </span>
              </div>
            </div>

            {/* Connection Details */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Host</p>
                  <p className="font-medium text-gray-900">{connection.host}</p>
                </div>
                <div>
                  <p className="text-gray-500">Database</p>
                  <p className="font-medium text-gray-900">{connection.database}</p>
                </div>
                <div>
                  <p className="text-gray-500">Collections</p>
                  <p className="font-medium text-gray-900">{connection.collections}</p>
                </div>
                <div>
                  <p className="text-gray-500">Size</p>
                  <p className="font-medium text-gray-900">{connection.size}</p>
                </div>
                <div>
                  <p className="text-gray-500">Response Time</p>
                  <p className={`font-medium ${connection.status === 'Connected' ? 'text-green-600' : 'text-gray-500'}`}>
                    {connection.responseTime}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Checked</p>
                  <p className="font-medium text-gray-900">{connection.lastChecked}</p>
                </div>
              </div>

              {/* Connection String */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500">Connection String</p>
                  <button
                    onClick={() => togglePasswordVisibility(connection.id)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    {showPasswords[connection.id] ? (
                      <VisibilityOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Visibility className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <code className="text-xs text-gray-700 break-all">
                    {maskConnectionString(connection.connectionString, showPasswords[connection.id] || false)}
                  </code>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Created: {connection.created}
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Refresh className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Edit className="w-4 h-4 text-gray-400 hover:text-green-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Security className="w-4 h-4 text-gray-400 hover:text-purple-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Delete className="w-4 h-4 text-gray-400 hover:text-red-600" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Connection Form (could be a modal) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Connection Test</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Connection Name</label>
            <input
              type="text"
              placeholder="e.g., Production DB"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Database Name</label>
            <input
              type="text"
              placeholder="e.g., my_database"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">MongoDB Connection String</label>
            <input
              type="text"
              placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2 flex space-x-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Test Connection
            </button>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
              Save Connection
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default DatabaseManagement
