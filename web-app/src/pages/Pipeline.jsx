import { useState } from 'react'
import { loadRealScannerData } from '../services/realScannerData'
import { Skeleton, SkeletonDonut } from '../components/Skeleton'
import { DonutChart } from '../components/Charts'

const ATHEON_VERSION = 'dev'
const SCAN_CATEGORIES = [
  {
    name: 'secrets',
    label: 'Secrets Detection',
    icon: '🔐',
    color: '#ef4444',
    patterns: [
      { name: 'aws-access-key', desc: 'AWS access key ID and secret', severity: 'critical' },
      { name: 'github-pat', desc: 'GitHub Personal Access Token', severity: 'critical' },
      { name: 'circleci-token', desc: 'CircleCI API token', severity: 'high' },
      { name: 'slack-bot-token', desc: 'Slack bot/API token', severity: 'high' },
      { name: 'stripe-secret-key', desc: 'Stripe API secret key', severity: 'critical' },
      { name: 'npm-auth-token', desc: 'npm registry authentication token', severity: 'high' },
      { name: 'docker-hub-token', desc: 'Docker Hub access token', severity: 'high' },
      { name: 'gcp-api-key', desc: 'Google Cloud API key', severity: 'high' },
      { name: 'openai-api-key', desc: 'OpenAI API key', severity: 'critical' },
      { name: 'azure-client-secret', desc: 'Azure client secret', severity: 'critical' },
      { name: 'kubernetes-service-account-token', desc: 'K8s service account token', severity: 'high' },
      { name: 'gitlab-ci-token', desc: 'GitLab CI token', severity: 'high' },
      { name: 'jenkins-crumb', desc: 'Jenkins CSRF crumb token', severity: 'high' },
      { name: 'postgres-connection-string', desc: 'PostgreSQL connection string with credentials', severity: 'critical' },
      { name: 'mysql-connection-string', desc: 'MySQL connection string with credentials', severity: 'critical' },
      { name: 'redis-connection-string', desc: 'Redis connection string with credentials', severity: 'critical' },
      { name: 'mongodb-connection-string', desc: 'MongoDB connection string with credentials', severity: 'critical' },
      { name: 'sqlserver-connection-string', desc: 'SQL Server connection string', severity: 'critical' },
      { name: 'oracle-connection-string', desc: 'Oracle DB connection string', severity: 'critical' },
      { name: 'azure-storage-account-key', desc: 'Azure storage account key', severity: 'high' },
      { name: 'gcp-service-account-key', desc: 'GCP service account JSON key', severity: 'critical' },
      { name: 'gcp-oauth-client-id', desc: 'GCP OAuth client ID', severity: 'medium' },
      { name: 'gcp-service-account-email', desc: 'GCP service account email', severity: 'medium' },
      { name: 'azure-devops-token', desc: 'Azure DevOps PAT', severity: 'critical' },
      { name: 'azure-managed-identity-token', desc: 'Azure managed identity token', severity: 'high' },
      { name: 'pypi-upload-token', desc: 'PyPI upload token', severity: 'critical' },
      { name: 'twilio-account-sid', desc: 'Twilio account SID + auth token', severity: 'high' },
    ],
  },
  {
    name: 'code-quality',
    label: 'Code Quality',
    icon: '📋',
    color: '#3b82f6',
    patterns: [
      { name: 'console-log', desc: 'Console.log statement left in code', severity: 'low' },
      { name: 'debug-statement', desc: 'Debugger breakpoint or statement', severity: 'low' },
      { name: 'todo-comment', desc: 'TODO/FIXME comment indicating incomplete work', severity: 'low' },
      { name: 'fixme-comment', desc: 'FIXME comment needing attention', severity: 'low' },
      { name: 'placeholder-code', desc: 'Placeholder/temporary code stub', severity: 'low' },
      { name: 'dummy-function', desc: 'Dummy/incomplete function implementation', severity: 'low' },
      { name: 'unreachable-code', desc: 'Dead code after return/throw/break', severity: 'medium' },
      { name: 'empty-catch-block', desc: 'Empty catch block silently swallowing errors', severity: 'medium' },
      { name: 'deprecated-function', desc: 'Usage of deprecated function or API', severity: 'medium' },
      { name: 'hardcoded-url', desc: 'Hardcoded URL instead of configuration', severity: 'low' },
      { name: 'temporary-code', desc: 'Temporary/hack code that should be removed', severity: 'medium' },
      { name: 'todo-stub', desc: 'Incomplete stub function not yet implemented', severity: 'low' },
    ],
  },
  {
    name: 'healthcare',
    label: 'Healthcare / PHI',
    icon: '🏥',
    color: '#22c55e',
    patterns: [
      { name: 'patient-id', desc: 'Patient identifier (PID/MRN)', severity: 'critical' },
      { name: 'medical-record-number', desc: 'Medical record number (MRN)', severity: 'critical' },
      { name: 'clinical-trial-id', desc: 'Clinical trial identifier', severity: 'high' },
      { name: 'prescription-number', desc: 'Prescription/Rx number', severity: 'high' },
      { name: 'medical-license-number', desc: 'Medical license number', severity: 'high' },
      { name: 'insurance-number', desc: 'Insurance/policy number', severity: 'high' },
      { name: 'healthcare-code', desc: 'Healthcare procedure/diagnosis code (ICD, CPT)', severity: 'medium' },
    ],
  },
  {
    name: 'finance',
    label: 'Financial Data',
    icon: '💳',
    color: '#f59e0b',
    patterns: [
      { name: 'aba-routing-number', desc: 'ABA routing transit number (US bank)', severity: 'high' },
      { name: 'iban', desc: 'International Bank Account Number', severity: 'high' },
      { name: 'swift-bic', desc: 'SWIFT/BIC code for international transfers', severity: 'medium' },
    ],
  },
  {
    name: 'pii',
    label: 'PII / Personal Data',
    icon: '👤',
    color: '#8b5cf6',
    patterns: [
      { name: 'social-security-number', desc: 'US Social Security Number (SSN)', severity: 'critical' },
      { name: 'phone-number', desc: 'Phone number (personal)', severity: 'medium' },
    ],
  },
]

