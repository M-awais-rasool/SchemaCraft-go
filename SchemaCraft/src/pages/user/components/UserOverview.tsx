import { motion } from 'framer-motion'
import {
  Api,
  Storage,
  TableChart,
  TrendingUp,
  Add,
  Key,
  CheckCircle,
  Timeline
} from '@mui/icons-material'

const UserOverview = () => {
  const stats = [
    {
      title: 'Tables Created',
      value: '12',
      icon: TableChart,
      description: 'Active database tables'
    },
    {
      title: 'API Calls',
      value: '2,847',
      icon: Api,
      description: 'This month'
    },
    {
      title: 'Database Status',
      value: 'Connected',
      icon: Storage,
      description: 'MongoDB Atlas'
    },
    {
      title: 'Uptime',
      value: '99.9%',
      icon: TrendingUp,
      description: 'Last 30 days'
    }
  ]

  const quickActions = [
    {
      title: 'Connect MongoDB',
      description: 'Set up your database connection',
      icon: Storage,
      action: 'mongodb'
    },
    {
      title: 'View API Key',
      description: 'Manage your authentication',
      icon: Key,
      action: 'apikey'
    },
    {
      title: 'Create Table',
      description: 'Design your data schema',
      icon: Add,
      action: 'tables'
    }
  ]

  const recentActivity = [
    { action: 'Created table "users"', time: '2 hours ago', type: 'create' },
    { action: 'API call to /products', time: '5 hours ago', type: 'api' },
    { action: 'Updated "orders" schema', time: '1 day ago', type: 'update' },
    { action: 'Connected MongoDB database', time: '2 days ago', type: 'connect' },
    { action: 'Generated new API key', time: '3 days ago', type: 'security' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
            <p className="text-gray-600 mt-2">
              Your API builder is ready. You have 12 active tables and your database is connected.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Quick Tip</h3>
          <p className="text-sm text-gray-600">
            Use the API Key page to regenerate your authentication token if needed. 
            Keep it secure and never share it publicly.
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className="p-3 rounded-lg bg-black">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:border-black hover:shadow-md transition-all group text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-black transition-colors">
                  <action.icon className="w-5 h-5 text-gray-600 group-hover:text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity & API Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Timeline className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-black" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* API Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Available Endpoints</h2>
            <Api className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-gray-900">GET /api/users</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <span className="text-xs text-gray-600">Active</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-gray-900">POST /api/users</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <span className="text-xs text-gray-600">Active</span>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-gray-900">GET /api/products</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <span className="text-xs text-gray-600">Active</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 p-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            View All Endpoints
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default UserOverview
