const SCANNER_VERSION = '1.0.0'
const BUILD_DATE = '2026-06-21'
const TOTAL_PATTERNS = 55
const CATEGORIES = [
  { name: 'Secrets Detection', icon: '🔐', count: 27, desc: 'API tokens, credentials, connection strings, private keys' },
  { name: 'Code Quality', icon: '📋', count: 13, desc: 'Console logs, debug stmts, TODOs, deprecated functions, dead code' },
  { name: 'Healthcare / PHI', icon: '🏥', count: 9, desc: 'Patient IDs, MRN, prescription numbers, clinical trial IDs, insurance' },
  { name: 'Financial Data', icon: '💳', count: 4, desc: 'ABA routing numbers, IBAN, SWIFT codes, payment card data' },
  { name: 'PII / Personal Data', icon: '👤', count: 2, desc: 'Social security numbers, phone numbers, personal identifiers' },
]

const DISABLED_PATTERNS = [
  { name: 'missing-skip-links', reason: '87% false-positive rate — over-matches .browserslistrc and .cspell files' },
  { name: 'todo-missing-metadata', reason: 'Too noisy in large codebases — needs context-aware filtering' },
]

const LIMITATIONS = [
  { severity: 'medium', label: 'TypeScript timeouts', desc: 'Large TypeScript codebases (&gt;120s) cause scan timeouts. Large-file support is bounded by the lesser of 5MB or 10k lines per file.' },
  { severity: 'low', label: 'Regex / AST only', desc: 'No semantic analysis (control flow, data flow). Findings are pattern-matched, not contextually evaluated.' },
  { severity: 'low', label: 'Severity is static', desc: 'Severity is assigned per-pattern at development time, not per-finding based on usage context.' },
  { severity: 'medium', label: 'Dependency counts', desc: 'Reflect package.json declarations, not the resolved dependency tree. May overstate actual supply-chain footprint.' },
  { severity: 'medium', label: 'Known false positives', desc: 'missing-skip-links and todo-missing-metadata are temporarily disabled due to high false-positive rates.' },
  { severity: 'low', label: 'Cross-repo analysis', desc: 'Only scans one repository at a time. No cross-repo dependency graph or transitive vulnerability tracing.' },
]

const RESOURCES = [
  { label: 'Atheon Enhanced CLI', url: 'https://github.com/HoraDomu/Atheon', desc: 'The underlying scanner engine — run locally against any GitHub repository' },
  { label: 'Atheon on GitHub', url: 'https://github.com/aliasfoxkde/Atheon-Scanner', desc: 'This web scanner project — fork and deploy your own instance' },
  { label: 'GitHub REST API', url: 'https://docs.github.com/en/rest', desc: 'Package metadata, stars, forks, topics, and open issues' },
  { label: 'npm Registry API', url: 'https://registry.npmjs.org/', desc: 'Dependency metadata and package information' },
]

export default function About() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-white">About Atheon Scanner</h1>
        <p className="text-gray-400 mt-2">
          Automated GitHub repository analysis powered by the Atheon Enhanced scanner engine.
        </p>
        <div className="flex flex-wrap gap-3 mt-3">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium">
            v{SCANNER_VERSION}
          </span>
          <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-medium">
            {TOTAL_PATTERNS} active patterns
          </span>
          <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-medium">
            Built {BUILD_DATE}
          </span>
        </div>
      </div>

      {/* What is Atheon */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">What is Atheon Enhanced?</h2>
        <div className="text-sm text-gray-300 space-y-3 leading-relaxed">
          <p>
            <strong className="text-white">Atheon Enhanced</strong> is a CLI security scanner that analyzes GitHub repositories
            for secrets, code quality issues, healthcare data (PHI), financial data, and personally identifiable information (PII).
            It combines regex pattern matching with AST-based analysis to find issues embedded in source code.
          </p>
          <p>
            The scanner ships with <strong className="text-white">{TOTAL_PATTERNS} enabled patterns</strong> across
            5 categories. Each pattern has a defined severity level (critical/high/medium/low),
            a confidence score, and optional CWE/OWASP mapping.
          </p>
          <p>
            The webapp at <code className="text-blue-400 text-xs bg-gray-900 px-1.5 py-0.5 rounded">atheon-scanner.pages.dev</code>{' '}
            provides a browser-accessible interface to browse analysis results, explore findings, and compare packages —
            without installing the CLI.
          </p>
        </div>
      </div>

      {/* Version status */}
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-white font-semibold text-sm">Scanner version is pre-release</h3>
            <p className="text-xs text-gray-400 mt-1">
              v{SCANNER_VERSION} is a development build. Pattern definitions, severity assignments, and scan methodology
              may change between releases. See <a href="https://github.com/aliasfoxkde/Atheon-Scanner/releases" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">the changelog</a> for
              the latest updates. Production deployments should pin to a tagged release.
            </p>
          </div>
        </div>
      </div>

      {/* Pattern categories */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Pattern Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <div className="text-white font-medium text-sm">{cat.name}</div>
                  <div className="text-xs text-gray-400">{cat.count} patterns</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">{cat.desc}</p>
            </div>
          ))}
        </div>

        {/* Disabled patterns */}
        <div className="mt-6">
          <h3 className="text-white font-medium text-sm mb-3">Temporarily Disabled Patterns</h3>
          <div className="space-y-2">
            {DISABLED_PATTERNS.map(p => (
              <div key={p.name} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                <div>
                  <div className="text-white text-xs font-mono">{p.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{p.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Scan Methodology</h2>
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Repository Discovery',
              desc: 'Repositories are identified via GitHub API (trending, search, or direct submission). Package metadata is enriched from the npm registry where applicable.'
            },
            {
              step: '2',
              title: 'Source Acquisition',
              desc: 'The scanner clones the repository or fetches the package tarball. For npm packages, it resolves the package.json to identify the published source.'
            },
            {
              step: '3',
              title: 'Pattern Matching',
              desc: `Each of the ${TOTAL_PATTERNS} patterns runs against every supported file type. Patterns are organized into 5 categories. Matches are deduplicated and assigned a confidence score based on pattern complexity.`
            },
            {
              step: '4',
              title: 'Quality Scoring',
              desc: 'A composite quality score (0–100) is calculated from code cleanliness (console.logs, TODOs, dead code), complexity metrics (file count, nesting), security density (findings per file), and dependency hygiene. Scores map to tiers A (90+), B (75–89), C (60–74), D (40–59), F (0–39).'
            },
            {
              step: '5',
              title: 'Data Enrichment',
              desc: 'GitHub API enriches each record with stars, forks, license, topics, and open issue counts. Security findings are counted and categorized by severity.'
            },
          ].map(s => (
            <div key={s.step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-400 text-sm font-bold">{s.step}</span>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Known limitations */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Known Limitations</h2>
        <div className="space-y-2">
          {LIMITATIONS.map(l => (
            <div key={l.label} className="flex items-start gap-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                l.severity === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />
              <div>
                <div className="text-white text-xs font-medium">{l.label}</div>
                <div className="text-xs text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: l.desc }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {RESOURCES.map(r => (
            <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 bg-gray-900 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <div>
                <div className="text-white text-sm font-medium">{r.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{r.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Privacy & Attribution */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-5">Privacy &amp; Attribution</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-300">
          <div>
            <h3 className="text-white font-medium mb-2">Privacy</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Submitted repositories are scanned and the results (package name, quality score, findings, and metadata) are
              stored in embedded data. No personal data is collected. GitHub API tokens are used only for the duration
              of the scan session and are not persisted. Scans are performed against publicly available repositories only.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">Attribution</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Built with React, Vite, Tailwind CSS, Recharts, and Cloudflare Pages.
              The Atheon Enhanced scanner engine is a separate Go CLI project.
              GitHub data is sourced via the public GitHub REST API. npm package data
              is sourced from the public npm registry.
            </p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-gray-500">
            Report issues or request patterns at the Atheon GitHub repository.
          </div>
          <div className="text-xs text-gray-600">
            © {new Date().getFullYear()} Atheon Scanner · v{SCANNER_VERSION} · {BUILD_DATE}
          </div>
        </div>
      </div>
    </div>
  )
}
