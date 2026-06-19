import { useState, useEffect } from 'react'
import apiService from '../services/api'
import { mockReports, filterReports, simulateApiCall } from '../services/mockData'
import ReportDetailModal from '../components/ReportDetailModal'

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: '',
    tier: '',
    language: '',
    minScore: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    total: 0
  })

  useEffect(() => {
    fetchReports()
  }, [filters])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getReports(filters)

      if (response.success) {
        setReports(response.data.reports || [])
        setPagination({
          page: response.data.page || 1,
          perPage: response.data.perPage || 20,
          total: response.data.total || 0
        })
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      console.log('Using mock data:', err.message)
      // Fallback to mock data
      const filteredReports = filterReports(mockReports, filters)
      await simulateApiCall(filteredReports)
      setReports(filteredReports)
      setPagination({
        page: 1,
        perPage: 20,
        total: filteredReports.length
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      tier: '',
      language: '',
      minScore: '',
      search: ''
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Browse Reports</h1>
        <p className="text-gray-400">
          Explore comprehensive security and quality analysis reports from our database
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Filter Reports</h2>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Clear Filters
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search repositories..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All Categories</option>
              <option value="web-framework">Web Frameworks</option>
              <option value="cli-tool">CLI Tools</option>
              <option value="ml-ai">ML/AI</option>
              <option value="database">Databases</option>
              <option value="testing">Testing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quality Tier
            </label>
            <select
              value={filters.tier}
              onChange={(e) => handleFilterChange('tier', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All Tiers</option>
              <option value="A">Tier A (90-100)</option>
              <option value="B">Tier B (75-89)</option>
              <option value="C">Tier C (60-74)</option>
              <option value="D">Tier D (40-59)</option>
              <option value="F">Tier F (0-39)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Score
            </label>
            <input
              type="number"
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', e.target.value)}
              placeholder="0"
              min="0"
              max="100"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-400">
          Showing {reports.length} of {pagination.total} reports
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stars
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Quality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Findings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{report.repo_name}</div>
                      <div className="text-sm text-gray-400">{report.language}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {report.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {report.stars?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${getScoreColor(report.quality_score)}`}>
                        {report.quality_score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(report.tier)}`}>
                        {report.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {report.total_findings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedReport(report)
                          setShowModal(true)
                        }}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        View
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => {
            setShowModal(false)
            setSelectedReport(null)
          }}
        />
      )}
    </div>
  )
}

function getScoreColor(score) {
  if (score >= 90) return 'text-green-500'
  if (score >= 75) return 'text-blue-500'
  if (score >= 60) return 'text-yellow-500'
  return 'text-red-500'
}

function getTierColor(tier) {
  switch (tier) {
    case 'A': return 'bg-green-500 text-white'
    case 'B': return 'bg-blue-500 text-white'
    case 'C': return 'bg-yellow-500 text-white'
    case 'D': return 'bg-orange-500 text-white'
    default: return 'bg-red-500 text-white'
  }
}
