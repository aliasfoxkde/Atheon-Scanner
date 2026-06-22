import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { Skeleton } from '../components/Skeleton'
import { BarChart, DonutChart } from '../components/Charts'
import { getScoreColor, getTierColor } from '../utils/colors'
import { formatDate } from '../utils/date'
import { loadRealScannerData } from '../services/realScannerData'

const SEV_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e', info: '#3b82f6' }
const SEV_BG = { critical: 'bg-red-500/10', high: 'bg-orange-500/10', medium: 'bg-yellow-500/10', low: 'bg-blue-500/10', info: 'bg-gray-500/10' }

async function fetchNpmDeps(packageName) {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}/latest`)
    if (!res.ok) return null
    const data = await res.json()
    return {
      version: data.version,
      dependencies: data.dependencies || {},
      devDependencies: data.devDependencies || {},
    }
  } catch { return null }
}

async function fetchPypiDeps(packageName) {
  try {
    const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(packageName)}/json`)
    if (!res.ok) return null
    const data = await res.json()
    const requires = data.info?.requires_dist || []
    return {
      version: data.info?.version,
      dependencies: requires.reduce((acc, r) => {
        const m = r.match(/^([a-zA-Z0-9._-]+)/)
        if (m) acc[m[1]] = r
        return acc
      }, {}),
      devDependencies: {},
    }
  } catch { return null }
}

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [findingsFilter, setFindingsFilter] = useState('all')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeTab])

  const load = async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const data = await loadRealScannerData()
      const found = data.recent_scans?.find(r => r.id === id || r.name === id)
      if (found) {
        setReport(found)
      } else {
        const decoded = decodeURIComponent(id || '')
        const found2 = data.recent_scans?.find(r => r.id === decoded || r.name === decoded)
        setReport(found2 || null)
      }
    } catch { setLoadError(true) }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    } catch { toast.error('Copy failed') }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(report?.name || 'report').replace(/[^A-Za-z0-9._-]/g, '_')}-report.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Report downloaded')
    } catch { toast.error('Download failed') }
  }

  if (loading) return <ReportDetailSkeleton />
  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-64 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-white mb-2">{loadError ? 'Failed to load report' : 'Report not found'}</h2>
      <p className="text-gray-400 mb-4">{loadError ? 'Something went wrong while fetching the report data.' : `No report matches "${id}"`}</p>
      <div className="flex gap-3">
        {loadError && <button onClick={load} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">Retry</button>}
        <Link to="/reports" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Back to Reports</Link>
      </div>
    </div>
  )

  const name = report.name || report.repo_name || 'Unknown'
  const lang = report.language || 'Unknown'
  const score = typeof report.quality_score === 'number' ? report.quality_score : 0
  const tier = report.tier || 'A'
  const stars = report.stars || 0
  const deps = report.total_dependencies || 0
  const files = report.total_files || 0
  const findings = report.findings || report.security_issues || []
  const metrics = report.metrics || report.quality_metrics || null
  const secCounts = report.security_counts || {
    critical: report.critical_findings || 0,
    high: report.high_findings || 0,
    medium: report.medium_findings || 0,
    low: report.low_findings || 0,
  }
  const totalFindings = report.total_findings || findings.length ||
    (secCounts.critical + secCounts.high + secCounts.medium + secCounts.low)
  const scanDate = report.scan_date
  const scanMethod = report.scan_method || 'unknown'

  const githubUrl = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(name)
    ? `https://github.com/${name}` : null
  const npmUrl = report.package_name
    ? `https://www.npmjs.com/package/${report.package_name}` : null

  const filteredFindings = findingsFilter === 'all' ? findings
    : findings.filter(f => (f.severity || 'info').toLowerCase() === findingsFilter)

  const TABS = [
    { id: 'summary', label: 'Summary' },
    { id: 'findings', label: `Findings${totalFindings > 0 ? ` (${totalFindings})` : ''}` },
    { id: 'deps', label: `Dependencies${deps > 0 ? ` (${deps})` : ''}` },
    { id: 'metrics', label: 'Metrics' },
    { id: 'details', label: 'Details' },
  ]

  return (
    <div className="space-y-4">
      {/* Back nav */}
      <div className="flex items-center gap-2 text-sm">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <span className="text-gray-600">/</span>
        <Link to="/reports" className="text-gray-400 hover:text-white">Reports</Link>
        <span className="text-gray-600">/</span>
        <span className="text-white truncate max-w-xs">{name}</span>
      </div>

      {/* Header card */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{name}</h1>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${getTierColor(tier)}`}>Tier {tier}</span>
              <span className="px-2.5 py-1 rounded text-xs bg-blue-500/10 text-blue-400 font-medium">{lang}</span>
            </div>
            <p className="text-sm text-gray-400 mt-2 max-w-2xl">
              {report.description || `${lang} package · quality analysis via Atheon Enhanced`}
            </p>
            {/* Links */}
            <div className="flex flex-wrap gap-3 mt-3">
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0012 0z" /></svg>
                  GitHub
                </a>
              )}
              {npmUrl && (
                <a href={npmUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M0 7.334v8h6.666v1.332H24V7.334H0zm6.666 6.664H5.334v-4H3.999v4H0v-4c0-1.198 1.065-2.665 2.665-2.665h1.334V4c0-1.198 1.065-2.666 2.667-2.666h2.666c1.6 0 2.665 1.468 2.665 2.666v1.332h1.336C17.935 6.332 19 7.8 19 8.998v4h-2.668v-1.334H19v1.334h-5.334V8.998c0-1.2.535-1.997 1.6-1.997h1.336v3.997H5.334V6.999h1.332c1.067 0 1.6.8 1.6 1.999v4H6.666zm10.668-4c0-1.2.535-1.997 1.6-1.997h1.334V4c0-1.2.535-1.998 1.6-1.998h2.666c1.067 0 1.6.8 1.6 1.999v4h-1.334v-1.334h1.334c1.067 0 1.6.8 1.6 1.999v4c0 1.198-1.065 2.665-2.665 2.665h-2.666C19.535 18.665 18.47 17.198 18.47 16v-1.336h-1.334V16H14.47v-1.336h-1.334V16h-2.668v-1.334H8.134V16H6.8v-1.334H5.466V16H3.999v-4c0-1.2.535-1.997 1.6-1.997h1.336v3.997h1.334V7c0-1.2.535-1.997 1.6-1.997h2.666c1.067 0 1.6.8 1.6 1.999v4h-1.334v-1.334h1.334V11.67H8.134V10.336h1.334v1.334h1.332V10.336H14.47v1.334h1.332V10.336H17.334V8.002h-1.334V6.668h1.334V5.334H19v1.334h-1.334V8h2.668v-.666h1.334V8H24v6.666h-5.334v1.332H19V14h-5.334v-1.334H14.47V14H8.134v-1.334H6.8V14H5.466v-1.334H3.999V14H0v-6.668h6.666v-.666H6.8V5.334H8.134V6.67H9.466V5.334h5.334v1.336H14.47V5.334h1.332v1.336H17.334V5.334h1.334v1.336H19V5.334h1.334v1.336H19V8h2.666v-.666H24V7.334H17.334z" /></svg>
                  npm
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownload} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium">
              Download JSON
            </button>
            <button onClick={handleShare} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium">
              Share
            </button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          {[
            { label: 'Quality Score', value: score, suffix: '/100', color: getScoreColor(score) },
            { label: 'Stars', value: stars > 0 ? stars.toLocaleString() : '—', color: 'text-white' },
            { label: 'Dependencies', value: deps > 0 ? deps.toLocaleString() : '—', color: 'text-white' },
            { label: 'Files', value: files > 0 ? files.toLocaleString() : '—', color: 'text-white' },
            { label: 'Findings', value: totalFindings > 0 ? totalFindings.toLocaleString() : '—', color: totalFindings > 0 ? 'text-red-400' : 'text-white' },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 rounded-lg p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}<span className="text-xs text-gray-500">{s.suffix || ''}</span></div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Severity banner */}
      {totalFindings > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">Security Findings Breakdown</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(secCounts).filter(([,v]) => v > 0).map(([sev, count]) => (
              <div key={sev} className="flex items-center gap-2.5 bg-gray-900 rounded-lg p-3">
                <div className="w-3 h-3 rounded-full" style={{ background: SEV_COLORS[sev] || '#888' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 capitalize">{sev}</div>
                  <div className="text-base font-bold text-white">{count.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700 overflow-x-auto">
          <nav className="flex">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
                  activeTab === tab.id ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Repo info */}
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Repository Overview
                  </h3>
                  <dl className="space-y-3 text-sm">
                    {[
                      ['Language', lang],
                      ['Quality Tier', `Tier ${tier} (${score}/100)`],
                      ['Stars', stars > 0 ? stars.toLocaleString() : '—'],
                      ['Forks', report.forks > 0 ? report.forks.toLocaleString() : '—'],
                      ['Open Issues', report.open_issues > 0 ? report.open_issues.toLocaleString() : '—'],
                      ['Dependencies', deps > 0 ? deps.toLocaleString() : '—'],
                      ['Files Analyzed', files > 0 ? files.toLocaleString() : '—'],
                      ['License', report.license || '—'],
                      ['Default Branch', report.default_branch || 'main'],
                      ['Scan Method', scanMethod],
                      ['Scan Date', formatDate(scanDate)],
                    ].filter(([, v]) => v !== '—').map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <dt className="text-gray-400">{label}</dt>
                        <dd className="text-white text-right font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Tags / topics */}
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                    Topics & Tags
                  </h3>
                  {report.topics && report.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {report.topics.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No topics recorded</p>
                  )}
                  {report.tags && report.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {report.tags.map((t, i) => (
                        <span key={i} className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-lg text-xs">{t}</span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-white font-semibold mb-4 mt-6 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Quick Links
                  </h3>
                  <div className="space-y-2">
                    {githubUrl && (
                      <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0012 0z" /></svg>
                        {githubUrl.replace('https://', '')}
                      </a>
                    )}
                    {npmUrl && (
                      <a href={npmUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M0 7.334v8h6.666v1.332H24V7.334H0zm6.666 6.664H5.334v-4H3.999v4H0v-4c0-1.198 1.065-2.665 2.665-2.665h1.334V4c0-1.198 1.065-2.666 2.667-2.666h2.666c1.6 0 2.665 1.468 2.665 2.666v1.332h1.336C17.935 6.332 19 7.8 19 8.998v4h-2.668v-1.334H19v1.334h-5.334V8.998c0-1.2.535-1.997 1.6-1.997h1.336v3.997H5.334V6.999h1.332c1.067 0 1.6.8 1.6 1.999v4H6.666z" /></svg>
                        {npmUrl.replace('https://', '')}
                      </a>
                    )}
                    {report.clone_url && (
                      <div className="flex items-start gap-2 text-xs text-gray-400">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2M16 4h2a2 2 0 012 2v2m-4 4H8m8 0a2 2 0 01-2 2H8m0 0a2 2 0 01-2-2V8m4 4v8" /></svg>
                        <span className="font-mono break-all">{report.clone_url}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Severity chart */}
              {totalFindings > 0 && (
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-white font-semibold mb-4">Security Severity Distribution</h3>
                  <div className="max-w-xs mx-auto">
                    <DonutChart data={secCounts} size={200} />
                  </div>
                </div>
              )}

              {/* Scan metadata */}
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Scan Metadata
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {[
                    ['Report ID', report.id || id],
                    ['Package Name', report.package_name || '—'],
                    ['Scan Method', scanMethod],
                    ['Scan Date', formatDate(scanDate)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="text-white font-mono text-xs mt-0.5 break-all">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FINDINGS */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              {totalFindings > 0 ? (
                <>
                  {/* Severity filter */}
                  <div className="flex flex-wrap gap-2">
                    {['all', 'critical', 'high', 'medium', 'low', 'info'].map(sev => (
                      <button key={sev} onClick={() => setFindingsFilter(sev)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          findingsFilter === sev
                            ? sev === 'all' ? 'bg-blue-600 text-white border-blue-600'
                            : sev === 'critical' ? 'bg-red-900/50 text-red-400 border-red-500/30'
                            : sev === 'high' ? 'bg-orange-900/50 text-orange-400 border-orange-500/30'
                            : sev === 'medium' ? 'bg-yellow-900/50 text-yellow-400 border-yellow-500/30'
                            : sev === 'low' ? 'bg-blue-900/50 text-blue-400 border-blue-500/30'
                            : 'bg-gray-700 text-gray-400 border-gray-500/30'
                            : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                        }`}>
                        {sev.charAt(0).toUpperCase() + sev.slice(1)}{sev !== 'all' ? ` (${secCounts[sev] || 0})` : ''}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {filteredFindings.map((f, idx) => {
                      const sev = (f.severity || 'info').toLowerCase()
                      const label = f.pattern || f.description || f.message || 'Unknown finding'
                      return (
                        <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                  sev === 'critical' ? 'bg-red-900/60 text-red-300'
                                  : sev === 'high' ? 'bg-orange-900/60 text-orange-300'
                                  : sev === 'medium' ? 'bg-yellow-900/60 text-yellow-300'
                                  : sev === 'low' ? 'bg-blue-900/60 text-blue-300'
                                  : 'bg-gray-700 text-gray-300'
                                }`}>
                                  {sev}
                                </span>
                                {f.confidence != null && (
                                  <span className="text-xs text-gray-500">conf {Math.round(f.confidence * 100)}%</span>
                                )}
                                {f.type && <span className="text-xs text-gray-400 capitalize">/{f.type}</span>}
                                {f.category && <span className="text-xs text-gray-500">· {f.category}</span>}
                              </div>
                              <h4 className="text-white font-medium">{label}</h4>
                              {f.message && f.message !== label && (
                                <p className="text-xs text-gray-400 mt-1">{f.message}</p>
                              )}
                            </div>
                          </div>
                          {f.file && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              <span className="font-mono">{f.file}</span>
                              {f.line && <span className="text-gray-500">:{f.line}</span>}
                              {f.column && <span className="text-gray-500">:{f.column}</span>}
                            </div>
                          )}
                          {f.rule && <div className="text-xs font-mono text-gray-600 mt-1">Rule: {f.rule}</div>}
                        </div>
                      )
                    })}
                  </div>
                  {filteredFindings.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No {findingsFilter} findings</p>
                  )}
                </>
              ) : (
                <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400 border border-gray-700">
                  <div className="text-4xl mb-3">✅</div>
                  <p>No security findings were recorded for this scan.</p>
                  <p className="text-xs text-gray-500 mt-1">The quality score reflects overall code characteristics.</p>
                </div>
              )}
            </div>
          )}

          {/* DEPENDENCIES */}
          {activeTab === 'deps' && (
            <DependenciesPanel report={report} lang={lang} />
          )}

          {/* METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {metrics && Object.keys(metrics).length > 0 ? (
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-white font-semibold mb-4">Quality Score Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(metrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium text-white">{value}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(Math.max(value, 0), 100)}%`,
                              background: value >= 90 ? '#22c55e' : value >= 75 ? '#3b82f6' : value >= 60 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400 border border-gray-700">
                  <div className="text-4xl mb-3">📊</div>
                  <p>Sub-metric breakdown is not available for this scan.</p>
                  <p className="text-xs text-gray-500 mt-1">Only the overall quality score is recorded.</p>
                </div>
              )}

              {totalFindings > 0 && (
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-white font-semibold mb-4">Severity Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Critical', count: secCounts.critical, color: '#ef4444' },
                      { label: 'High', count: secCounts.high, color: '#f97316' },
                      { label: 'Medium', count: secCounts.medium, color: '#f59e0b' },
                      { label: 'Low', count: secCounts.low, color: '#22c55e' },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm text-gray-400">{item.label}</span>
                          <span className="text-sm font-medium text-white">{item.count.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${totalFindings ? Math.min((item.count / totalFindings) * 100, 100) : 0}%`, background: item.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Score gauge */}
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Overall Quality Score</h3>
                <div className="flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#374151" strokeWidth="12" />
                      <circle cx="50" cy="50" r="42" fill="none"
                        stroke={score >= 90 ? '#22c55e' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 264} 264`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
                      <span className="text-xs text-gray-400">/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> A: 90+</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> B: 75–89</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> C: 60–74</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> D/F: &lt;60</span>
                </div>
              </div>
            </div>
          )}

          {/* DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-4">Full Repository Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {[
                    ['Report ID', report.id || id],
                    ['Package Name', report.package_name || '—'],
                    ['Repository Name', name],
                    ['Language', lang],
                    ['License', report.license || '—'],
                    ['Default Branch', report.default_branch || 'main'],
                    ['Stars', stars > 0 ? stars.toLocaleString() : '—'],
                    ['Forks', report.forks > 0 ? report.forks.toLocaleString() : '—'],
                    ['Open Issues', report.open_issues > 0 ? report.open_issues.toLocaleString() : '—'],
                    ['Watchers', report.watchers > 0 ? report.watchers.toLocaleString() : '—'],
                    ['Total Dependencies', deps > 0 ? deps.toLocaleString() : '—'],
                    ['Total Files', files > 0 ? files.toLocaleString() : '—'],
                    ['Scan Method', scanMethod],
                    ['Scan Date', formatDate(scanDate)],
                    ['Quality Score', `${score}/100`],
                    ['Quality Tier', `Tier ${tier}`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-gray-400">{label}</dt>
                      <dd className="text-white text-right font-medium break-all">{value}</dd>
                    </div>
                  ))}
                  {report.clone_url && (
                    <div className="sm:col-span-2">
                      <dt className="text-gray-400 mb-1">Clone URL</dt>
                      <dd className="text-white text-xs font-mono break-all bg-gray-800 rounded p-2">{report.clone_url}</dd>
                    </div>
                  )}
                  {report.homepage && (
                    <div className="sm:col-span-2">
                      <dt className="text-gray-400 mb-1">Homepage</dt>
                      <dd className="text-white text-xs break-all bg-gray-800 rounded p-2">{report.homepage}</dd>
                    </div>
                  )}
                  {report.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-gray-400 mb-1">Description</dt>
                      <dd className="text-white text-xs bg-gray-800 rounded p-2">{report.description}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {report.topics && report.topics.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                  <h3 className="text-white font-semibold mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.topics.map((t, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DependenciesPanel({ report, lang }) {
  const [prodDeps, setProdDeps] = useState(null)
  const [devDeps, setDevDeps] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDev, setShowDev] = useState(false)
  const pkgName = report.package_name || (report.name && report.name.includes('/') ? null : report.name)

  useEffect(() => {
    if (!pkgName) {
      setError('No package name available for this repository.')
      setLoading(false)
      return
    }
    const isPy = lang === 'Python'
    const fetcher = isPy ? fetchPypiDeps : fetchNpmDeps
    fetcher(pkgName).then((data) => {
      if (data) {
        setProdDeps(data.dependencies || {})
        setDevDeps(data.devDependencies || {})
      } else {
        setError(`Could not fetch dependencies for "${pkgName}" from ${isPy ? 'PyPI' : 'npm registry'}.`)
      }
      setLoading(false)
    })
  }, [pkgName, lang])

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-700 rounded animate-pulse" />)}
    </div>
  )

  if (error) return (
    <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400 border border-gray-700">
      <div className="text-4xl mb-3">📦</div>
      <p className="text-sm">{error}</p>
      {pkgName && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <a href={`https://www.npmjs.com/package/${pkgName}`} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">
            View on npm
          </a>
          <a href={`https://pypi.org/project/${pkgName}/`} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs">
            View on PyPI
          </a>
        </div>
      )}
    </div>
  )

  const prodEntries = Object.entries(prodDeps || {})
  const devEntries = Object.entries(devDeps || {})
  const totalEntries = prodEntries.length + devEntries.length

  if (totalEntries === 0) return (
    <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400 border border-gray-700">
      <div className="text-4xl mb-3">📦</div>
      <p>No dependencies recorded for "{pkgName}"</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-4 py-2 border border-gray-700">
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          <span className="text-gray-300">Production:</span>
          <span className="text-white font-bold">{prodEntries.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-4 py-2 border border-gray-700">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          <span className="text-gray-300">Dev:</span>
          <span className="text-white font-bold">{devEntries.length}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-4 py-2 border border-gray-700">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <span className="text-gray-300">Total:</span>
          <span className="text-white font-bold">{totalEntries}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 rounded-lg px-4 py-2 border border-gray-700">
          <span className="text-xs text-gray-400">via</span>
          <span className="text-white text-xs font-mono">{pkgName}</span>
        </div>
      </div>

      {/* Production deps */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <h3 className="text-white font-semibold text-sm">Production Dependencies</h3>
            <span className="text-xs text-gray-500">({prodEntries.length})</span>
          </div>
          <a href={`https://www.npmjs.com/package/${pkgName}?active-tab=dependencies`} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View on npm
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
        <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto">
          {prodEntries.map(([name, version]) => (
            <DepsRow key={name} name={name} version={version} type="prod" />
          ))}
        </div>
      </div>

      {/* Dev deps toggle */}
      {devEntries.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
          <button onClick={() => setShowDev(!showDev)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              <h3 className="text-white font-semibold text-sm">Dev Dependencies</h3>
              <span className="text-xs text-gray-500">({devEntries.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{showDev ? 'click to hide' : 'click to expand'}</span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDev ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>
          {showDev && (
            <div className="divide-y divide-gray-800 max-h-80 overflow-y-auto">
              {devEntries.map(([name, version]) => (
                <DepsRow key={name} name={name} version={version} type="dev" />
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Dependency data sourced live from {lang === 'Python' ? 'PyPI' : 'npm registry'}.
        Exact versions reflect what was published at scan time and may differ from your local install.
      </p>
    </div>
  )
}

function DepsRow({ name, version, type }) {
  const isSemVer = version && /^[~^]?[\d.x]/.test(String(version))
  const npmUrl = `https://www.npmjs.com/package/${name}`
  const pyUrl = `https://pypi.org/project/${name}/`

  return (
    <div className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${type === 'dev' ? 'bg-purple-400' : 'bg-blue-400'}`} />
        <span className="text-white text-sm font-mono truncate">{name}</span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {version && (
          <span className="text-gray-400 text-xs font-mono">{version}</span>
        )}
        <a href={npmUrl} target="_blank" rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-400 transition-colors"
          title={`View ${name} on npm`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M0 7.334v8h6.666v1.332H24V7.334H0zm6.666 6.664H5.334v-4H3.999v4H0v-4c0-1.198 1.065-2.665 2.665-2.665h1.334V4c0-1.198 1.065-2.666 2.667-2.666h2.666c1.6 0 2.665 1.468 2.665 2.666v1.332h1.336C17.935 6.332 19 7.8 19 8.998v4h-2.668v-1.334H19v1.334h-5.334V8.998c0-1.2.535-1.997 1.6-1.997h1.336v3.997H5.334V6.999h1.332c1.067 0 1.6.8 1.6 1.999v4H6.666z" /></svg>
        </a>
      </div>
    </div>
  )
}

function ReportDetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><div className="w-16 h-4 bg-gray-700 rounded animate-pulse" /><div className="w-8 h-4 bg-gray-700 rounded animate-pulse" /></div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
        <div className="flex gap-4 mb-4"><div className="w-48 h-8 bg-gray-700 rounded animate-pulse" /><div className="w-16 h-6 bg-gray-700 rounded animate-pulse" /></div>
        <div className="grid grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-700 rounded animate-pulse" />)}
        </div>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="grid grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => <div key={i} className="h-48 bg-gray-700 rounded animate-pulse" />)}
        </div>
      </div>
    </div>
  )
}
