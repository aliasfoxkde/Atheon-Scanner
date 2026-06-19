import { useState } from 'react'

export default function ApiDocs() {
  const [activeEndpoint, setActiveEndpoint] = useState(null)
  const [requestBody, setRequestBody] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)

  const endpoints = [
    {
      id: 'scan',
      method: 'POST',
      path: '/api/scan',
      description: 'Submit a repository for comprehensive security and quality analysis',
      parameters: [
        { name: 'type', type: 'string', required: true, description: 'Submission type (github, url, upload)' },
        { name: 'repo', type: 'string', required: false, description: 'Repository identifier (owner/name) for github type' },
        { name: 'url', type: 'string', required: false, description: 'Repository URL for url type' },
        { name: 'files', type: 'file[]', required: false, description: 'Uploaded files for upload type' }
      ],
      requestBody: `{
  "type": "github",
  "repo": "facebook/react"
}`,
      response: `{
  "success": true,
  "result": {
    "repository": {
      "name": "react",
      "owner": "facebook",
      "stars": 220000,
      "language": "JavaScript"
    },
    "qualityScore": 85,
    "tier": "B",
    "findings": [
      {
        "type": "security",
        "severity": "high",
        "description": "Potential secret detected in configuration file"
      }
    ]
  },
  "scanId": "scan_abc123"
}`
    },
    {
      id: 'reports',
      method: 'GET',
      path: '/api/reports',
      description: 'Retrieve comprehensive scan reports with filtering capabilities',
      parameters: [
        { name: 'category', type: 'string', required: false, description: 'Filter by category (web-framework, cli-tool, ml-ai, etc.)' },
        { name: 'tier', type: 'string', required: false, description: 'Filter by quality tier (A, B, C, D, F)' },
        { name: 'language', type: 'string', required: false, description: 'Filter by programming language' },
        { name: 'minScore', type: 'number', required: false, description: 'Minimum quality score (0-100)' }
      ],
      requestBody: null,
      response: `{
  "success": true,
  "reports": [
    {
      "id": "report_1",
      "repo_name": "facebook/react",
      "category": "web-framework",
      "language": "JavaScript",
      "stars": 220000,
      "quality_score": 85,
      "tier": "B",
      "total_findings": 12,
      "scan_date": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "perPage": 20
}`
    },
    {
      id: 'report-detail',
      method: 'GET',
      path: '/api/reports/:id',
      description: 'Retrieve detailed analysis report for a specific repository',
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Report identifier' }
      ],
      requestBody: null,
      response: `{
  "success": true,
  "report": {
    "id": "report_1",
    "repository": {
      "name": "react",
      "full_name": "facebook/react",
      "description": "A declarative JavaScript library for building user interfaces"
    },
    "analysis": {
      "quality_score": 85,
      "tier": "B",
      "findings": {
        "critical": 0,
        "high": 2,
        "medium": 8,
        "low": 2
      },
      "metrics": {
        "code_quality": 78,
        "security": 92,
        "maintainability": 85,
        "documentation": 80
      }
    },
    "findings": [
      {
        "type": "security",
        "severity": "high",
        "file": "src/auth.js",
        "line": 45,
        "description": "Hardcoded API key detected"
      }
    ]
  }
}`
    },
    {
      id: 'trending',
      method: 'GET',
      path: '/api/trending',
      description: 'Fetch trending repositories by language and time period',
      parameters: [
        { name: 'language', type: 'string', required: false, description: 'Programming language filter' },
        { name: 'since', type: 'string', required: false, description: 'Time period (daily, weekly, monthly)' },
        { name: 'limit', type: 'number', required: false, description: 'Maximum results (default: 10)' }
      ],
      requestBody: null,
      response: `{
  "success": true,
  "trending": [
    {
      "name": "vercel/next.js",
      "stars": 115000,
      "language": "TypeScript",
      "description": "The React Framework",
      "today_stars": 245
    }
  ]
}`
    },
    {
      id: 'stats',
      method: 'GET',
      path: '/api/stats',
      description: 'Get overall scanner statistics and metrics',
      parameters: [],
      requestBody: null,
      response: `{
  "success": true,
  "stats": {
    "total_repositories": 156,
    "total_scans": 1248,
    "average_quality_score": 76.5,
    "tier_distribution": {
      "A": 24,
      "B": 58,
      "C": 42,
      "D": 20,
      "F": 12
    },
    "top_languages": [
      { "language": "JavaScript", "count": 45 },
      { "language": "Python", "count": 38 },
      { "language": "TypeScript", "count": 28 }
    ]
  }
}`
    }
  ]

  const handleTestEndpoint = async (endpoint) => {
    setLoading(true)
    setResponse(null)

    try {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000))

      setResponse({
        success: true,
        status: 200,
        data: JSON.parse(endpoint.response),
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      setResponse({
        success: false,
        error: 'Failed to execute request',
        details: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">API Documentation</h1>
        <p className="text-gray-400">
          Interactive API documentation with live testing capabilities
        </p>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => {
                setActiveEndpoint(activeEndpoint === endpoint.id ? null : endpoint.id)
                setRequestBody(endpoint.requestBody || '')
                setResponse(null)
              }}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  endpoint.method === 'POST' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {endpoint.method}
                </span>
                <code className="text-gray-300 font-medium">{endpoint.path}</code>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">{endpoint.description}</span>
                <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${
                  activeEndpoint === endpoint.id ? 'rotate-180' : ''
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {activeEndpoint === endpoint.id && (
              <div className="px-6 py-4 border-t border-gray-700 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
                  <p className="text-gray-400">{endpoint.description}</p>
                </div>

                {/* Parameters */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Parameters</h3>
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Required</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {endpoint.parameters.map((param, idx) => (
                          <tr key={idx} className="text-sm">
                            <td className="px-4 py-2 text-white font-medium">{param.name}</td>
                            <td className="px-4 py-2 text-gray-400">{param.type}</td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                param.required ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300'
                              }`}>
                                {param.required ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-400">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Request Body (if applicable) */}
                {endpoint.requestBody && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Request Body Example</h3>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify(JSON.parse(endpoint.requestBody), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Test Button */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleTestEndpoint(endpoint)}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    {loading ? 'Testing...' : 'Test Endpoint'}
                  </button>
                  <span className="text-gray-400 text-sm">
                    Live testing with simulated response
                  </span>
                </div>

                {/* Response */}
                {response && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Response</h3>
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          response.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {response.status || 'Error'}
                        </span>
                        <span className="text-gray-500 text-xs">{response.timestamp}</span>
                      </div>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {JSON.stringify(response.data || response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Response Schema */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Response Schema</h3>
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(JSON.parse(endpoint.response), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Authentication Info */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Authentication</h2>
        <p className="text-gray-400 mb-4">
          Some endpoints may require authentication. Include your API token in the request header:
        </p>
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <pre className="text-sm text-gray-300">
Authorization: Bearer YOUR_API_TOKEN
          </pre>
        </div>
      </div>

      {/* Rate Limits */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Rate Limits</h2>
        <ul className="space-y-2 text-gray-400">
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong className="text-white">Unauthenticated:</strong> 60 requests/hour</span>
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span><strong className="text-white">Authenticated:</strong> 5,000 requests/hour</span>
          </li>
          <li className="flex items-center">
            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Rate limit headers included in all responses</span>
          </li>
        </ul>
      </div>

      {/* Error Codes */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Error Codes</h2>
        <div className="space-y-3">
          {[
            { code: '400', message: 'Bad Request - Invalid parameters or request body' },
            { code: '401', message: 'Unauthorized - Missing or invalid authentication' },
            { code: '404', message: 'Not Found - Resource does not exist' },
            { code: '429', message: 'Too Many Requests - Rate limit exceeded' },
            { code: '500', message: 'Internal Server Error - Server-side error occurred' }
          ].map((error, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded text-xs font-bold ${
                error.code.startsWith('4') ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {error.code}
              </span>
              <span className="text-gray-400">{error.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}