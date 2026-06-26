import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getDashboardStats, searchPackages } from '../services/api';
import { TierBarChart, LanguageDonutChart } from '../components/Charts';
import { SkeletonCard, SkeletonStat } from '../components/Skeleton';
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

export default function Dashboard() {
  useDocumentTitle('Dashboard — Atheon Scanner');

  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIdx, setActiveSearchIdx] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load dashboard data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
        setReports(data.recentScans || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      setActiveSearchIdx(-1);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPackages(searchQuery);
        setSearchResults(results);
        setSearchOpen(true);
        setActiveSearchIdx(-1);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Click outside to close search
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = useCallback((e) => {
    if (!searchOpen || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIdx((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIdx((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSearchIdx >= 0 && activeSearchIdx < searchResults.length) {
        const selected = searchResults[activeSearchIdx];
        navigate(`/reports?q=${encodeURIComponent(selected.name)}`);
        setSearchQuery('');
        setSearchOpen(false);
      } else if (searchResults.length > 0) {
        navigate(`/reports?q=${encodeURIComponent(searchResults[0].name)}`);
        setSearchQuery('');
        setSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setActiveSearchIdx(-1);
    }
  }, [searchOpen, searchResults, activeSearchIdx, navigate]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (result) => {
    navigate(`/reports?q=${encodeURIComponent(result.name)}`);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const topLanguage = stats?.languageCounts?.[0]?.language || 'N/A';

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your package analysis</p>
        </div>

        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              data-search
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => {
                if (searchResults.length > 0) setSearchOpen(true);
              }}
              placeholder="Search packages..."
              className="w-64 px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search packages"
              aria-expanded={searchOpen}
              aria-controls="search-results"
              aria-activedescendant={
                activeSearchIdx >= 0
                  ? `search-result-${activeSearchIdx}`
                  : undefined
              }
              role="combobox"
              aria-autocomplete="list"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <ul
              id="search-results"
              role="listbox"
              className="absolute z-50 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
            >
              {searchResults.map((result, idx) => (
                <li
                  key={result.name}
                  id={`search-result-${idx}`}
                  role="option"
                  aria-selected={idx === activeSearchIdx}
                  onClick={() => handleResultClick(result)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    idx === activeSearchIdx
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-100 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-gray-400">
                    {result.language} • {result.stars?.toLocaleString()} stars
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-6">
              <SkeletonStat />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Packages Analyzed</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats?.totalScans?.toLocaleString() ?? 0}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Average Quality Score</p>
            <p className="text-3xl font-bold text-white mt-2">
              {(stats?.avgScore ?? 0).toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Scans</p>
            <p className="text-3xl font-bold text-white mt-2">
              {stats?.totalPackages?.toLocaleString() ?? 0}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Top Language</p>
            <p className="text-3xl font-bold text-white mt-2">{topLanguage}</p>
          </div>
        </div>
      )}

      {/* Recent Scans Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Recent Scans</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6">
              <SkeletonCard className="h-12 w-full mb-3" />
              <SkeletonCard className="h-12 w-full mb-3" />
              <SkeletonCard className="h-12 w-full mb-3" />
              <SkeletonCard className="h-12 w-full" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No scans yet. Submit a package to get started.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Stars
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Scan Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {reports.map((report) => {
                  const tier = getTierFromScore(report.quality_score);
                  return (
                    <tr
                      key={report.name}
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-white">{report.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                          {report.language || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeClass(
                            tier
                          )}`}
                        >
                          {tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {report.stars?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                        {formatDate(report.scan_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Tier Distribution */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Quality Tier Distribution
          </h2>
          {loading ? (
            <SkeletonCard className="h-48 w-full" />
          ) : stats?.tierDistribution ? (
            <TierBarChart data={stats.tierDistribution} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No tier data available
            </div>
          )}
        </div>

        {/* Language Distribution */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Language Distribution
          </h2>
          {loading ? (
            <SkeletonCard className="h-48 w-full" />
          ) : stats?.languageCounts ? (
            <LanguageDonutChart data={stats.languageCounts} />
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              No language data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/submit')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Submit New Analysis
        </button>
        <button
          onClick={() => navigate('/reports')}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors border border-gray-700"
        >
          Browse Reports
        </button>
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
