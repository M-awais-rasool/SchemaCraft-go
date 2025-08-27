import React from 'react'
import { motion } from 'framer-motion'
import {
  Error,
  Upgrade,
  Schedule
} from '@mui/icons-material'
import type { QuotaExceededError } from '../services/quotaService'

interface QuotaExceededAlertProps {
  error: QuotaExceededError
  onClose?: () => void
  showUpgradeButton?: boolean
}

const QuotaExceededAlert: React.FC<QuotaExceededAlertProps> = ({ 
  error, 
  onClose,
  showUpgradeButton = true 
}) => {
  const { quota_info } = error
  const percentage = (quota_info.used / quota_info.limit) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4"
    >
      <div className="flex items-start">
        <Error className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            {error.error}
          </h3>
          
          <p className="text-red-700 mb-4">
            {error.message}
          </p>

          {/* Quota Details */}
          <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
            <h4 className="font-medium text-gray-900 mb-2">Quota Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used this month:</span>
                <span className="font-medium text-red-600">
                  {quota_info.used.toLocaleString()} calls
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly limit:</span>
                <span className="font-medium">
                  {quota_info.limit.toLocaleString()} calls
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Usage:</span>
                <span className="font-medium text-red-600">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-red-500 rounded-full" 
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {showUpgradeButton && (
              <button
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => {
                  // TODO: Implement upgrade flow
                  alert('Upgrade functionality not implemented yet')
                }}
              >
                <Upgrade className="w-4 h-4 mr-2" />
                Upgrade Plan
              </button>
            )}
            
            <button
              className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => {
                // TODO: Show quota reset information
                alert('Your quota will reset at the beginning of next month')
              }}
            >
              <Schedule className="w-4 h-4 mr-2" />
              When does it reset?
            </button>

            {onClose && (
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default QuotaExceededAlert
