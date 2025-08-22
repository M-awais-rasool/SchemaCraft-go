import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  FilterList,
  Download,
  Receipt,
  CreditCard,
  CheckCircle,
  Schedule,
  Error,
  TrendingUp,
  AttachMoney,
  People,
  Refresh
} from '@mui/icons-material'

const PaymentsSubscriptions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')

  const subscriptions = [
    {
      id: 1,
      user: 'John Doe',
      email: 'john.doe@example.com',
      plan: 'Pro',
      status: 'Active',
      amount: 29,
      nextBilling: '2024-09-20',
      startDate: '2024-01-20',
      paymentMethod: 'Visa ****4242'
    },
    {
      id: 2,
      user: 'Jane Smith',
      email: 'jane.smith@example.com',
      plan: 'Enterprise',
      status: 'Active',
      amount: 99,
      nextBilling: '2024-09-15',
      startDate: '2023-12-15',
      paymentMethod: 'Mastercard ****8888'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      plan: 'Pro',
      status: 'Cancelled',
      amount: 29,
      nextBilling: 'N/A',
      startDate: '2024-02-10',
      paymentMethod: 'Visa ****1234'
    },
    {
      id: 4,
      user: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      plan: 'Pro',
      status: 'Past Due',
      amount: 29,
      nextBilling: '2024-08-25',
      startDate: '2024-03-25',
      paymentMethod: 'PayPal'
    }
  ]

  const recentPayments = [
    {
      id: 1,
      user: 'John Doe',
      amount: 29,
      plan: 'Pro',
      date: '2024-08-20',
      status: 'Completed',
      method: 'Visa ****4242'
    },
    {
      id: 2,
      user: 'Jane Smith',
      amount: 99,
      plan: 'Enterprise',
      date: '2024-08-15',
      status: 'Completed',
      method: 'Mastercard ****8888'
    },
    {
      id: 3,
      user: 'David Brown',
      amount: 29,
      plan: 'Pro',
      date: '2024-08-12',
      status: 'Failed',
      method: 'Visa ****5555'
    },
    {
      id: 4,
      user: 'Emily Davis',
      amount: 29,
      plan: 'Pro',
      date: '2024-08-10',
      status: 'Completed',
      method: 'PayPal'
    }
  ]

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || sub.status.toLowerCase() === filterStatus
    const matchesPlan = filterPlan === 'all' || sub.plan.toLowerCase() === filterPlan

    return matchesSearch && matchesStatus && matchesPlan
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-black text-white'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      case 'past due':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-3 h-3 mr-1" />
      case 'cancelled':
        return <Error className="w-3 h-3 mr-1" />
      case 'past due':
        return <Schedule className="w-3 h-3 mr-1" />
      case 'pending':
        return <Schedule className="w-3 h-3 mr-1" />
      default:
        return <CheckCircle className="w-3 h-3 mr-1" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-black text-white'
      case 'failed':
        return 'bg-gray-100 text-gray-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Payments & Subscriptions</h1>
          <p className="text-gray-600 mt-1">Monitor subscription plans, payments, and billing information.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2">
            <Receipt className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        </div>
      </motion.div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Monthly Revenue', value: '$12,847', icon: AttachMoney, color: 'bg-black', change: '+15.3%' },
          { title: 'Active Subscriptions', value: '1,234', icon: People, color: 'bg-black', change: '+8.2%' },
          { title: 'Avg Revenue per User', value: '$47', icon: TrendingUp, color: 'bg-black', change: '+12.1%' },
          { title: 'Churn Rate', value: '2.3%', icon: Error, color: 'bg-black', change: '-0.5%' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
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
              placeholder="Search subscriptions..."
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
              <option value="cancelled">Cancelled</option>
              <option value="past due">Past Due</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FilterList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscriptions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Subscriptions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">User</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Plan</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Amount</th>
                  <th className="text-left py-3 px-6 text-sm font-semibold text-gray-900">Next Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{subscription.user}</p>
                        <p className="text-sm text-gray-500">{subscription.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {subscription.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {getStatusIcon(subscription.status)}
                        {subscription.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">${subscription.amount}/mo</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-500">{subscription.nextBilling}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
            <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <Refresh className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.user}</p>
                    <p className="text-xs text-gray-500">{payment.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${payment.amount}</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Payments
            </button>
          </div>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Monthly Revenue</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">New Subscriptions</span>
            </div>
          </div>
        </div>
        <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Revenue Chart</p>
            <p className="text-sm text-gray-400">Monthly revenue and subscription trends</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PaymentsSubscriptions
