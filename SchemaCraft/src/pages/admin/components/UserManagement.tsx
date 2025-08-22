import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Add,
  FilterList,
  Search,
  MoreVert,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Email,
  Person,
  AdminPanelSettings
} from '@mui/icons-material'

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRole, setFilterRole] = useState('all')

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Developer',
      status: 'Active',
      apiKeys: 3,
      lastLogin: '2024-08-20',
      joinDate: '2024-01-15',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Admin',
      status: 'Active',
      apiKeys: 5,
      lastLogin: '2024-08-22',
      joinDate: '2023-12-10',
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      role: 'Developer',
      status: 'Inactive',
      apiKeys: 1,
      lastLogin: '2024-08-15',
      joinDate: '2024-03-20',
      avatar: 'MJ'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      role: 'Manager',
      status: 'Active',
      apiKeys: 7,
      lastLogin: '2024-08-21',
      joinDate: '2023-11-05',
      avatar: 'SW'
    },
    {
      id: 5,
      name: 'David Brown',
      email: 'david.brown@example.com',
      role: 'Developer',
      status: 'Suspended',
      apiKeys: 2,
      lastLogin: '2024-08-10',
      joinDate: '2024-02-28',
      avatar: 'DB'
    }
  ]

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole

    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'Active':
        return 'bg-black text-white'
      case 'Suspended':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <AdminPanelSettings className="w-4 h-4" />
      case 'manager':
        return <Person className="w-4 h-4" />
      default:
        return <Person className="w-4 h-4" />
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all users on your platform.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all flex items-center space-x-2">
            <Add className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="developer">Developer</option>
            </select>

            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FilterList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
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
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">API Keys</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Last Login</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900">Join Date</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-semibold">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      <span className="text-sm text-gray-900">{user.role}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'Active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">{user.apiKeys}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{user.lastLogin}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{user.joinDate}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Email className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Block className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Delete className="w-4 h-4 text-gray-400 hover:text-black" />
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
            <span className="font-medium text-gray-900">1-{filteredUsers.length}</span>
            <span>of</span>
            <span className="font-medium text-gray-900">{users.length}</span>
            <span>users</span>
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

export default UserManagement
