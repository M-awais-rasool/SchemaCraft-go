import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Download,
  People,
  Api,
  Schedule,
  Public,
  Devices,
  Speed,
  Error
} from '@mui/icons-material'

const ReportsAnalytics = () => {
  const timeRanges = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year']
  
  const metrics = [
    {
      title: 'Total API Calls',
      value: '2.4M',
      change: '+15.3%',
      changeType: 'increase',
      period: 'vs last month',
      icon: Api,
      color: 'bg-black'
    },
    {
      title: 'Active Users',
      value: '12,847',
      change: '+8.2%',
      changeType: 'increase',
      period: 'vs last month',
      icon: People,
      color: 'bg-black'
    },
    {
      title: 'Avg Response Time',
      value: '127ms',
      change: '-5.1%',
      changeType: 'decrease',
      period: 'vs last month',
      icon: Speed,
      color: 'bg-black'
    },
    {
      title: 'Error Rate',
      value: '0.8%',
      change: '+0.2%',
      changeType: 'increase',
      period: 'vs last month',
      icon: Error,
      color: 'bg-black'
    }
  ]

  const topAPIs = [
    { name: 'User Management API', calls: 456789, change: '+12%' },
    { name: 'Product Catalog API', calls: 334521, change: '+8%' },
    { name: 'Payment Processing API', calls: 223456, change: '+15%' },
    { name: 'Analytics API', calls: 189012, change: '-3%' },
    { name: 'Inventory API', calls: 156789, change: '+7%' }
  ]

  const topUsers = [
    { name: 'TechCorp Inc.', calls: 125000, apis: 12 },
    { name: 'StartupXYZ', calls: 98000, apis: 8 },
    { name: 'E-commerce Co.', calls: 87000, apis: 15 },
    { name: 'DataFlow Ltd.', calls: 76000, apis: 6 },
    { name: 'CloudSoft', calls: 65000, apis: 9 }
  ]

  const geographicData = [
    { country: 'United States', percentage: 35, requests: '840K' },
    { country: 'United Kingdom', percentage: 15, requests: '360K' },
    { country: 'Germany', percentage: 12, requests: '288K' },
    { country: 'Canada', percentage: 10, requests: '240K' },
    { country: 'Australia', percentage: 8, requests: '192K' },
    { country: 'Others', percentage: 20, requests: '480K' }
  ]

  const deviceData = [
    { type: 'Desktop', percentage: 45, color: 'bg-blue-500' },
    { type: 'Mobile', percentage: 35, color: 'bg-green-500' },
    { type: 'Tablet', percentage: 12, color: 'bg-purple-500' },
    { type: 'Server', percentage: 8, color: 'bg-orange-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your platform usage and performance.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            {timeRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2">
            <Assessment className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.color}`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-1">
                {metric.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4 text-black" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-black" />
                )}
                <span className={`text-sm font-medium text-black`}>
                  {metric.change}
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-500 mt-1">{metric.title}</p>
              <p className="text-xs text-gray-400 mt-1">{metric.period}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Usage Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">API Usage Over Time</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">API Calls</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Unique Users</span>
              </div>
            </div>
          </div>
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Line Chart</p>
              <p className="text-sm text-gray-400">API calls and user trends over time</p>
            </div>
          </div>
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Geographic Distribution</h3>
          <div className="space-y-4">
            {geographicData.map((item) => (
              <div key={item.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Public className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{item.country}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{item.percentage}%</span>
                  <span className="text-sm text-gray-500 w-16 text-right">{item.requests}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top APIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top APIs by Usage</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {topAPIs.map((api, index) => (
              <div key={api.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{api.name}</p>
                    <p className="text-xs text-gray-500">{api.calls.toLocaleString()} calls</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${
                  api.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {api.change}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Most Active Users</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {topUsers.map((user, index) => (
              <div key={user.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.apis} APIs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.calls.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">calls</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Device Types</h3>
            <Devices className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {deviceData.map((device) => (
              <div key={device.type} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${device.color}`}></div>
                  <span className="text-sm font-medium text-gray-900">{device.type}</span>
                </div>
                <span className="text-sm text-gray-600">{device.percentage}%</span>
              </div>
            ))}
          </div>
          <div className="mt-6 h-40 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Devices className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Device Chart</p>
            </div>
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
            <Schedule className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { time: '09:00 - 10:00', requests: '45K', percentage: 85 },
              { time: '14:00 - 15:00', requests: '42K', percentage: 80 },
              { time: '11:00 - 12:00', requests: '38K', percentage: 72 },
              { time: '16:00 - 17:00', requests: '35K', percentage: 66 },
              { time: '10:00 - 11:00', requests: '32K', percentage: 60 }
            ].map((hour) => (
              <div key={hour.time} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{hour.time}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-black h-2 rounded-full"
                      style={{ width: `${hour.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">{hour.requests}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Real-time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Real-time Stats</h3>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600">Live</span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">1,247</p>
              <p className="text-sm text-gray-500">Requests per minute</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">89</p>
              <p className="text-sm text-gray-500">Active connections</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">127ms</p>
              <p className="text-sm text-gray-500">Avg response time</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">99.2%</p>
              <p className="text-sm text-gray-500">Uptime today</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReportsAnalytics
