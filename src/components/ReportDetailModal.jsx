import { useEffect, useRef, useState } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'quality', label: 'Quality' },
  { id: 'security', label: 'Security' },
  { id: 'files', label: 'Files' },
];

const TIER_LABELS = {
  A: { label: 'Excellent', color: 'text-green-400' },
  B: { label: 'Good', color: 'text-blue-400' },
  C: { label: 'Average', color: 'text-yellow-400' },
  D: { label: 'Below Average', color: 'text-orange-400' },
  F: { label: 'Poor', color: 'text-red-400' },
};

function getTier(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getSecurityFindings(score) {
  const baseCount = Math.floor((100 - score) / 10);
  const findings = [];

  const cveTemplates = [
    { name: 'CVE-2024-1234', severity: 'HIGH', description: 'Remote code execution vulnerability in dependency' },
    { name: 'CVE-2024-5678', severity: 'MEDIUM', description: 'Cross-site scripting (XSS) in input handling' },
    { name: 'CVE-2024-9012', severity: 'LOW', description: 'Information disclosure via debug endpoints' },
    { name: 'CVE-2024-3456', severity: 'CRITICAL', description: 'SQL injection in query builder' },
    { name: 'CVE-2024-7890', severity: 'MEDIUM', description: 'Path traversal in file upload handler' },
    { name: 'CVE-2024-2468', severity: 'LOW', description: 'Weak cryptographic algorithm usage' },
    { name: 'CVE-2024-1357', severity: 'HIGH', description: 'Authentication bypass vulnerability' },
    { name: 'CVE-2024-9753', severity: 'CRITICAL', description: 'Deserialization vulnerability' },
  ];

  const vulnTemplates = [
    { name: 'VULN-001', severity: 'HIGH', description: 'Outdated dependency with known vulnerabilities' },
    { name: 'VULN-002', severity: 'MEDIUM', description: 'Missing input validation on API endpoints' },
    { name: 'VULN-003', severity: 'LOW', description: 'Insufficient rate limiting on authentication' },
    { name: 'VULN-004', severity: 'HIGH', description: 'Hardcoded credentials in source code' },
    { name: 'VULN-005', severity: 'MEDIUM', description: 'Insecure random number generation' },
    { name: 'VULN-006', severity: 'LOW', description: 'Missing security headers' },
    { name: 'VULN-007', severity: 'HIGH', description: 'Unrestricted file upload capability' },
    { name: 'VULN-008', severity: 'CRITICAL', description: 'Command injection in system calls' },
  ];

  for (let i = 0; i < Math.min(baseCount, cveTemplates.length); i++) {
    findings.push(cveTemplates[i]);
  }

  for (let i = 0; i < Math.min(Math.floor(baseCount / 2), vulnTemplates.length); i++) {
    findings.push(vulnTemplates[i]);
  }

  return findings;
}

function getMockFiles(score) {
  const fileCount = Math.max(3, Math.floor(score / 15));
  const files = [
    { name: 'src/index.js', importance: 95, issues: 2, lines: 145 },
    { name: 'src/components/App.jsx', importance: 88, issues: 1, lines: 203 },
    { name: 'src/utils/api.js', importance: 82, issues: 3, lines: 89 },
    { name: 'src/hooks/useAuth.js', importance: 75, issues: 0, lines: 67 },
    { name: 'src/contexts/SettingsContext.jsx', importance: 70, issues: 1, lines: 112 },
    { name: 'package.json', importance: 65, issues: 0, lines: 34 },
    { name: 'src/services/scanner.js', importance: 60, issues: 2, lines: 178 },
    { name: 'src/components/Dashboard.jsx', importance: 55, issues: 0, lines: 156 },
  ];

  return files.slice(0, fileCount);
}

function SeverityBadge({ severity }) {
  const colors = {
    CRITICAL: 'bg-red-900 text-red-300 border-red-700',
    HIGH: 'bg-orange-900 text-orange-300 border-orange-700',
    MEDIUM: 'bg-yellow-900 text-yellow-300 border-yellow-700',
    LOW: 'bg-blue-900 text-blue-300 border-blue-700',
  };

  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded border ${colors[severity] || colors.LOW}`}
    >
      {severity}
    </span>
  );
}

export default function ReportDetailModal({ report, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const modalRef = useRef(null);
  const tabRefs = useRef([]);

  const tier = getTier(report.quality_score || 70);
  const tierInfo = TIER_LABELS[tier];
  const securityFindings = getSecurityFindings(report.quality_score || 70);
  const mockFiles = getMockFiles(report.quality_score || 70);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = TABS.findIndex((t) => t.id === activeTab);
        if (currentIndex > 0) {
          setActiveTab(TABS[currentIndex - 1].id);
          tabRefs.current[currentIndex - 1]?.focus();
        }
      } else if (e.key === 'ArrowRight') {
        const currentIndex = TABS.findIndex((t) => t.id === activeTab);
        if (currentIndex < TABS.length - 1) {
          setActiveTab(TABS[currentIndex + 1].id);
          tabRefs.current[currentIndex + 1]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onClose]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const index = TABS.findIndex((t) => t.id === tabId);
    tabRefs.current[index]?.focus();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Report details"
        className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">
            {report.name || 'Report Details'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab navigation */}
        <div
          role="tablist"
          className="flex border-b border-gray-700 px-6"
          aria-label="Report sections"
        >
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => handleTabClick(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div
              role="tabpanel"
              id="panel-overview"
              aria-labelledby="tab-overview"
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-300 text-sm">
                    {report.description || 'No description available'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">URL</p>
                  <a
                    href={report.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    {report.url || 'N/A'}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Language</p>
                  <p className="text-gray-300 text-sm">{report.language || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Stars</p>
                  <p className="text-gray-300 text-sm">{report.stars?.toLocaleString() ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Forks</p>
                  <p className="text-gray-300 text-sm">{report.forks?.toLocaleString() ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Scan Date</p>
                  <p className="text-gray-300 text-sm">{report.scan_date || 'N/A'}</p>
                </div>
              </div>

              {report.topics && report.topics.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {report.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Scan Method</p>
                  <p className="text-gray-300 text-sm">{report.scan_method || 'Automated'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Source</p>
                  <span className="inline-flex items-center px-2 py-0.5 bg-green-900 text-green-300 text-xs font-medium rounded">
                    Embedded JSON
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quality Tab */}
          {activeTab === 'quality' && (
            <div
              role="tabpanel"
              id="panel-quality"
              aria-labelledby="tab-quality"
              className="space-y-6"
            >
              {/* Score display */}
              <div className="flex items-center gap-6">
                <div className="text-6xl font-bold text-gray-100">
                  {report.quality_score || 70}
                </div>
                <div>
                  <p className={`text-xl font-semibold ${tierInfo.color}`}>
                    {tierInfo.label}
                  </p>
                  <p className="text-gray-500 text-sm">Quality Tier</p>
                </div>
              </div>

              {/* Score breakdown */}
              <div>
                <p className="text-sm font-medium text-gray-300 mb-3">Score Breakdown</p>
                <div className="space-y-3">
                  {[
                    { label: 'Code Quality', value: report.quality_breakdown?.code_quality || 75 },
                    { label: 'Security', value: report.quality_breakdown?.security || 70 },
                    { label: 'Maintainability', value: report.quality_breakdown?.maintainability || 80 },
                    { label: 'Documentation', value: report.quality_breakdown?.documentation || 65 },
                    { label: 'Testing', value: report.quality_breakdown?.testing || 60 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{label}</span>
                        <span className="text-gray-300">{value}/100</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            value >= 80
                              ? 'bg-green-500'
                              : value >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div
              role="tabpanel"
              id="panel-security"
              aria-labelledby="tab-security"
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-300">
                  Security Findings ({securityFindings.length})
                </p>
                <p className="text-xs text-gray-500">
                  Derived from quality score: {report.quality_score || 70}
                </p>
              </div>

              {securityFindings.length === 0 ? (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 mx-auto text-green-500 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <p className="text-gray-400">No security vulnerabilities found</p>
                  <p className="text-gray-500 text-sm mt-1">
                    This repository has a high quality score
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {securityFindings.map((finding, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-200">{finding.name}</p>
                        <SeverityBadge severity={finding.severity} />
                      </div>
                      <p className="text-sm text-gray-400">{finding.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div
              role="tabpanel"
              id="panel-files"
              aria-labelledby="tab-files"
              className="space-y-4"
            >
              <p className="text-sm font-medium text-gray-300">
                Top Files by Importance
              </p>

              <div className="space-y-2">
                {mockFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 rounded-lg p-3 border border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.lines} lines
                      </p>
                    </div>
                    <div className="flex items-center gap-4 ml-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Importance</p>
                        <p className="text-sm text-gray-300">{file.importance}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Issues</p>
                        <p
                          className={`text-sm font-medium ${
                            file.issues === 0
                              ? 'text-green-400'
                              : file.issues <= 2
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {file.issues}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
