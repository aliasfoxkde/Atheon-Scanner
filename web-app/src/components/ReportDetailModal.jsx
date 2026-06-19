import React, { useState } from 'react';

export default function ReportDetailModal({ report, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!report) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'findings', label: 'Findings' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'details', label: 'Details' }
  ];

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-500 bg-red-500 bg-opacity-10';
      case 'high': return 'text-orange-500 bg-orange-500 bg-opacity-10';
      case 'medium': return 'text-yellow-500 bg-yellow-500 bg-opacity-10';
      case 'low': return 'text-blue-500 bg-blue-500 bg-opacity-10';
      default: return 'text-gray-500 bg-gray-500 bg-opacity-10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{report.repo_name}</h2>
              <p className="text-sm text-gray-400 mt-1">{report.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(report.quality_score)}`}>
                {report.quality_score}/100
              </div>
              <div className="text-xs text-gray-400">Quality Score</div>
            </div>
            <div className="text-center">
              <div className={`px-3 py-1 rounded-full text-lg font-bold ${getTierColor(report.tier)}`}>
                {report.tier}
              </div>
              <div className="text-xs text-gray-400 mt-1">Quality Tier</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{report.total_findings}</div>
              <div className="text-xs text-gray-400">Total Findings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{report.stars?.toLocaleString()}</div>
              <div className="text-xs text-gray-400">GitHub Stars</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Repository Information</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Language</dt>
                      <dd className="text-white">{report.language}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Category</dt>
                      <dd className="text-white capitalize">{report.category?.replace('-', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Stars</dt>
                      <dd className="text-white">{report.stars?.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Forks</dt>
                      <dd className="text-white">{report.forks?.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Open Issues</dt>
                      <dd className="text-white">{report.open_issues?.toLocaleString()}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Security Analysis</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-400">Critical</dt>
                      <dd className="text-red-500 font-semibold">{report.critical_findings || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-400">High</dt>
                      <dd className="text-orange-500 font-semibold">{report.high_findings || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-400">Medium</dt>
                      <dd className="text-yellow-500 font-semibold">{report.medium_findings || 0}</dd>
                    </div>
                    <div className="flex justify-between items-center">
                      <dt className="text-gray-400">Low</dt>
                      <dd className="text-blue-500 font-semibold">{report.low_findings || 0}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {report.metrics && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Quality Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(report.metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{value}/100</div>
                        <div className="text-xs text-gray-400 capitalize">{key.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-4">
              {report.findings?.length > 0 ? (
                report.findings.map((finding, idx) => (
                  <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(finding.severity)}`}>
                            {finding.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">{finding.type}</span>
                        </div>
                        <h4 className="text-white font-medium">{finding.description}</h4>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">
                      <div>File: {finding.file}</div>
                      <div>Line: {finding.line}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">No findings available</div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Quality Score Breakdown</h3>
                <div className="space-y-4">
                  {report.metrics && Object.entries(report.metrics).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400 capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-sm font-medium text-white">{value}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Critical', count: report.critical_findings || 0, color: 'red' },
                    { label: 'High', count: report.high_findings || 0, color: 'orange' },
                    { label: 'Medium', count: report.medium_findings || 0, color: 'yellow' },
                    { label: 'Low', count: report.low_findings || 0, color: 'blue' }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">{item.label}</span>
                        <span className="text-sm font-medium text-white">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${Math.min((item.count / report.total_findings) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Technical Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-400">Report ID</dt>
                    <dd className="text-white font-mono text-xs">{report.id}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Scan Date</dt>
                    <dd className="text-white">{new Date(report.scan_date).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Repository Created</dt>
                    <dd className="text-white">{new Date(report.created_at).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Last Updated</dt>
                    <dd className="text-white">{new Date(report.updated_at).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">License</dt>
                    <dd className="text-white">{report.license?.name || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Default Branch</dt>
                    <dd className="text-white">{report.default_branch || 'main'}</dd>
                  </div>
                </dl>
              </div>

              {report.topics && report.topics.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-400">
            Scanned on {new Date(report.scan_date).toLocaleDateString()}
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Download Report
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score) {
  if (score >= 90) return 'text-green-500';
  if (score >= 75) return 'text-blue-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

function getTierColor(tier) {
  switch (tier) {
    case 'A': return 'bg-green-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'C': return 'bg-yellow-500 text-white';
    case 'D': return 'bg-orange-500 text-white';
    default: return 'bg-red-500 text-white';
  }
}