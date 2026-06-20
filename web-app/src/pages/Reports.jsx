import { useState, useEffect } from 'react'
import apiService from '../services/api'
import { getAllRepositories, getPatternData } from '../services/realScannerData'
import ReportDetailModal from '../components/ReportDetailModal'
import SpiderChart from '../components/Charts'
import { BarChart, DonutChart } from '../components/Charts'
import FilterableTable from '../components/FilterableTable'

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('unknown')
  const [filters, setFilters] = useState({
    language: '',
    tier: '',
    minScore: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 50,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchReports()
  }, [filters, pagination.page])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Loading repositories from real API...')

      // Use real API to get repositories
      const response = await getAllRepositories(
        pagination.page,
        pagination.perPage,
        filters.language,
        filters.tier
      )

      console.log('📊 Repositories response:', response)

      if (response && response.repositories) {
        setReports(response.repositories)
        setPagination({
          page: response.page || pagination.page,
          perPage: response.limit || pagination.perPage,
          total: response.total || 0,
          pages: response.pages || 0
        })
        setDataSource('real_api')
        console.log(`✅ Loaded ${response.repositories.length} repositories (page ${pagination.page})`)
      } else {
        throw new Error('Invalid response format')
      }

    } catch (err) {
      console.error('❌ Error loading repositories:', err)
      setError(err.message)
      setDataSource('error')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value })
    setPagination({ ...pagination, page: 1 }) // Reset to first page
  }

  const clearFilters = () => {
    setFilters({
      language: '',
      tier: '',
      minScore: '',
      search: ''
    })
    setPagination({ ...pagination, page: 1 })
  }

  const handleReportClick = (report) => {
    setSelectedReport(report)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  // Calculate chart data from reports
  const tierDistribution = reports.reduce((acc, report) => {
    const tier = report.tier || 'A'
    acc[tier] = (acc[tier] || 0) + 1
    return acc
  }, {})

  const languageDistribution = reports.reduce((acc, report) => {
    const lang = report.language || 'Unknown'
    acc[lang] = (acc[lang] || 0) + 1
    return acc
  }, {})

  const qualityScores = reports.map(r => r.quality_score || 0).filter(score => score > 0)
  const avgQuality = qualityScores.length > 0
    ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
    : 0

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 75) return 'text-blue-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'A': return 'bg-green-500 text-white'
      case 'B': return 'bg-blue-500 text-white'
      case 'C': return 'bg-yellow-500 text-white'
      case 'D': return 'bg-orange-500 text-white'
      default: return 'bg-red-500 text-white'
    }
  }

  const getScanMethodBadge = (method) => {
    const badges = {
      'github_api': 'GitHub API',
      'npm_install': 'npm Install',
      'local_node_modules': 'Local Scan',
      'pip_install': 'pip Install',
      'unknown': 'Unknown'
    }
    return badges[method] || method
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Repository Reports</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            {dataSource === 'real_api' ? `Real data from ${pagination.total.toLocaleString()} analyzed packages` : 'Loading repository data...'}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Packages</p>
          <p className="text-2xl font-bold text-white">{pagination.total.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Showing</p>
          <p className="text-2xl font-bold text-white">{reports.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Avg Quality</p>
          <p className="text-2xl font-bold text-white">{avgQuality.toFixed(1)}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Languages</p>
          <p className="text-2xl font-bold text-white">{Object.keys(languageDistribution).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Language</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Languages</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Java">Java</option>
              <option value="Go">Go</option>
              <option value="Ruby">Ruby</option>
              <option value="Rust">Rust</option>
              <option value="C++">C++</option>
              <option value="PHP">PHP</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Quality Tier</label>
            <select
              value={filters.tier}
              onChange={(e) => handleFilterChange('tier', e.target.value)}
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Tiers</option>
              <option value="A">Tier A</option>
              <option value="B">Tier B</option>
              <option value="C">Tier C</option>
              <option value="D">Tier D</option>
              <option value="F">Tier F</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Min Score</label>
            <input
              type="number"
              value={filters.minScore}
              onChange={(e) => handleFilterChange('minScore', e.target.value)}
              placeholder="0-100"
              min="0"
              max="100"
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search packages..."
              className="w-full bg-gray-700 text-white rounded px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading repository reports...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-white font-semibold">Error Loading Data</h3>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Repository List */}
      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Package</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Language</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Score</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Tier</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Scan Method</th>
                  <th className="px-4 py-3 text-left text-gray-400 text-sm font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400">
                      No repositories found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => handleReportClick(report)}
                      className="border-t border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">{report.name}</div>
                          {report.description && (
                            <div className="text-gray-400 text-sm truncate max-w-xs">{report.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-300">{report.language}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${getScoreColor(report.quality_score)}`}>
                          {report.quality_score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTierColor(report.tier)}`}>
                          {report.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-400 text-sm">
                          {getScanMethodBadge(report.scan_method)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          {report.stars > 0 && (
                            <span>⭐ {report.stars >= 1000 ? `${(report.stars / 1000).toFixed(1)}k` : report.stars}</span>
                          )}
                          {report.total_dependencies > 0 && (
                            <span>{report.total_dependencies} deps</span>
                          )}
                          {report.total_files > 0 && (
                            <span>{report.total_files} files</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {((pagination.page - 1) * pagination.perPage) + 1} to {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total} packages
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
