import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  People,
  Api,
  Error,
  CheckCircle,
  MoreVert,
  Refresh
} from '@mui/icons-material'
import AdminService from '../../../services/adminService'
import type { AdminStats } from '../../../services/adminService'

const DashboardOverview = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setError(null)
      const data = await AdminService.getStats()
      setStats(data)
    } catch (err: any) {
      console.error('Failed to fetch admin stats:', err)
      setError(err.response?.data?.error || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }

  const getStatsCards = () => {
    if (!stats) return []
    
    return [
      {
        title: 'Total Users',
        value: stats.total_users.toLocaleString(),
        change: '+12.5%', // You can calculate this based on historical data
        changeType: 'increase' as const,
        icon: People,
        color: 'bg-black'
      },
      {
        title: 'Active Users',
        value: stats.active_users.toLocaleString(),
        change: '+8.2%',
        changeType: 'increase' as const,
        icon: CheckCircle,
        color: 'bg-black'
      },
      {
        title: 'Total Schemas',
        value: stats.total_schemas.toLocaleString(),
        change: '+15.3%',
        changeType: 'increase' as const,
        icon: Api,
        color: 'bg-black'
      },
      {
        title: 'API Requests',
        value: stats.total_api_requests.toLocaleString(),
        change: '+23.1%',
        changeType: 'increase' as const,
        icon: TrendingUp,
        color: 'bg-black'
      }
    ]
  }

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Created new API', time: '2 minutes ago', status: 'success' },
    { id: 2, user: 'Jane Smith', action: 'Updated database connection', time: '5 minutes ago', status: 'info' },
    { id: 3, user: 'Mike Johnson', action: 'API request failed', time: '8 minutes ago', status: 'error' },
    { id: 4, user: 'Sarah Wilson', action: 'Upgraded to Pro plan', time: '12 minutes ago', status: 'success' },
    { id: 5, user: 'David Brown', action: 'Created user account', time: '15 minutes ago', status: 'info' },
  ]

  const topAPIs = [
    { name: 'User Management API', calls: 12456, status: 'active' },
    { name: 'Product Catalog API', calls: 9876, status: 'active' },
    { name: 'Payment Processing API', calls: 7654, status: 'active' },
    { name: 'Inventory API', calls: 5432, status: 'inactive' },
    { name: 'Analytics API', calls: 3210, status: 'active' },
  ]

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
            onClick={handleRefresh}
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
          >
            <Refresh className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export Data
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all">
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatsCards().map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4 text-black mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-black mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-black' : 'text-black'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">API Usage Over Time</h3>
            <button className="p-1 rounded-lg hover:bg-gray-100">
              <MoreVert className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600">Chart Component</p>
              <p className="text-sm text-gray-400">Integration with Chart.js or Recharts</p>
            </div>
          </div>
        </motion.div>

        {/* Active vs Inactive Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-black rounded-full mr-3"></div>
                <span className="text-gray-700">Active Users</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.active_users?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                <span className="text-gray-700">Inactive Users</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.inactive_users?.toLocaleString() || '0'}</span>
            </div>
            <div className="mt-6">
              <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <People className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Pie Chart</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <button className="text-black hover:text-gray-600 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-black" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.user}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top APIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top APIs</h3>
            <button className="text-black hover:text-gray-600 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {topAPIs.map((api, index) => (
              <div key={api.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-black rounded-lg text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{api.name}</p>
                    <p className="text-xs text-gray-500">{api.calls.toLocaleString()} calls</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    api.status === 'active' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {api.status === 'active' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Error className="w-3 h-3 mr-1" />
                    )}
                    {api.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardOverview
