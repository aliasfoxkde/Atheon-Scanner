import React, { useState, useEffect } from 'react';

export default function Trending() {
  const [trendingRepos, setTrendingRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: '',
    since: 'weekly',
    limit: 20
  });

  useEffect(() => {
    fetchTrendingRepos();
  }, [filters]);

  const fetchTrendingRepos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/trending?${params}`);
      const data = await response.json();
      setTrendingRepos(data.repositories || []);
    } catch (error) {
      console.error('Failed to fetch trending repos:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestScan = async (repoFullName) => {
    try {
      const response = await fetch('/api/scan-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repoFullName })
      });

      if (response.ok) {
        alert(`Scan requested for ${repoFullName}`);
      }
    } catch (error) {
      console.error('Failed to request scan:', error);
    }
  };

  const addToWatchlist = async (repoFullName) => {
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: repoFullName })
      });

      if (response.ok) {
        alert(`Added ${repoFullName} to watchlist`);
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Trending Repositories</h1>
        <p className="text-gray-400">
          Discover and monitor trending repositories across programming languages
        </p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => setFilters({ ...filters, language: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="">All Languages</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="java">Java</option>
              <option value="c++">C++</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={filters.since}
              onChange={(e) => setFilters({ ...filters, since: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            >
              <option value="10">10 results</option>
              <option value="20">20 results</option>
              <option value="50">50 results</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trending Repositories */}
      <div className="space-y-4">
        {trendingRepos.map((repo, index) => (
          <div key={repo.id} className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                  <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    repo.language === 'TypeScript' ? 'bg-blue-600 text-white' :
                    repo.language === 'JavaScript' ? 'bg-yellow-600 text-white' :
                    repo.language === 'Python' ? 'bg-green-600 text-white' :
                    repo.language === 'Go' ? 'bg-cyan-600 text-white' :
                    repo.language === 'Rust' ? 'bg-orange-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {repo.language}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{repo.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    {repo.stars?.toLocaleString()} stars
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 0011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    {repo.forks?.toLocaleString()} forks
                  </span>
                  {repo.today_stars && (
                    <span className="flex items-center text-green-400">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                      </svg>
                      {repo.today_stars} today
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                <button
                  onClick={() => requestScan(repo.full_name)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Request Scan
                </button>
                <button
                  onClick={() => addToWatchlist(repo.full_name)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                >
                  Watch
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trendingRepos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p>No trending repositories found for the selected filters</p>
        </div>
      )}
    </div>
  );
}