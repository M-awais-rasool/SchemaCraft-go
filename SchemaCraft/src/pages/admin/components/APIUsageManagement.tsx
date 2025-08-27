import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Assessment,
  People,
  Warning,
  Error,
  CheckCircle,
  Refresh,
  RestartAlt,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material'
import AdminService from '../../../services/adminService'
import type { APIUsageStats } from '../../../services/adminService'

const APIUsageManagement = () => {
  const [usageStats, setUsageStats] = useState<APIUsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(80)
  const [resetingQuota, setResetingQuota] = useState<string | null>(null)

  useEffect(() => {
    fetchUsageStats()
  }, [threshold])

  const fetchUsageStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const stats = await AdminService.getAPIUsageStats(threshold)
      setUsageStats(stats)
    } catch (err: any) {
      console.error('Failed to fetch API usage stats:', err)
      setError('Failed to load API usage statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleResetQuota = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to reset the API quota for ${userName}? This will set their monthly usage back to 0.`)) {
      return
    }

    try {
      setResetingQuota(userId)
      await AdminService.resetUserQuota(userId)
      
      // Refresh the data
      await fetchUsageStats()
      
      alert(`Successfully reset API quota for ${userName}`)
    } catch (err: any) {
      console.error('Failed to reset quota:', err)
      alert('Failed to reset quota. Please try again.')
    } finally {
      setResetingQuota(null)
    }
  }

  const getStatusIcon = (used: number, limit: number) => {
    const percentage = (used / limit) * 100
    if (percentage >= 100) return <Error className="w-5 h-5 text-red-600" />
    if (percentage >= 90) return <Warning className="w-5 h-5 text-orange-600" />
    if (percentage >= 80) return <Warning className="w-5 h-5 text-yellow-600" />
    return <CheckCircle className="w-5 h-5 text-green-600" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
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
          <Error className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchUsageStats}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Usage Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage user API quotas</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Threshold:</label>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value={50}>50%</option>
              <option value={70}>70%</option>
              <option value={80}>80%</option>
              <option value={90}>90%</option>
            </select>
          </div>
          <button
            onClick={fetchUsageStats}
            className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Refresh className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </motion.div>

      {usageStats && (
        <>
          {/* Overall Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total API Calls</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {usageStats?.overall_stats.total_usage?.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100">
                  <Assessment className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {usageStats.overall_stats.total_users}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100">
                  <People className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">High Usage Users</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {usageStats.overall_stats.high_usage_users}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">≥{threshold}% quota</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Quota Exceeded</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {usageStats.overall_stats.quota_exceeded_users}
                  </p>
                  <p className="text-xs text-red-600 mt-1">100% quota</p>
                </div>
                <div className="p-3 rounded-lg bg-red-100">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quota Exceeded Users */}
          {usageStats?.quota_exceeded_users?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Error className="w-6 h-6 text-red-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Users with Exceeded Quotas ({usageStats?.quota_exceeded_users?.length})
                  </h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Request</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usageStats.quota_exceeded_users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.used_this_month, user.monthly_quota)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.used_this_month.toLocaleString()} / {user.monthly_quota.toLocaleString()}
                              </div>
                              <div className="text-sm text-red-600">{user.usage_percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_request ? formatDate(user.last_request) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleResetQuota(user.id, user.name)}
                            disabled={resetingQuota === user.id}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <RestartAlt className="w-4 h-4" />
                            <span>{resetingQuota === user.id ? 'Resetting...' : 'Reset Quota'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* High Usage Users */}
          {usageStats?.high_usage_users?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Warning className="w-6 h-6 text-orange-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    High Usage Users ({usageStats?.high_usage_users?.length})
                  </h2>
                  <span className="text-sm text-gray-500">≥{threshold}% of quota</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Request</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usageStats.high_usage_users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(user.used_this_month, user.monthly_quota)}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.used_this_month.toLocaleString()} / {user.monthly_quota.toLocaleString()}
                              </div>
                              <div className={`text-sm ${AdminService.getUsageStatusColor(user.used_this_month, user.monthly_quota)}`}>
                                {user.usage_percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_request ? formatDate(user.last_request) : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleResetQuota(user.id, user.name)}
                            disabled={resetingQuota === user.id}
                            className="flex items-center space-x-1 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                          >
                            <RestartAlt className="w-4 h-4" />
                            <span>{resetingQuota === user.id ? 'Resetting...' : 'Reset Quota'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
        {usageStats?.quota_exceeded_users?.length === 0 && usageStats?.high_usage_users?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Users Within Limits</h3>
              <p className="text-gray-600">
                No users are currently above the {threshold}% usage threshold. Everyone is within their API quota limits.
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default APIUsageManagement
