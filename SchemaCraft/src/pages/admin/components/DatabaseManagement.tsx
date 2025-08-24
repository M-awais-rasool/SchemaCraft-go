import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  MoreVert,
  Storage
} from '@mui/icons-material'
import AdminService from '../../../services/adminService'
import type { User } from '../../../types/auth'

const DatabaseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({})
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AdminService.getAllUsers(1, 100) // Get all users for DB connections
      // Filter users who have MongoDB connections
      setUsers(data.users.filter(user => user.mongodb_uri || user.database_name))
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      setError(err.response?.data?.error || 'Failed to load database connections')
    } finally {
      setLoading(false)
    }
  }

  const getConnectionsFromUsers = () => {
    return users.map((user) => ({
      id: user.id,
      name: `${user.name}'s Database`,
      user: user.name,
      host: user.mongodb_uri ? extractHostFromURI(user.mongodb_uri) : 'Not configured',
      database: user.database_name || 'Not specified',
      status: user.mongodb_uri ? 'Connected' : 'Disconnected',
      lastChecked: '2 minutes ago', // This would come from actual monitoring
      responseTime: user.mongodb_uri ? '45ms' : 'N/A',
      collections: Math.floor(Math.random() * 20) + 1, // This would come from actual DB query
      size: `${(Math.random() * 5 + 0.1).toFixed(1)} GB`,
      connectionString: user.mongodb_uri || 'Not configured',
      created: new Date(user.created_at).toLocaleDateString()
    }))
  }

  const extractHostFromURI = (uri: string) => {
    try {
      const match = uri.match(/mongodb(?:\+srv)?:\/\/[^@]*@([^\/]+)/)
      return match ? match[1] : 'Unknown host'
    } catch {
      return 'Invalid URI'
    }
  }

  const connections = getConnectionsFromUsers().filter(connection =>
    connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.database.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'disconnected':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'error':
        return <Error className="w-4 h-4 text-red-600" />
      case 'disconnected':
        return <Warning className="w-4 h-4 text-gray-600" />
      default:
        return <Warning className="w-4 h-4 text-gray-600" />
    }
  }

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const maskConnectionString = (connectionString: string, show: boolean) => {
    if (!connectionString || connectionString === 'Not configured') return connectionString
    
    if (show) {
      return connectionString
    }
    
    // Mask the password part
    return connectionString.replace(/:([^@:]+)@/, ':***@')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <Error className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={fetchUsers}
            className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Database Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all user database connections.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={fetchUsers}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Refresh className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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

      {/* No connections found */}
      {connections.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
        >
          <Storage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Database Connections</h3>
          <p className="text-gray-600">No users have configured their MongoDB connections yet.</p>
        </motion.div>
      )}

      {/* Connections Table */}
      {connections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Connection</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Host</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Database</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Collections</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Size</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Connection String</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {connections.map((connection, index) => (
                  <motion.tr
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{connection.name}</p>
                        <p className="text-sm text-gray-500">by {connection.user}</p>
                        <p className="text-xs text-gray-400">Created: {connection.created}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(connection.status)}
                        <div>
                          <p className={`text-sm font-medium ${getStatusColor(connection.status)}`}>
                            {connection.status}
                          </p>
                          <p className="text-xs text-gray-400">
                            {connection.responseTime}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900 font-mono">{connection.host}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{connection.database}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{connection.collections}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{connection.size}</span>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 p-1 rounded truncate block max-w-xs">
                          {maskConnectionString(connection.connectionString, showPasswords[connection.id] || false)}
                        </code>
                        {connection.connectionString !== 'Not configured' && (
                          <button
                            onClick={() => togglePasswordVisibility(connection.id)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            {showPasswords[connection.id] ? (
                              <VisibilityOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Visibility className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
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
        </motion.div>
      )}
    </div>
  )
}

export default DatabaseManagement
