import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getReports } from '../services/api';
import { LANGUAGES, getLanguageColor, getLanguageLabel } from '../utils/scanCategories';
import { SkeletonCard } from '../components/Skeleton';
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

function safeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

const SORT_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'language', label: 'Language' },
  { id: 'quality_score', label: 'Score' },
  { id: 'stars', label: 'Stars' },
  { id: 'dependency_count', label: 'Dependencies' },
  { id: 'file_count', label: 'Files' },
];

const DEFAULT_PAGE_SIZE = 25;

export default function Reports() {
  useDocumentTitle('Reports — Atheon Scanner');

  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState('');
  const [sort, setSort] = useState('stars');
  const [order, setOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(new Set());
  const [bookmarkFilter, setBookmarkFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bookmarks');
      if (stored) {
        setBookmarks(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bookmarks', JSON.stringify([...bookmarks]));
    } catch {
      // ignore storage errors
    }
  }, [bookmarks]);

  // Read URL params on mount
  useEffect(() => {
    const q = searchParams.get('q');
    const lang = searchParams.get('language');
    if (q) setSearch(q);
    if (lang) setLanguage(lang);
  }, [searchParams]);

  // Fetch reports
  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await getReports({
          search,
          language,
          sort,
          order,
          page,
          pageSize,
        });
        setReports(data.reports);
        setTotal(data.total);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [search, language, sort, order, page, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  const toggleBookmark = useCallback((name) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const toggleSelect = useCallback((name) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setLanguage('');
    setSort('stars');
    setOrder('desc');
    setPage(1);
    setBookmarkFilter('all');
    setSearchParams({});
  }, [setSearchParams]);

  const handleSortChange = (newSort) => {
    if (newSort === sort) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(newSort);
      setOrder('desc');
    }
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setPage(1);
  };

  const handleBookmarkFilterChange = (filter) => {
    setBookmarkFilter(filter);
    setPage(1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  // Client-side filtering for bookmarks
  const filteredReports = useMemo(() => {
    if (bookmarkFilter === 'bookmarked') {
      return reports.filter((r) => bookmarks.has(r.name));
    }
    return reports;
  }, [reports, bookmarkFilter, bookmarks]);

  const hasActiveFilters = search || language || bookmarkFilter !== 'all';

  const exportPageCsv = () => {
    const headers = ['Name', 'Language', 'Score', 'Tier', 'Stars', 'Dependencies', 'Files', 'Scan Method', 'Scan Date'];
    const rows = filteredReports.map((r) => [
      safeCsvCell(r.name),
      safeCsvCell(r.language),
      safeCsvCell(r.quality_score),
      safeCsvCell(getTierFromScore(r.quality_score)),
      safeCsvCell(r.stars),
      safeCsvCell(r.dependency_count),
      safeCsvCell(r.file_count),
      safeCsvCell(r.scan_method),
      safeCsvCell(r.scan_date),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPageJson = () => {
    const jsonContent = JSON.stringify(filteredReports, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-page-${page}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSortIndicator = (colSort) => {
    if (sort !== colSort) return null;
    return order === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-gray-400 mt-1">
            {total.toLocaleString()} total reports
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              id="reports-search"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Language Filter */}
          <div className="min-w-[150px]">
            <select
              id="reports-language"
              value={language}
              onChange={handleLanguageChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-[150px]">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors text-sm"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Bookmark Filter & Compare Bar */}
        <div className="flex gap-4 items-center">
          {/* Bookmark Filter */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={() => handleBookmarkFilterChange('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                bookmarkFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleBookmarkFilterChange('bookmarked')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                bookmarkFilter === 'bookmarked'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Bookmarked
            </button>
          </div>

          {/* Export Buttons */}
          <button
            onClick={exportPageCsv}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-lg transition-colors border border-gray-700 text-sm"
          >
            Page CSV
          </button>
          <button
            onClick={exportPageJson}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-medium rounded-lg transition-colors border border-gray-700 text-sm"
          >
            Page JSON
          </button>

          {/* Compare Bar */}
          {selectedIds.size >= 2 && (
            <div className="flex gap-2 items-center ml-auto">
              <span className="text-sm text-gray-400">
                Compare ({selectedIds.size})
              </span>
              <button
                onClick={() => {
                  // Navigate to compare - would need a compare page
                  alert('Compare: ' + [...selectedIds].join(', '));
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Compare
              </button>
              <button
                onClick={clearSelection}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear selection"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No reports found
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-10">
                    <span className="sr-only">Compare</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-10">
                    <span className="sr-only">Bookmark</span>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSortChange('name')}
                  >
                    Name{getSortIndicator('name')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSortChange('language')}
                  >
                    Language{getSortIndicator('language')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Tier
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSortChange('quality_score')}
                  >
                    Score{getSortIndicator('quality_score')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSortChange('stars')}
                  >
                    Stars{getSortIndicator('stars')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSortChange('dependency_count')}
                  >
                    Deps{getSortIndicator('dependency_count')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSortChange('file_count')}
                  >
                    Files{getSortIndicator('file_count')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSortChange('scan_date')}
                  >
                    Scan Date{getSortIndicator('scan_date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredReports.map((report) => {
                  const tier = getTierFromScore(report.quality_score);
                  const isBookmarked = bookmarks.has(report.name);
                  const isSelected = selectedIds.has(report.name);

                  return (
                    <tr
                      key={report.name}
                      className={`hover:bg-gray-800 transition-colors ${
                        isSelected ? 'bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(report.name)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(report.name);
                          }}
                          className={`transition-colors ${
                            isBookmarked
                              ? 'text-yellow-400'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill={isBookmarked ? 'currentColor' : 'none'}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
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
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierBadgeClass(
                            tier
                          )}`}
                        >
                          {tier}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                        {report.quality_score ?? 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                        {report.stars?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                        {report.dependency_count ?? 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-300">
                        {report.file_count ?? 0}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-400 text-sm">
                        {report.scan_method || 'unknown'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-gray-400">
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">
          Page {page} of {totalPages || 1}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors border border-gray-700"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors border border-gray-700"
          >
            Next
          </button>
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
