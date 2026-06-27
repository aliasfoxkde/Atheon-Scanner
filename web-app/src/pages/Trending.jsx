import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadRealScannerData } from '../services/realScannerData';
import { Skeleton } from '../components/Skeleton';
import { useToast } from '../contexts/ToastContext';

const LANG_BADGE = {
  JavaScript: 'bg-yellow-700 text-white',
  TypeScript: 'bg-blue-700 text-white',
  Python: 'bg-green-700 text-white',
  Go: 'bg-cyan-700 text-white',
  Rust: 'bg-orange-700 text-white',
  Java: 'bg-red-700 text-white',
  'C++': 'bg-pink-700 text-white',
  Ruby: 'bg-rose-700 text-white',
  PHP: 'bg-indigo-700 text-white',
};

// Compute a real trending score: quality-adjusted star popularity
// Higher = more noteworthy: stars * quality_ratio * tier_bonus
const TIER_BONUS = { A: 1.2, B: 1.0, C: 0.85, D: 0.7, F: 0.6 };
function trendingScore(repo) {
  const stars = repo.stars || 0;
  const quality = (repo.quality_score || 0) / 100;
  const tier = TIER_BONUS[repo.tier] ?? 1.0;
  return stars * quality * tier;
}
const WATCHLIST_KEY = 'atheon_watchlist';

