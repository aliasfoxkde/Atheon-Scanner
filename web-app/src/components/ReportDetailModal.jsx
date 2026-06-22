import React, { useEffect, useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from './Skeleton';
import { getScoreColor, getTierColor } from '../utils/colors';
import { formatDate } from '../utils/date';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export default function ReportDetailModal({ report, onClose, onCompare }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copying, setCopying] = useState(false);
  const panelRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const prev = document.activeElement;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll(FOCUSABLE);
    if (focusable.length) focusable[0].focus();
    document.body.style.overflow = 'hidden';

    const trap = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const els = [...panel.querySelectorAll(FOCUSABLE)].filter(el => !el.disabled && el.offsetParent != null);
      if (!els.length) return;
      if (e.shiftKey) { if (document.activeElement === els[0]) { e.preventDefault(); els[els.length - 1].focus() } }
      else { if (document.activeElement === els[els.length - 1]) { e.preventDefault(); els[0].focus() } }
    };
    panel.addEventListener('keydown', trap);

    return () => {
      window.removeEventListener('keydown', () => {});
      panel.removeEventListener('keydown', trap);
      document.body.style.overflow = '';
      prev?.focus();
    };
  }, []);

  if (!report) return null;

  // Defensive: support either the embedded data shape (name, id, ...) or the legacy shape (repo_name, ...)
  const name = report.name || report.repo_name || 'Unknown';
  const id = report.id || report.scan_id || '—';
  const description = report.description || '';
  const language = report.language || 'Unknown';
  const qualityScore = typeof report.quality_score === 'number' ? report.quality_score : 0;
  const tier = report.tier || 'A';
  const stars = report.stars || 0;
  const totalDeps = report.total_dependencies || 0;
  const totalFiles = report.total_files || 0;
  const scanDate = report.scan_date;
  const scanMethod = report.scan_method || 'unknown';

  // All findings + metrics live in legacy detail records; treat as optional.
  const findings = report.findings || report.security_issues || [];
  const metrics = report.metrics || report.quality_metrics || null;
  // Use real security_counts from embedded data, fallback to legacy fields
  const securityCounts = report.security_counts || {
    critical: report.critical_findings || 0,
    high: report.high_findings || 0,
    medium: report.medium_findings || 0,
    low: report.low_findings || 0,
  };
  const totalFindings = report.total_findings || report.findings_count
    || (securityCounts.critical + securityCounts.high + securityCounts.medium + securityCounts.low);

  // Open-on-GitHub link if name is in owner/repo form
  const looksLikeRepo = typeof name === 'string' && /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(name);
  const githubUrl = looksLikeRepo ? `https://github.com/${name}` : null;

  const handleCopy = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Dashboard URL copied to clipboard');
    } catch {
      toast.error('Copy failed — your browser blocked clipboard access');
    } finally {
      setCopying(false);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/[^A-Za-z0-9._-]/g, '_')}-report.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch (e) {
      toast.error('Download failed');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — Atheon report`, url: window.location.href });
        return;
      } catch {
        /* user cancelled, fall through */
      }
    }
    handleCopy();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${name} report`}
    >
      <div
        ref={panelRef}
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{name}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTierColor(tier)}`}>
                  Tier {tier}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1 break-words">
                {description || `${language} package · scanned ${formatDate(scanDate)} via ${scanMethod}`}
              </p>
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-400 hover:text-blue-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0012 0z" /></svg>
                  Open on GitHub
                </a>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2 flex-shrink-0" aria-label="Close">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(qualityScore)}`}>
                {qualityScore}<span className="text-sm text-gray-500">/100</span>
              </div>
              <div className="text-xs text-gray-400">Quality Score</div>
            </div>
            <div className="text-center">
              <div className={`inline-block px-3 py-1 rounded-full text-lg font-bold ${getTierColor(tier)}`}>
                {tier}
              </div>
              <div className="text-xs text-gray-400 mt-1">Quality Tier</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {totalFindings > 0 ? totalFindings : <span className="text-gray-500">—</span>}
              </div>
              <div className="text-xs text-gray-400">Total Findings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {stars > 0 ? stars.toLocaleString() : <span className="text-gray-500">—</span>}
              </div>
              <div className="text-xs text-gray-400">GitHub Stars</div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-700">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'findings', label: 'Findings' },
              { id: 'metrics', label: 'Metrics' },
              { id: 'details', label: 'Details' },
            ].map((tab) => (
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

        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 320px)' }}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Repository Information</h3>
                  <dl className="space-y-2 text-sm">
                    <Row label="Language" value={language} />
                    <Row label="Stars" value={stars > 0 ? stars.toLocaleString() : '—'} />
                    <Row label="Dependencies" value={totalDeps > 0 ? totalDeps.toLocaleString() : '—'} />
                    <Row label="Files analyzed" value={totalFiles > 0 ? totalFiles.toLocaleString() : '—'} />
                    <Row label="Scan method" value={scanMethod} />
                  </dl>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Security Analysis</h3>
                  {totalFindings > 0 ? (
                    <dl className="space-y-2 text-sm">
                      <Row label="Critical" value={securityCounts.critical} accent="text-red-500 font-semibold" />
                      <Row label="High" value={securityCounts.high} accent="text-orange-500 font-semibold" />
                      <Row label="Medium" value={securityCounts.medium} accent="text-yellow-500 font-semibold" />
                      <Row label="Low" value={securityCounts.low} accent="text-blue-500 font-semibold" />
                    </dl>
                  ) : (
                    <p className="text-sm text-gray-400">No security findings were reported for this scan. The corpus has not yet collected per-package findings — only top-level tier and quality score.</p>
                  )}
                </div>
              </div>

              {metrics && Object.keys(metrics).length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Quality Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Object.entries(metrics).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{value}<span className="text-sm text-gray-500">/100</span></div>
                        <div className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-4">
              {findings.length > 0 ? (
                findings.map((finding, idx) => {
                  const sev = (finding.severity || 'info').toLowerCase()
                  const label = finding.pattern || finding.description || finding.message || 'Unknown finding'
                  return (
                    <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getSeverityColor(sev)}`}>
                          {sev}
                        </span>
                        {finding.confidence != null && (
                          <span className="text-xs text-gray-500">
                            conf {Math.round((finding.confidence) * 100)}%
                          </span>
                        )}
                        {finding.type && (
                          <span className="text-xs text-gray-400 capitalize">/{finding.type}</span>
                        )}
                      </div>
                      <h4 className="text-white font-medium">{label}</h4>
                      <div className="text-sm text-gray-400 mt-2 space-y-1">
                        {finding.file && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            <span className="font-mono text-xs">{finding.file}</span>
                            {finding.line && <span className="text-gray-500 text-xs">:{finding.line}</span>}
                          </div>
                        )}
                        {finding.category && <div>Category: {finding.category}</div>}
                        {finding.rule && <div className="font-mono text-xs text-gray-500">Rule: {finding.rule}</div>}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">
                  No security findings were recorded for this scan. The tier and quality score summarize the overall analysis.
                </div>
              )}
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {metrics && Object.keys(metrics).length > 0 ? (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Quality Score Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(metrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium text-white">{value}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg p-6 text-center text-gray-400">
                  Sub-metric breakdown is not available for this scan. Only the overall quality score is recorded.
                </div>
              )}

              {totalFindings > 0 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Critical', count: securityCounts.critical, colorClass: 'bg-red-500' },
                      { label: 'High', count: securityCounts.high, colorClass: 'bg-orange-500' },
                      { label: 'Medium', count: securityCounts.medium, colorClass: 'bg-yellow-500' },
                      { label: 'Low', count: securityCounts.low, colorClass: 'bg-blue-500' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">{item.label}</span>
                          <span className="text-sm font-medium text-white">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`${item.colorClass} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${totalFindings ? Math.min((item.count / totalFindings) * 100, 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Repository Details</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {report.clone_url && (
                    <div>
                      <dt className="text-gray-400">Clone URL</dt>
                      <dd className="text-white text-xs break-all">{report.clone_url}</dd>
                    </div>
                  )}
                  {report.homepage && (
                    <div>
                      <dt className="text-gray-400">Homepage</dt>
                      <dd className="text-white text-xs break-all">{report.homepage}</dd>
                    </div>
                  )}
                  {report.license && (
                    <div>
                      <dt className="text-gray-400">License</dt>
                      <dd className="text-white">{report.license}</dd>
                    </div>
                  )}
                  {report.default_branch && (
                    <div>
                      <dt className="text-gray-400">Default Branch</dt>
                      <dd className="text-white">{report.default_branch}</dd>
                    </div>
                  )}
                  {report.forks > 0 && (
                    <div>
                      <dt className="text-gray-400">Forks</dt>
                      <dd className="text-white">{report.forks.toLocaleString()}</dd>
                    </div>
                  )}
                  {report.open_issues > 0 && (
                    <div>
                      <dt className="text-gray-400">Open Issues</dt>
                      <dd className="text-white">{report.open_issues.toLocaleString()}</dd>
                    </div>
                  )}
                  {report.total_dependencies > 0 && (
                    <div>
                      <dt className="text-gray-400">Dependencies</dt>
                      <dd className="text-white">{report.total_dependencies.toLocaleString()}</dd>
                    </div>
                  )}
                  {report.total_files > 0 && (
                    <div>
                      <dt className="text-gray-400">Files Analyzed</dt>
                      <dd className="text-white">{report.total_files.toLocaleString()}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-gray-400">Report ID</dt>
                    <dd className="text-white font-mono text-xs break-all">{id}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Scan Date</dt>
                    <dd className="text-white">{formatDate(scanDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Scan Method</dt>
                    <dd className="text-white">{scanMethod}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-400">Language</dt>
                    <dd className="text-white">{language}</dd>
                  </div>
                </dl>
              </div>

              {report.topics && report.topics.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.topics.map((topic, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">{topic}</span>
                    ))}
                  </div>
                </div>
              )}

              {githubUrl && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Links</h3>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm break-all"
                  >
                    github.com/{name}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-sm text-gray-400">
            Scanned on {formatDate(scanDate)}
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {onCompare && (
              <button
                onClick={() => { onCompare(report); toast.info(`Added ${name} to compare`); }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add to compare
              </button>
            )}
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Download JSON
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-gray-400">{label}</dt>
      <dd className={accent || 'text-white'}>{value}</dd>
    </div>
  );
}

function getSeverityColor(severity) {
  switch (String(severity).toLowerCase()) {
    case 'critical': return 'text-red-500 bg-red-500/10';
    case 'high': return 'text-orange-500 bg-orange-500/10';
    case 'medium': return 'text-yellow-500 bg-yellow-500/10';
    case 'low': return 'text-blue-500 bg-blue-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
}
