import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Code,
  ContentCopy,
  Launch,
  ExpandMore,
  ExpandLess,
  Api,
  Info,
  SecurityOutlined
} from '@mui/icons-material'
import { UserService } from '../../../services/userService'
import { AuthService } from '../../../services/authService'

interface APIDoc {
  info: {
    title: string
    description: string
    version: string
    contact: {
      name: string
      email: string
    }
  }
  host: string
  basePath: string
  schemes: string[]
  api_key: string
  paths: Record<string, any>
  schemas: any[]
}

interface EndpointMethod {
  summary: string
  description: string
  tags: string[]
  parameters?: any[]
  responses: Record<string, any>
}

const APIDocumentation = () => {
  const [apiDoc, setApiDoc] = useState<APIDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState(false)

  useEffect(() => {
    fetchAPIDocumentation()
  }, [])

  const fetchAPIDocumentation = async () => {
    try {
      setLoading(true)
      const response = await UserService.getAPIDocumentation()
      setApiDoc(response)
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch API documentation')
    } finally {
      setLoading(false)
    }
  }

  const copyAPIKey = () => {
    if (apiDoc?.api_key) {
      navigator.clipboard.writeText(apiDoc.api_key)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  const toggleEndpoint = (path: string) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'get': return 'bg-blue-100 text-blue-800'
      case 'post': return 'bg-green-100 text-green-800'
      case 'put': return 'bg-yellow-100 text-yellow-800'
      case 'delete': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderEndpoint = (path: string, methods: Record<string, EndpointMethod>) => {
    const isExpanded = expandedEndpoints[path]

    return (
      <motion.div
        key={path}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
      >
        <div 
          className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleEndpoint(path)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-gray-800 font-medium">{path}</span>
              <div className="flex space-x-2">
                {Object.keys(methods).map(method => (
                  <span
                    key={method}
                    className={`px-2 py-1 rounded text-xs font-medium uppercase ${getMethodColor(method)}`}
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200">
            {Object.entries(methods).map(([method, details]) => (
              <div key={method} className="p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start space-x-3 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getMethodColor(method)}`}>
                    {method}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{details.summary}</h4>
                    <p className="text-sm text-gray-600 mt-1">{details.description}</p>
                  </div>
                </div>

                {details.parameters && details.parameters.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Parameters</h5>
                    <div className="bg-gray-50 rounded-lg p-3">
                      {details.parameters.map((param, index) => (
                        <div key={index} className="mb-2 last:mb-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm text-blue-600">{param.name}</span>
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                              {param.in}
                            </span>
                            {param.required && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                required
                              </span>
                            )}
                          </div>
                          {param.description && (
                            <p className="text-sm text-gray-600 mt-1">{param.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Responses</h5>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {Object.entries(details.responses).map(([code, response]: [string, any]) => (
                      <div key={code} className="flex items-center space-x-2 mb-1 last:mb-0">
                        <span className={`font-mono text-sm px-2 py-1 rounded ${
                          code.startsWith('2') ? 'bg-green-100 text-green-800' :
                          code.startsWith('4') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {code}
                        </span>
                        <span className="text-sm text-gray-600">{response.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchAPIDocumentation}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!apiDoc) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No API documentation available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">{apiDoc.info.title}</h1>
        <p className="text-gray-600 mt-1">{apiDoc.info.description}</p>
      </motion.div>

      {/* API Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">API Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Base URL</h3>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
              {apiDoc.schemes[0]}://{apiDoc.host}{apiDoc.basePath}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Version</h3>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
              {apiDoc.info.version}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Authentication */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <SecurityOutlined className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Authentication</h2>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-3">
            Use your API key in the request header:
          </p>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm border">
            <div className="flex items-center justify-between">
              <span>X-API-Key: {apiDoc.api_key}</span>
              <button
                onClick={copyAPIKey}
                className="ml-2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                title="Copy API key"
              >
                <ContentCopy className="w-4 h-4" />
              </button>
            </div>
          </div>
          {copiedKey && (
            <p className="text-green-600 text-sm mt-2">API key copied to clipboard!</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Example Request</h4>
          <div className="bg-white rounded border p-3 font-mono text-sm">
            <div className="text-gray-600">curl -H "X-API-Key: {apiDoc.api_key}" \</div>
            <div className="text-gray-600 ml-4">{apiDoc.schemes[0]}://{apiDoc.host}{apiDoc.basePath}/your-collection</div>
          </div>
        </div>
      </motion.div>

      {/* Available Endpoints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Api className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Available Endpoints</h2>
        </div>

        {Object.keys(apiDoc.paths).length === 0 ? (
          <div className="text-center py-8">
            <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No API endpoints available yet</p>
            <p className="text-sm text-gray-500">Create a schema to generate API endpoints</p>
          </div>
        ) : (
          <div>
            {Object.entries(apiDoc.paths).map(([path, methods]) => 
              renderEndpoint(path, methods as Record<string, EndpointMethod>)
            )}
          </div>
        )}
      </motion.div>

      {/* Interactive Documentation Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Interactive Documentation</h3>
            <p className="text-gray-600">
              Try your APIs interactively with the full Swagger documentation
            </p>
          </div>
          <button
            onClick={() => {
              // Get the JWT token from AuthService with proper error handling
              const token = AuthService.getStoredToken()
              if (!token) {
                alert('No authentication token found. Please log in again.')
                return
              }
               
              // Open user-specific Swagger UI
              const baseUrl = process.env.NODE_ENV === 'production' 
                ? 'https://your-domain.com' 
                : 'http://localhost:8080'
              
              // Open the user-specific Swagger UI in a new tab
              window.open(`${baseUrl}/user/swagger-ui?token=${token}`, '_blank')
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Launch className="w-4 h-4" />
            <span>Open Swagger UI</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default APIDocumentation