export default function Trending() {
  const [allRepos, setAllRepos] = useState([]);
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ language: '', since: 'all', limit: 20 });
  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [watchlistExpanded, setWatchlistExpanded] = useState(true);
  const toast = useToast();
  const hasActiveFilters = filters.language !== '' || filters.since !== 'all';

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await loadRealScannerData();
        if (!mounted) return;
        // Use the pre-built trending array if available, else derive from recent_scans
        const trending =
          data.trending && data.trending.length > 0
            ? data.trending
            : (data.recent_scans || []).map((s) => ({ ...s, id: s.id || s.name }));
        setAllRepos(data.recent_scans || []);
        setTrendingData(trending);
      } catch (err) {
        if (err.name === 'AbortError') return;
        toast.error('Failed to load trending data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    // trendingData has pre-built scores but may lack scan_date; allRepos always has scan_date.
    // Time filter requires scan_date, so use allRepos when filtering by time.
    const useTrending = trendingData.length > 0 && filters.since === 'all';
    let list = [...(useTrending ? trendingData : allRepos)];

    if (filters.language) list = list.filter((r) => r.language === filters.language);

    // Filter by time period based on scan_date
    if (filters.since !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (filters.since === 'daily') cutoff.setDate(now.getDate() - 1);
      else if (filters.since === 'weekly') cutoff.setDate(now.getDate() - 7);
      else if (filters.since === 'monthly') cutoff.setMonth(now.getMonth() - 1);

      list = list.filter((r) => {
        if (!r.scan_date) return false;
        const scanDate = new Date(r.scan_date);
        return !isNaN(scanDate.getTime()) && scanDate >= cutoff;
      });
    }

    // Score by quality-adjusted popularity
    list.sort((a, b) => trendingScore(b) - trendingScore(a));
    return list.slice(0, filters.limit);
  }, [allRepos, trendingData, filters]);

  const languages = useMemo(() => {
    const set = new Set(allRepos.map((r) => r.language).filter(Boolean));
    return Array.from(set).sort();
  }, [allRepos]);

  const toggleWatchlist = (name) => {
    const isCurrentlyInWatchlist = watchlist.includes(name);
    const next = isCurrentlyInWatchlist
      ? watchlist.filter((n) => n !== name)
      : [...watchlist, name];
    setWatchlist(next);
    try {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
    } catch {}
    if (isCurrentlyInWatchlist) {
      toast.info(`Removed ${name} from watchlist`);
    } else {
      toast.success(`Added ${name} to watchlist`);
    }
  };

  // Import watchlist from JSON file
  const handleImportWatchlist = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let ids = [];
        try {
          ids = JSON.parse(text);
        } catch {
          const lines = text.trim().split('\n');
          ids = lines
            .map((l) =>
              l
                .split(',')[0]
                .trim()
                .replace(/^["']|["']$/g, '')
            )
            .filter(Boolean);
        }
        if (!Array.isArray(ids)) throw new Error('Not an array');
        setWatchlist((prev) => {
          const next = [...new Set([...prev, ...ids])];
          try {
            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
        toast.success(`Imported ${ids.length} watchlist item(s)`);
      } catch {
        toast.error('Failed to import watchlist — invalid format');
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  // Top watched repos: matched from allRepos against watchlist IDs
  const watchedRepos = useMemo(() => {
    if (watchlist.length === 0) return [];
    return allRepos.filter((r) => watchlist.includes(r.name)).slice(0, 5);
  }, [allRepos, watchlist]);

  const watchlistOverflow = watchlist.length > 5 ? watchlist.length - 5 : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Trending Repositories</h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Quality-adjusted ranking · {allRepos.length.toLocaleString()} scanned packages
        </p>
      </div>

      {watchedRepos.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <button
            onClick={() => setWatchlistExpanded((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <h2 className="text-lg font-semibold text-white">Top Watched</h2>
            <div className="flex items-center gap-2">
              {watchlistOverflow > 0 && (
                <span className="text-sm text-gray-400">and {watchlistOverflow} more</span>
              )}
              <label
                className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                Import
                <input
                  type="file"
                  accept=".json,.csv,.txt"
                  className="hidden"
                  onChange={handleImportWatchlist}
                  aria-label="Import watchlist from file"
                />
              </label>
              <span className="text-gray-400">{watchlistExpanded ? '▲' : '▼'}</span>
            </div>
          </button>
          {watchlistExpanded && (
            <div className="mt-3 space-y-2">
              {watchedRepos.map((repo) => (
                <div
                  key={repo.name}
                  className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${LANG_BADGE[repo.language] || 'bg-gray-600 text-white'}`}
                    >
                      {repo.language}
                    </span>
                    <span className="text-sm text-white font-medium truncate">{repo.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        repo.tier === 'A'
                          ? 'bg-green-700 text-white'
                          : repo.tier === 'B'
                            ? 'bg-blue-700 text-white'
                            : repo.tier === 'C'
                              ? 'bg-yellow-700 text-white'
                              : repo.tier === 'D'
                                ? 'bg-orange-700 text-white'
                                : 'bg-red-700 text-white'
                      }`}
                    >
                      Tier {repo.tier}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleWatchlist(repo.name)}
                    className="ml-2 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Remove from watchlist"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="trending-language"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Language
            </label>
            <select
              id="trending-language"
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All languages</option>
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="trending-since"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Time period
            </label>
            <select
              id="trending-since"
              value={filters.since}
              onChange={(e) => setFilters({ ...filters, since: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="all">All time</option>
              <option value="daily">Last 24h</option>
              <option value="weekly">Last 7 days</option>
              <option value="monthly">Last 30 days</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="trending-limit"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Limit
            </label>
            <select
              id="trending-limit"
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="10">10 results</option>
              <option value="20">20 results</option>
              <option value="50">50 results</option>
            </select>
          </div>
          <div className="flex items-end">
            <Link
              to={`/reports${filters.language ? `?language=${encodeURIComponent(filters.language)}` : ''}`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm whitespace-nowrap"
            >
              View all in Reports
            </Link>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400 border border-gray-700">
          <p className="mb-2">
            {allRepos.length === 0
              ? 'No trending data available yet.'
              : 'No repositories match the selected filters.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ language: '', since: 'all', limit: 20 })}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 border-b border-gray-700">
                <th className="px-3 py-2 text-left text-gray-400 font-medium text-xs w-8">#</th>
                <th className="px-3 py-2 text-left text-gray-400 font-medium text-xs">
                  Repository
                </th>
                <th className="px-3 py-2 text-left text-gray-400 font-medium text-xs">Lang</th>
                <th className="px-3 py-2 text-left text-gray-400 font-medium text-xs">Tier</th>
                <th className="px-3 py-2 text-right text-gray-400 font-medium text-xs">⭐ Stars</th>
                <th className="px-3 py-2 text-right text-gray-400 font-medium text-xs">Deps</th>
                <th className="px-3 py-2 text-right text-gray-400 font-medium text-xs">Score</th>
                <th className="px-3 py-2 text-right text-gray-400 font-medium text-xs">Trend</th>
                <th className="px-3 py-2 text-center text-gray-400 font-medium text-xs w-16">
                  Watch
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((repo, index) => (
                <tr
                  key={repo.id || repo.name}
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-3 py-2 text-gray-500 font-bold text-xs">#{index + 1}</td>
                  <td className="px-3 py-2">
                    <Link
                      to={`/reports?q=${encodeURIComponent(repo.name)}`}
                      className="text-white font-medium hover:text-blue-300 truncate max-w-xs block"
                    >
                      {repo.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${LANG_BADGE[repo.language] || 'bg-gray-600 text-white'}`}
                    >
                      {repo.language}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        repo.tier === 'A'
                          ? 'bg-green-700 text-white'
                          : repo.tier === 'B'
                            ? 'bg-blue-700 text-white'
                            : repo.tier === 'C'
                              ? 'bg-yellow-700 text-white'
                              : repo.tier === 'D'
                                ? 'bg-orange-700 text-white'
                                : 'bg-red-700 text-white'
                      }`}
                    >
                      {repo.tier}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-gray-300">
                    {repo.stars > 0
                      ? repo.stars >= 1000
                        ? `${(repo.stars / 1000).toFixed(1)}k`
                        : repo.stars
                      : '—'}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-300">
                    {repo.total_dependencies > 0 ? repo.total_dependencies : '—'}
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-white">
                    {repo.quality_score}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-400 text-xs">
                    {trendingScore(repo).toFixed(0)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => toggleWatchlist(repo.name)}
                      title={
                        watchlist.includes(repo.name) ? 'Remove from watchlist' : 'Add to watchlist'
                      }
                      className={`text-lg transition-colors ${
                        watchlist.includes(repo.name)
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-gray-600 hover:text-yellow-400'
                      }`}
                    >
                      {watchlist.includes(repo.name) ? '★' : '☆'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
