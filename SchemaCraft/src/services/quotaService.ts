import api from './api'

export interface QuotaInfo {
  used: number
  limit: number
}

export interface QuotaExceededError {
  error: string
  message: string
  quota_info: QuotaInfo
}

export interface APIUsageStats {
  overall_stats: {
    total_usage: number
    total_quota: number
    usage_percentage: number
    total_users: number
    high_usage_users: number
    quota_exceeded_users: number
  }
  high_usage_users: Array<{
    id: string
    name: string
    email: string
    used_this_month: number
    monthly_quota: number
    usage_percentage: number
    last_request: string
  }>
  quota_exceeded_users: Array<{
    id: string
    name: string
    email: string
    used_this_month: number
    monthly_quota: number
    usage_percentage: number
    last_request: string
  }>
  threshold_percentage: number
}

class QuotaService {
  // Get API usage statistics (Admin only)
  static async getAPIUsageStats(threshold = 80): Promise<APIUsageStats> {
    const response = await api.get(`/admin/api-usage?threshold=${threshold}`)
    return response.data
  }

  // Reset a user's API quota (Admin only)
  static async resetUserQuota(userId: string): Promise<{ message: string }> {
    const response = await api.post(`/admin/users/${userId}/reset-quota`)
    return response.data
  }

  // Check if an error is a quota exceeded error
  static isQuotaExceededError(error: any): error is { response: { data: QuotaExceededError; status: 429 } } {
    return (
      error?.response?.status === 429 &&
      error?.response?.data?.error === 'API quota exceeded'
    )
  }

  // Format quota usage percentage
  static formatUsagePercentage(used: number, limit: number): string {
    const percentage = (used / limit) * 100
    return `${percentage.toFixed(1)}%`
  }

  // Get quota status color based on usage percentage
  static getQuotaStatusColor(used: number, limit: number): string {
    const percentage = (used / limit) * 100
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-orange-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Get quota status message
  static getQuotaStatusMessage(used: number, limit: number): string {
    const percentage = (used / limit) * 100
    const remaining = limit - used

    if (percentage >= 100) {
      return 'Quota exceeded! No API calls remaining.'
    }
    if (percentage >= 90) {
      return `Critical: Only ${remaining} API calls remaining (${percentage.toFixed(1)}% used).`
    }
    if (percentage >= 80) {
      return `Warning: ${remaining} API calls remaining (${percentage.toFixed(1)}% used).`
    }
    if (percentage >= 50) {
      return `${remaining} API calls remaining (${percentage.toFixed(1)}% used).`
    }
    return `${remaining} API calls remaining.`
  }
}

export default QuotaService
