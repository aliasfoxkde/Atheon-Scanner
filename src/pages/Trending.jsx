import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getTrendingReports } from '../services/api';
import { getLanguageColor, getLanguageLabel } from '../utils/scanCategories';
import { SkeletonTable } from '../components/Skeleton';
import Modal from '../components/Modal';

const TIER_COLORS = {
  S: 'bg-cyan-400 text-cyan-900',
  A: 'bg-green-400 text-green-900',
  B: 'bg-yellow-400 text-yellow-900',
  C: 'bg-orange-400 text-orange-900',
  D: 'bg-red-400 text-red-900',
  F: 'bg-gray-400 text-gray-900',
};

function getTierBadgeClass(tier) {
  return TIER_COLORS[tier] || 'bg-gray-400 text-gray-900';
}

function getTierFromScore(score) {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const WATCHLIST_KEY = 'watchlist';

function loadWatchlist() {
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(watchlist) {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  } catch {
    // ignore storage errors
  }
}

export default function Trending() {
  useDocumentTitle('Trending — Atheon Scanner');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Load watchlist from localStorage
  useEffect(() => {
    setWatchlist(loadWatchlist());
  }, []);

  // Load trending reports
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await getTrendingReports(20);
        setReports(data);
      } catch (err) {
        console.error('Failed to load trending reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isWatched = (repoName) => watchlist.includes(repoName);

  const toggleWatch = (repoName) => {
    setWatchlist((prev) => {
      const next = prev.includes(repoName)
        ? prev.filter((n) => n !== repoName)
        : [...prev, repoName];
      saveWatchlist(next);
      return next;
    });
  };

  const removeFromWatchlist = (repoName) => {
    setWatchlist((prev) => {
      const next = prev.filter((n) => n !== repoName);
      saveWatchlist(next);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Trending</h1>
        <p className="text-gray-400 mt-1">Top repositories by stars</p>
      </div>

      {/* Top Watched Section */}
      {watchlist.length > 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-white mb-3">Top Watched</h2>
          <div className="flex flex-wrap gap-3">
            {watchlist.map((repoName) => (
              <div
                key={repoName}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-gray-200 text-sm"
              >
                <span>{repoName}</span>
                <button
                  onClick={() => removeFromWatchlist(repoName)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Remove from watchlist"
                  aria-label={`Remove ${repoName} from watchlist`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <SkeletonTable rows={10} cols={7} />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No trending reports found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stars
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Watchers
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Scan Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-20">
                    <span className="sr-only">Watch</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reports.map((report, index) => {
                  const tier = getTierFromScore(report.quality_score);
                  const watched = isWatched(report.name);

                  return (
                    <tr
                      key={report.name}
                      className="hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {index + 1}
                      </td>
                      <td
                        className="px-4 py-4 whitespace-nowrap cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <span className="font-medium text-white hover:text-blue-400 transition-colors">
                          {report.name}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(
                            report.language
                          )} text-white`}
                        >
                          {getLanguageLabel(report.language)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                        {report.stars?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                        {report.watchers?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeClass(
                            tier
                          )}`}
                        >
                          {tier}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {report.scan_method || 'unknown'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(report.scan_date)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleWatch(report.name)}
                          className={`text-xl transition-colors ${
                            watched
                              ? 'text-yellow-400'
                              : 'text-gray-500 hover:text-yellow-300'
                          }`}
                          title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                          aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                        >
                          {watched ? '★' : '☆'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={selectedReport?.name || 'Report Details'}
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Language</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.language || 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quality Score</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.quality_score ?? 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stars</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.stars?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Watchers</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.watchers?.toLocaleString() ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dependencies</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.dependency_count ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Files</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.file_count ?? 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Scan Method</p>
                <p className="font-medium text-gray-900">
                  {selectedReport.scan_method || 'unknown'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Scan Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(selectedReport.scan_date)}
                </p>
              </div>
            </div>
            {selectedReport.repo_url && (
              <a
                href={selectedReport.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                View on GitHub
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
