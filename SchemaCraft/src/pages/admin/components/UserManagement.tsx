import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Add,
  FilterList,
  Search,
  MoreVert,
  Edit,
  Block,
  CheckCircle,
  Email,
  Person,
  AdminPanelSettings,
  Refresh,
  Error,
  Key,
  RestartAlt
} from '@mui/icons-material'
import AdminService from '../../../services/adminService'
import type { User } from '../../../types/auth'
import type { PaginatedUsers } from '../../../services/adminService'

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRole, setFilterRole] = useState('all')
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, pagination.limit])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data: PaginatedUsers = await AdminService.getAllUsers(pagination.page, pagination.limit)
      setUsers(data.users)
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      }))
    } catch (err: any) {
      console.error('Failed to fetch users:', err)
      setError(err.response?.data?.error || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }))
      await AdminService.toggleUserStatus(userId, !currentStatus)
      // Refresh the user list
      await fetchUsers()
    } catch (err: any) {
      console.error('Failed to toggle user status:', err)
      alert(err.response?.data?.error || 'Failed to update user status')
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }))
    }
  }

  const handleRevokeAPIKey = async (userId: string) => {
    if (!confirm('Are you sure you want to revoke this user\'s API key? This action cannot be undone.')) {
      return
    }

    try {
      setActionLoading(prev => ({ ...prev, [`revoke-${userId}`]: true }))
      await AdminService.revokeUserAPIKey(userId)
      // Refresh the user list
      await fetchUsers()
      alert('API key revoked successfully')
    } catch (err: any) {
      console.error('Failed to revoke API key:', err)
      alert(err.response?.data?.error || 'Failed to revoke API key')
    } finally {
      setActionLoading(prev => ({ ...prev, [`revoke-${userId}`]: false }))
    }
  }

  const handleResetUserQuota = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s API quota? This will reset their monthly usage to 0.')) {
      return
    }

    try {
      setActionLoading(prev => ({ ...prev, [`reset-${userId}`]: true }))
      await AdminService.resetUserQuota(userId)
      // Refresh the user list
      await fetchUsers()
      alert('User quota reset successfully')
    } catch (err: any) {
      console.error('Failed to reset user quota:', err)
      alert(err.response?.data?.error || 'Failed to reset user quota')
    } finally {
      setActionLoading(prev => ({ ...prev, [`reset-${userId}`]: false }))
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active)
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'admin' && user.is_admin) ||
                       (filterRole === 'user' && !user.is_admin)

    return matchesSearch && matchesStatus && matchesRole
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
  }

  const getRoleIcon = (isAdmin: boolean) => {
    return isAdmin ? <AdminPanelSettings className="w-4 h-4" /> : <Person className="w-4 h-4" />
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all users on your platform.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={fetchUsers}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Refresh className="w-4 h-4 mr-2" />
            Refresh
          </button>
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
              <option value="user">User</option>
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
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.is_admin)}
                      <span className="text-sm text-gray-900">{user.is_admin ? 'Admin' : 'User'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.is_active)}`}>
                      {user.is_active && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">{user.api_key ? '1' : '0'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{user.last_login ? formatDate(user.last_login) : 'Never'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-500">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Email className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        disabled={actionLoading[user.id]}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      >
                        <Block className="w-4 h-4 text-gray-400 hover:text-black" />
                      </button>
                      {user.api_key && (
                        <button 
                          onClick={() => handleRevokeAPIKey(user.id)}
                          disabled={actionLoading[`revoke-${user.id}`]}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                          title="Revoke API key"
                        >
                          <Key className="w-4 h-4 text-gray-400 hover:text-black" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleResetUserQuota(user.id)}
                        disabled={actionLoading[`reset-${user.id}`]}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="Reset API quota"
                      >
                        <RestartAlt className="w-4 h-4 text-gray-400 hover:text-orange-500" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit className="w-4 h-4 text-gray-400 hover:text-black" />
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
            <span className="font-medium text-gray-900">
              {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            <span>of</span>
            <span className="font-medium text-gray-900">{pagination.total}</span>
            <span>users</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-black text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default UserManagement