const BENCHMARKS = [
  { pkg: 'lodash', lang: 'JavaScript', files: 4, deps: 0, findings: 617, score: 74, tier: 'C', method: 'atheon_enhanced_real_scan', critical: 1, high: 1, medium: 1, low: 0 },
  { pkg: 'axios', lang: 'JavaScript', files: 85, deps: 4, findings: 4625, score: 74, tier: 'C', method: 'atheon_enhanced_real_scan', critical: 1, high: 1, medium: 1, low: 0 },
  { pkg: 'express', lang: 'JavaScript', files: 7, deps: 28, findings: 840, score: 82, tier: 'B', method: 'atheon_enhanced_real_scan', critical: 1, high: 1, medium: 1, low: 0 },
  { pkg: 'vue', lang: 'JavaScript', files: 23, deps: 5, findings: 69, score: 89, tier: 'B', method: 'github_api', critical: 0, high: 1, medium: 2, low: 0 },
]

const SEV_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#22c55e' }

export default function Pipeline() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [selectedCat, setSelectedCat] = useState(null)
  const [scanStats, setScanStats] = useState(null)

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await loadRealScannerData()
      setScanStats(data)
    } catch { /* ignore */ }
    setLoading(false)
  }

  const totalPatterns = SCAN_CATEGORIES.reduce((s, c) => s + c.patterns.length, 0)
  const sevData = scanStats?.security_stats || { critical: 0, high: 0, medium: 0, low: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Scanner Methodology</h1>
          <p className="text-gray-400 text-sm mt-1">
            Atheon Enhanced · v{ATHEON_VERSION} · {totalPatterns} patterns across {SCAN_CATEGORIES.length} categories
          </p>
        </div>
        <button onClick={loadStats} disabled={loading}
          className="self-start sm:self-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium">
          {loading ? 'Loading…' : 'Load live stats'}
        </button>
      </div>

      {/* Version + build info banner */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        {[
          { label: 'Scanner', value: 'Atheon Enhanced' },
          { label: 'Version', value: ATHEON_VERSION },
          { label: 'Categories', value: SCAN_CATEGORIES.length },
          { label: 'Patterns', value: `${totalPatterns} active` },
        ].map(item => (
          <div key={item.label}>
            <div className="text-xs text-gray-400">{item.label}</div>
            <div className="text-white font-medium mt-0.5">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      {scanStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Packages', value: scanStats.total_repositories?.toLocaleString() || '—', color: 'text-white' },
            { label: 'Avg Quality', value: scanStats.average_quality_score?.toFixed(1) || '—', color: 'text-blue-400' },
            { label: 'Real Scans', value: scanStats.total_scans?.toLocaleString() || '—', color: 'text-purple-400' },
            { label: 'Languages', value: Object.keys(scanStats.language_distribution || {}).length, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700 overflow-x-auto">
          <nav className="flex">
            {['overview', 'patterns', 'benchmarks', 'how-it-works'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 ${
                  activeTab === tab ? 'text-blue-400 border-blue-400' : 'text-gray-400 border-transparent hover:text-white'
                }`}>
                {tab.replace(/-/g, ' ')}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-semibold text-white mb-3">Pattern Categories</h3>
                  <div className="space-y-2">
                    {SCAN_CATEGORIES.map(cat => (
                      <button key={cat.name} onClick={() => { setSelectedCat(cat.name); setActiveTab('patterns') }}
                        className="w-full flex items-center justify-between p-3 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-white text-sm font-medium">{cat.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">{cat.patterns.length} patterns</span>
                          <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white mb-3">Live Security Findings</h3>
                  {scanStats ? (
                    <div className="space-y-3">
                      <DonutChart data={sevData} title="Security Severity Distribution" size={180} />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(sevData).filter(([,v]) => v > 0).map(([sev, count]) => (
                          <div key={sev} className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: SEV_COLORS[sev] || '#888' }} />
                            <span className="text-xs text-gray-300 capitalize flex-1">{sev}</span>
                            <span className="text-sm font-bold text-white">{count.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="flex flex-col items-center gap-3">
                      <SkeletonDonut size={180} />
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {['critical','high','medium','low'].map(s => (
                          <div key={s} className="flex items-center gap-2 bg-gray-900 rounded-lg p-3">
                            <div className={`${s === 'critical' ? 'bg-red-500' : s === 'high' ? 'bg-orange-500' : s === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'} w-2.5 h-2.5 rounded-full animate-pulse`} />
                            <span className="text-xs text-gray-300 capitalize flex-1">{s}</span>
                            <div className="h-4 w-8 bg-gray-700 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-gray-300 text-sm border border-gray-700 rounded-lg">
                      Click "Load live stats" to see real findings
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PATTERNS */}
          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedCat(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    !selectedCat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                  }`}>
                  All ({totalPatterns})
                </button>
                {SCAN_CATEGORIES.map(cat => (
                  <button key={cat.name} onClick={() => setSelectedCat(cat.name)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedCat === cat.name ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                    }`}>
                    {cat.icon} {cat.label} ({cat.patterns.length})
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {(selectedCat ? SCAN_CATEGORIES.filter(c => c.name === selectedCat) : SCAN_CATEGORIES).map(cat => (
                  <div key={cat.name}>
                    <div className="flex items-center gap-2 py-2">
                      <span className="text-lg">{cat.icon}</span>
                      <h3 className="text-white font-semibold">{cat.label}</h3>
                      <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.patterns.map(p => (
                        <div key={p.name} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: SEV_COLORS[p.severity] }} />
                          <div className="min-w-0">
                            <div className="text-white text-sm font-medium font-mono">{p.name}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{p.desc}</div>
                          </div>
                          <span className={`text-xs font-bold uppercase ml-auto flex-shrink-0 ${
                            p.severity === 'critical' ? 'text-red-400' :
                            p.severity === 'high' ? 'text-orange-400' :
                            p.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {p.severity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BENCHMARKS */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Real Atheon Enhanced scan results against published npm packages — executed locally from source.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th scope="col" className="text-left text-xs text-gray-400 font-medium px-3 py-2">Package</th>
                      <th scope="col" className="text-left text-xs text-gray-400 font-medium px-3 py-2">Lang</th>
                      <th scope="col" className="text-right text-xs text-gray-400 font-medium px-3 py-2">Files</th>
                      <th scope="col" className="text-right text-xs text-gray-400 font-medium px-3 py-2">Deps</th>
                      <th scope="col" className="text-right text-xs text-gray-400 font-medium px-3 py-2">Findings</th>
                      <th scope="col" className="text-right text-xs text-gray-400 font-medium px-3 py-2">Score</th>
                      <th scope="col" className="text-center text-xs text-gray-400 font-medium px-3 py-2">Tier</th>
                      <th scope="col" className="text-center text-xs text-gray-400 font-medium px-3 py-2">Critical</th>
                      <th scope="col" className="text-center text-xs text-gray-400 font-medium px-3 py-2">High</th>
                      <th scope="col" className="text-center text-xs text-gray-400 font-medium px-3 py-2">Med</th>
                      <th scope="col" className="text-center text-xs text-gray-400 font-medium px-3 py-2">Low</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BENCHMARKS.map(b => (
                      <tr key={b.pkg} className="border-b border-gray-800 hover:bg-gray-700/30">
                        <td className="px-3 py-3 font-mono text-white">{b.pkg}</td>
                        <td className="px-3 py-3 text-gray-300">{b.lang}</td>
                        <td className="px-3 py-3 text-right text-gray-300">{b.files.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-gray-300">{b.deps}</td>
                        <td className="px-3 py-3 text-right text-purple-400 font-medium">{b.findings.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right">
                          <span className={b.score >= 90 ? 'text-green-400' : b.score >= 75 ? 'text-blue-400' : b.score >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                            {b.score}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${
                            b.tier === 'A' ? 'bg-green-500' : b.tier === 'B' ? 'bg-blue-500' : b.tier === 'C' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}>{b.tier}</span>
                        </td>
                        <td className="px-3 py-3 text-center text-red-400">{b.critical}</td>
                        <td className="px-3 py-3 text-center text-orange-400">{b.high}</td>
                        <td className="px-3 py-3 text-center text-yellow-400">{b.medium}</td>
                        <td className="px-3 py-3 text-center text-green-400">{b.low}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500">
                * Findings include all pattern matches across source files. Quality score is calculated from code quality, complexity, and issue density metrics.
              </p>
            </div>
          )}

          {/* HOW IT WORKS */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-3">1. Pattern Matching Engine</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Atheon Enhanced scans source code using a library of {totalPatterns} regex and AST-based patterns across 5 security categories.
                  Each pattern has a defined severity level (critical/high/medium/low), confidence score, and optional CWE/OWASP mapping.
                  Patterns are organized into categories: Secrets, Code Quality, Healthcare, Finance, and PII.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-3">2. Quality Scoring</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Packages receive a quality score (0–100) based on: code cleanliness (console.logs, TODOs, debug statements),
                  complexity metrics (file count, function length, nesting depth), security density (findings per file),
                  and dependency hygiene. Scores map to tiers A (90+), B (75–89), C (60–74), D (40–59), F (0–39).
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-3">3. Data Sources</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  GitHub API scans enrich packages with stars, forks, license, topics, and open issues.
                  <span className="text-purple-400 font-medium"> atheon_enhanced_real_scan</span> indicates a live
                  Atheon Enhanced CLI scan was executed against the package source. The browser/npm registry provides
                  dependency metadata from package.json.
                </p>
              </div>
              <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <h3 className="text-white font-semibold mb-3">4. Known Limitations</h3>
                <ul className="text-sm text-gray-400 space-y-1.5">
                  <li>• TypeScript packages: scanner times out on large codebases (&gt;120s)</li>
                  <li>• missing-skip-links pattern: 87% false-positive rate (over-matches .browserslistrc and .cspell files)</li>
                  <li>• Dependency counts reflect package.json declarations, not resolved tree</li>
                  <li>• Severity is pattern-assigned, not contextually evaluated</li>
                  <li>• No semantic analysis (control flow, data flow) — regex/AST pattern matching only</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
