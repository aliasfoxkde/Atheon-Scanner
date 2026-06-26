import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { SCAN_METHODS } from '../utils/scanCategories';

const RECENT_KEY = 'recent_submissions';
const MAX_RECENT = 5;

const REPO_REGEX = /^[^/]+\/[^/]+$/;

function loadRecentSubmissions() {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSubmissions(submissions) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(submissions));
  } catch {
    // ignore storage errors
  }
}

function computeScanEstimate(repoName) {
  if (!repoName || repoName.length < 3) return null;
  return Math.max(10, repoName.length * 2);
}

export default function Submit() {
  useDocumentTitle('Submit — Atheon Scanner');

  const [repo, setRepo] = useState('');
  const [scanType, setScanType] = useState('hybrid');
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setRecentSubmissions(loadRecentSubmissions());
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const validateRepo = (value) => {
    if (!value.trim()) {
      setError('');
      setEstimate(null);
      return;
    }
    if (!REPO_REGEX.test(value.trim())) {
      setError('Invalid format. Use owner/repo-name');
      setEstimate(null);
    } else {
      setError('');
      setEstimate(computeScanEstimate(value.trim()));
    }
  };

  const handleRepoBlur = () => {
    validateRepo(repo);
  };

  const handleRepoChange = (e) => {
    const value = e.target.value;
    setRepo(value);
    if (error && REPO_REGEX.test(value.trim())) {
      setError('');
      setEstimate(computeScanEstimate(value.trim()));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedRepo = repo.trim();
    if (!trimmedRepo) {
      setError('Repository is required');
      return;
    }
    if (!REPO_REGEX.test(trimmedRepo)) {
      setError('Invalid format. Use owner/repo-name');
      return;
    }

    setError('');
    setSubmitting(true);

    // Simulate scanning delay with error boundary
    await new Promise((resolve) => {
      setTimeout(() => {
        try {
          resolve();
        } catch (err) {
          console.error('Submit error:', err);
          setError('An error occurred during submission');
          setSubmitting(false);
        }
      }, 800);
    });

    const submittedAt = new Date().toISOString();

    // Persist to recent submissions
    setRecentSubmissions((prev) => {
      const filtered = prev.filter((s) => s.repo !== trimmedRepo);
      const next = [{ repo: trimmedRepo, scanType, submittedAt }, ...filtered].slice(
        0,
        MAX_RECENT
      );
      saveRecentSubmissions(next);
      return next;
    });

    setSubmitted({ repo: trimmedRepo, scanType, submittedAt });
    setSubmitting(false);
    showToast('Submission recorded — live scanning coming soon');
  };

  const handleScanAgain = (submission) => {
    setRepo(submission.repo);
    setScanType(submission.scanType);
    setSubmitted(null);
    setError('');
    validateRepo(submission.repo);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Submit Scan</h1>
        <p className="text-gray-400 mt-1">Request a new repository scan</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-green-600 text-white rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Submit Form */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Repo Input */}
          <div>
            <label
              htmlFor="submit-repo"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Repository
            </label>
            <input
              id="submit-repo"
              type="text"
              value={repo}
              onChange={handleRepoChange}
              onBlur={handleRepoBlur}
              placeholder="owner/repo-name"
              className={`w-full px-4 py-2 bg-gray-800 border ${
                error ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              disabled={submitting}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400">{error}</p>
            )}
          </div>

          {/* Estimate Card */}
          {estimate && !error && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400">Estimated scan time</p>
              <p className="text-lg font-medium text-white">~{estimate} seconds</p>
            </div>
          )}

          {/* Scan Type Radio Group */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-300 mb-3">
              Scan Type
            </legend>
            <div
              className="space-y-3"
              role="radiogroup"
              aria-label="Scan type"
            >
              {SCAN_METHODS.filter((m) =>
                ['hybrid', 'universal', 'comprehensive', 'mass'].includes(m.id)
              ).map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    scanType === method.id
                      ? 'bg-blue-600/10 border-blue-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="scanType"
                    value={method.id}
                    checked={scanType === method.id}
                    onChange={(e) => setScanType(e.target.value)}
                    className="mt-0.5 w-4 h-4 border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                    disabled={submitting}
                  />
                  <div>
                    <p className="font-medium text-white">{method.label}</p>
                    <p className="text-sm text-gray-400">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Scanning...
              </span>
            ) : (
              'Submit Scan Request'
            )}
          </button>
        </form>
      </div>

      {/* Success Result */}
      {submitted && !submitting && (
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-400 mb-3">
            Scan Request Submitted
          </h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <span className="text-gray-500">Repository:</span> {submitted.repo}
            </p>
            <p>
              <span className="text-gray-500">Scan Type:</span>{' '}
              {SCAN_METHODS.find((m) => m.id === submitted.scanType)?.label ||
                submitted.scanType}
            </p>
            <p>
              <span className="text-gray-500">Submitted:</span>{' '}
              {new Date(submitted.submittedAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {recentSubmissions.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Submissions
          </h2>
          <div className="space-y-3">
            {recentSubmissions.map((submission, index) => (
              <div
                key={`${submission.repo}-${submission.submittedAt}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div>
                  <p className="font-medium text-white">{submission.repo}</p>
                  <p className="text-sm text-gray-400">
                    {SCAN_METHODS.find((m) => m.id === submission.scanType)
                      ?.label || submission.scanType}{' '}
                    • {new Date(submission.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleScanAgain(submission)}
                  className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Scan again
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
