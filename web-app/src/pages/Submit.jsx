import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { Skeleton, SkeletonStat } from '../components/Skeleton';
import { loadRealScannerData } from '../services/realScannerData';
import { addPendingSubmission } from '../utils/backgroundSync';

const RECENT_KEY = 'atheon_recent_submissions';

export default function Submit() {
  const [formData, setFormData] = useState({ type: 'github', url: '', repo: '' });
  const [touched, setTouched] = useState({ repo: false, url: false });
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [recent, setRecent] = useState([]);
  const [scanEstimate, setScanEstimate] = useState(null);
  const [estimateVisible, setEstimateVisible] = useState(false);
  const scanTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const toast = useToast();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      setRecent(stored);
    } catch {
      setRecent([]);
    }
  }, []);

  const persistRecent = (entry) => {
    setRecent((prev) => {
      const next = [entry, ...prev.filter((r) => r.target !== entry.target)].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const computeScanEstimate = async (repoInput) => {
    const trimmed = (repoInput || '').trim();
    if (!trimmed || !trimmed.includes('/')) {
      setScanEstimate(null);
      setEstimateVisible(false);
      return;
    }
    const controller = new AbortController();
    try {
      const data = await loadRealScannerData(controller.signal);
      const found = (data.recent_scans || []).find(
        (r) => r.name && r.name.toLowerCase() === repoInput.toLowerCase()
      );
      let deps, files;
      if (found) {
        deps = found.total_dependencies || 0;
        files = found.total_files || 0;
      } else {
        // Estimate based on pattern
        const parts = repoInput.split('/');
        const org = parts[0] || '';
        const name = parts[1] || '';
        const isKnownOrg = org.length > 3 && org.length < 30;
        const isShortName = name.length <= 5;
        if (isShortName) {
          deps = 20;
          files = 100;
        } else if (isKnownOrg) {
          deps = 100;
          files = 500;
        } else {
          deps = 50;
          files = 200;
        }
      }
      let time;
      if (deps < 50) time = '~30 seconds';
      else if (deps < 200) time = '~2 minutes';
      else if (deps < 500) time = '~5 minutes';
      else time = '~10+ minutes';
      setScanEstimate({ time, deps, files });
      setEstimateVisible(true);
    } catch {
      setScanEstimate(null);
      setEstimateVisible(false);
    }
  };

  const getFieldError = (field) => {
    if (field === 'repo') {
      if (!formData.repo) return 'Repository is required';
      if (!formData.repo.includes('/'))
        return 'Must be in the form owner/name (e.g. facebook/react)';
    }
    if (field === 'url') {
      if (!formData.url) return 'URL is required';
      try {
        const u = new URL(formData.url);
        if (!['http:', 'https:'].includes(u.protocol))
          return 'Only http:// and https:// URLs are allowed';
        return null;
      } catch {
        return 'Please enter a valid URL';
      }
    }
    return null;
  };

  const isFieldInvalid = (field) => touched[field] && !!getFieldError(field);

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === 'repo') computeScanEstimate(formData.repo);
  };

  const validate = () => {
    setTouched({ repo: true, url: true });
    if (formData.type === 'github') {
      if (!formData.repo || !formData.repo.includes('/')) {
        toast.error('Repository must be in the form owner/name (e.g. facebook/react)');
        return false;
      }
    } else if (formData.type === 'url') {
      try {
        new URL(formData.url);
      } catch {
        toast.error('Please enter a valid URL');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setScanning(false);
      return;
    }
    setScanning(true);
    setResult(null);

    const target = formData.type === 'github' ? formData.repo : formData.url;

    try {
      // If offline, queue the submission for later
      if (!navigator.onLine) {
        setScanning(false);
        addPendingSubmission({ target, type: formData.type });
        toast.info("You're offline. Scan will be submitted when you're back online.");
        return;
      }

      // Simulate scan locally — we don't have a real backend for new scans
      scanTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        const mockResult = {
          scanId: `sim-${Date.now()}`,
          status: 'queued',
          target,
          type: formData.type,
          estimatedTime: '2-5 minutes',
          submittedAt: new Date().toISOString(),
          message:
            'Scan queued. Since this is a read-only deployment, full scan execution is not available. Browse existing reports below.',
        };
        setResult(mockResult);
        setScanning(false);
        toast.success('Scan request submitted');
        persistRecent({ target, type: formData.type, at: mockResult.submittedAt });
      }, 800);
    } catch (err) {
      setScanning(false);
      toast.error('Submission failed. Please try again.');
    }
  };

  const fillRecent = (r) => {
    setFormData({
      ...formData,
      type: r.type,
      repo: r.type === 'github' ? r.target : '',
      url: r.type === 'url' ? r.target : '',
    });
    toast.info(`Loaded ${r.target}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Submit Code for Analysis</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Submit a GitHub repository or public URL. The scanner will analyze dependencies, quality,
          and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-300 mb-2">
                Submission type
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'github', l: 'GitHub repo' },
                  { v: 'url', l: 'Public URL' },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    role="radio"
                    aria-checked={formData.type === o.v}
                    onClick={() => setFormData({ ...formData, type: o.v })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.type === o.v
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </fieldset>

            {formData.type === 'github' ? (
              <div>
                <label
                  htmlFor="submit-repo"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Repository (owner/name)
                </label>
                <input
                  id="submit-repo"
                  type="text"
                  value={formData.repo}
                  onChange={(e) => setFormData({ ...formData, repo: e.target.value })}
                  onBlur={() => handleBlur('repo')}
                  aria-invalid={isFieldInvalid('repo')}
                  aria-describedby={isFieldInvalid('repo') ? 'repo-error' : undefined}
                  placeholder="facebook/react"
                  className={`w-full bg-gray-900 border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isFieldInvalid('repo') ? 'border-red-500' : 'border-gray-700'}`}
                />
                {isFieldInvalid('repo') && (
                  <p id="repo-error" className="mt-1 text-xs text-red-400" role="alert">
                    {getFieldError('repo')}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor="submit-url"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Repository URL
                </label>
                <input
                  id="submit-url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  onBlur={() => handleBlur('url')}
                  aria-invalid={isFieldInvalid('url')}
                  aria-describedby={isFieldInvalid('url') ? 'url-error' : undefined}
                  placeholder="https://github.com/facebook/react"
                  className={`w-full bg-gray-900 border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isFieldInvalid('url') ? 'border-red-500' : 'border-gray-700'}`}
                />
                {isFieldInvalid('url') && (
                  <p id="url-error" className="mt-1 text-xs text-red-400" role="alert">
                    {getFieldError('url')}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={scanning}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span>Submitting…</span>
                </>
              ) : (
                'Submit for analysis'
              )}
            </button>
          </form>

          {recent.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h3 className="text-sm font-semibold text-white mb-3">Recent submissions</h3>
              <ul className="space-y-1">
                {recent.map((r, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => fillRecent(r)}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 text-sm text-gray-300 flex items-center justify-between gap-2"
                    >
                      <span className="truncate font-mono">{r.target}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0">{r.type}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {estimateVisible && scanEstimate && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gray-400 text-sm">Estimated scan time</span>
              <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-700">
                info
              </span>
            </div>
            <p className="text-white font-semibold text-lg">{scanEstimate.time}</p>
            <p className="text-gray-400 text-xs mt-1">
              Based on ~{scanEstimate.deps} dependencies · ~{scanEstimate.files.toLocaleString()}{' '}
              files
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
            <ol className="space-y-2 text-gray-300 text-sm">
              {[
                'Submit your GitHub repository or public URL',
                'Scanner analyzes 8+ dependency and code-quality patterns',
                'You receive a tier (A–F), quality score, and finding breakdown',
                'Drill into any report to see file-level findings',
              ].map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-xs">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Quality tiers</h3>
            <div className="space-y-2">
              {[
                { tier: 'A', label: '90–100', cls: 'bg-green-500' },
                { tier: 'B', label: '75–89', cls: 'bg-blue-500' },
                { tier: 'C', label: '60–74', cls: 'bg-yellow-500' },
                { tier: 'D', label: '40–59', cls: 'bg-orange-500' },
                { tier: 'F', label: '0–39', cls: 'bg-red-500' },
              ].map((t) => (
                <div key={t.tier} className="flex items-center gap-3 text-sm">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${t.cls}`}
                  >
                    {t.tier}
                  </span>
                  <span className="text-gray-400">{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {scanning && (
        <div className="space-y-3">
          <SkeletonStat />
          <SkeletonStat />
        </div>
      )}

      {result && !scanning && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Submission received</h3>
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded">Queued</span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-400">Scan ID</dt>
              <dd className="text-white font-mono text-xs">{result.scanId}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Target</dt>
              <dd className="text-white font-mono text-xs break-all">{result.target}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Type</dt>
              <dd className="text-white">{result.type}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Estimated time</dt>
              <dd className="text-white">{result.estimatedTime}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-gray-400">{result.message}</p>
          <div className="mt-4 flex gap-3">
            <Link
              to="/reports"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              Browse existing reports
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
