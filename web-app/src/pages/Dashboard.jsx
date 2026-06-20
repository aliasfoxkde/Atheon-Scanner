import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { loadRealScannerData, checkApiHealth, getApiConfig } from '../services/realScannerData';
import SpiderChart from '../components/Charts';
import { BarChart, DonutChart } from '../components/Charts';
import SecurityRadarChart from '../components/SecurityRadarChart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRepos: 0,
    avgQualityScore: 0,
    totalScans: 0,
    criticalIssues: 0,
    tierDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
    recentScans: [],
    topLanguages: [],
    securityStats: {
      totalFindings: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    },
    apiStatus: 'unknown',
    dataSource: 'unknown'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Loading real scanner data...');

        // Load REAL scanner data
        const response = await loadRealScannerData();

        console.log('📊 API Response:', response);

        if (response) {
          // Handle both direct data response and wrapped response
          const data = response.data || response;

          setStats({
            totalRepos: data.total_repositories || data.total_packages || 0,
            avgQualityScore: data.average_quality_score || 0,
            totalScans: data.total_scans || data.total_packages || 0,
            criticalIssues: data.tier_distribution?.F || data.security_stats?.critical || 0,
            tierDistribution: data.tier_distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 },
            recentScans: (data.recent_scans || []).slice(0, 10).map(scan => ({
              id: scan.id || scan.scan_id,
              repoName: scan.repo_name || scan.name || 'Unknown',
              language: scan.language || 'Unknown',
              stars: scan.stars || 0,
              qualityScore: scan.quality_score || 0,
              tier: scan.tier || 'A',
              scanDate: scan.scan_date,
              scanMethod: scan.scan_method || 'unknown',
              totalDependencies: scan.total_dependencies || 0,
              totalFiles: scan.total_files || 0
            })),
            topLanguages: (data.top_languages || []).map(lang => ({
              language: lang.language,
              count: lang.count,
              avgScore: lang.avgScore
            })),
            securityStats: {
              totalFindings: data.security_stats?.total_findings || 0,
              critical: data.security_stats?.critical || 0,
              high: data.security_stats?.high || 0,
              medium: data.security_stats?.medium || 0,
              low: data.security_stats?.low || 0
            },
            apiStatus: 'healthy',
            dataSource: data.data_source || 'unknown',
            dataFilesCount: data.data_files_count || 0,
            lastUpdated: data.last_updated || new Date().toISOString()
          });

          console.log('✅ Stats loaded successfully:', {
            repos: data.total_repositories || data.total_packages,
            quality: data.average_quality_score,
            source: data.data_source
          });
        } else {
          throw new Error('No data received from API');
        }
      } catch (err) {
        console.error('❌ Error loading real scanner data:', err);
        setError(err.message);
        setStats(prev => ({ ...prev, apiStatus: 'error', dataSource: 'error' }));
      } finally {
        setLoading(false);
      }
    };

    const checkHealth = async () => {
      try {
        const health = await checkApiHealth();
        console.log('🏥 API Health:', health);
        if (health.status === 'healthy') {
          setStats(prev => ({
            ...prev,
            apiStatus: 'healthy',
            dataSource: health.total_records > 0 ? 'real_data' : 'no_data',
            dataFilesCount: health.data_files_found || 0
          }));
        }
      } catch (err) {
        console.warn('⚠️ API health check failed:', err);
        setStats(prev => ({ ...prev, apiStatus: 'unavailable', dataSource: 'fallback' }));
      }
    };

    // Initial load
    fetchStats();
    checkHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing data...');
      fetchStats();
      checkHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Force refresh
      const response = await fetch(`${getApiConfig().baseUrl}/api/refresh`, { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        // Reload the page data
        const data = result.data;
        setStats({
          totalRepos: data.total_repositories || data.total_packages || 0,
          avgQualityScore: data.average_quality_score || 0,
          totalScans: data.total_scans || data.total_packages || 0,
          criticalIssues: data.tier_distribution?.F || 0,
          tierDistribution: data.tier_distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 },
          recentScans: (data.recent_scans || []).slice(0, 10),
          topLanguages: data.top_languages || [],
          securityStats: data.security_stats || {},
          apiStatus: 'healthy',
          dataSource: data.data_source || 'refreshed',
          dataFilesCount: data.data_files_count || 0,
          lastUpdated: data.last_updated || new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('❌ Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleDownloadReport = () => {
    const reportData = {
      title: 'Atheon GitHub Scanner - Dashboard Report',
      generatedAt: new Date().toISOString(),
      statistics: {
        totalRepositories: stats.totalRepos,
        totalPackages: stats.totalScans,
        averageQualityScore: stats.avgQualityScore,
        criticalIssues: stats.criticalIssues,
        dataSource: stats.dataSource,
        apiStatus: stats.apiStatus,
        dataFilesCount: stats.dataFilesCount
      },
      tierDistribution: stats.tierDistribution,
      recentScans: stats.recentScans,
      topLanguages: stats.topLanguages,
      securityStats: stats.securityStats
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atheon-scanner-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Atheon GitHub Scanner Dashboard',
          text: `Atheon GitHub Scanner: ${stats.totalRepos} packages analyzed with ${stats.avgQualityScore.toFixed(1)} average quality score.`,
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare(url);
      }
    } else {
      fallbackShare(url);
    }
  };

  const fallbackShare = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('Dashboard URL copied to clipboard!');
    }).catch(() => {
      window.open(url, '_blank');
    });
  };

  const getApiStatusColor = () => {
    switch (stats.apiStatus) {
      case 'healthy': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'unavailable': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getApiStatusText = () => {
    switch (stats.apiStatus) {
      case 'healthy': return 'API Connected';
      case 'error': return 'API Error';
      case 'unavailable': return 'API Unavailable';
      default: return 'Checking...';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Real-time analysis of {stats.totalRepos}+ packages
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* API Status Indicator */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700`}>
            <div className={`w-2 h-2 rounded-full ${getApiStatusColor()}`}></div>
            <span className={`text-xs sm:text-sm ${getApiStatusColor()}`}>{getApiStatusText()}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Refresh data"
          >
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownloadReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
            aria-label="Download report"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download Report</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
            aria-label="Share dashboard"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">Loading real scanner data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-white font-semibold">Error Loading Data</h3>
              <p className="text-gray-400 text-sm">{error}</p>
              <p className="text-gray-500 text-xs mt-1">
                API Status: {stats.apiStatus} | Data Source: {stats.dataSource}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Data Source Info */}
          {stats.lastUpdated && (
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">
                  Data Source: <span className="text-white font-medium">{stats.dataSource}</span>
                </span>
                <span className="text-gray-400 text-sm">
                  Files: <span className="text-white font-medium">{stats.dataFilesCount}</span>
                </span>
                <span className="text-gray-400 text-sm">
                  Updated: <span className="text-white font-medium">{formatDate(stats.lastUpdated)}</span>
                </span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Repositories */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-400">Packages Analyzed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.totalRepos.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Average Quality Score */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-400">Avg Score</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    {stats.avgQualityScore ? stats.avgQualityScore.toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Scans */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-400">Total Scans</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.totalScans.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Critical Issues */}
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-400">Critical</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.criticalIssues}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Scans */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Recent Scans</h2>
                <Link to="/reports" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
              </div>
              <div className="p-4 sm:p-6">
                {stats.recentScans.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No recent scans found</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentScans.map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-900 rounded-lg hover:bg-gray-700 transition-colors">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm sm:text-base truncate">{scan.repoName}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs sm:text-sm text-gray-400">{scan.language}</span>
                            {scan.stars > 0 && (
                              <span className="text-xs text-gray-500">
                                {scan.stars >= 1000 ? `${(scan.stars / 1000).toFixed(1)}k stars` : `${scan.stars} stars`}
                              </span>
                            )}
                            {scan.totalDependencies > 0 && (
                              <span className="text-xs text-gray-500">
                                {scan.totalDependencies} deps
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
                          <div className="text-right">
                            <p className="text-xs text-gray-400 hidden sm:block">Score</p>
                            <p className={`text-base sm:text-lg font-bold ${getScoreColor(scan.qualityScore)}`}>
                              {scan.qualityScore}
                            </p>
                          </div>
                          <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getTierColor(scan.tier)}`}>
                            {scan.tier}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Security Overview */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-red-500/30 transition-all duration-300">
              <div className="p-4 sm:p-6 border-b border-gray-700">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Security Findings</h2>
              </div>
              <div className="p-4 sm:p-6">
                <SecurityRadarChart
                  securityData={stats.securityStats}
                  totalRepos={stats.totalRepos}
                  size={400}
                />
              </div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-purple-500/30 transition-all">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Quality Tier Distribution</h2>
            </div>
            <div className="p-4 sm:p-6">
              <BarChart data={stats.tierDistribution} title="Packages by Quality Tier" />
            </div>
          </div>

          {/* Top Languages */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-yellow-500/30 transition-all">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Top Programming Languages</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {stats.topLanguages.map((lang, index) => (
                  <div key={lang.language} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-500">#{index + 1}</span>
                      <span className="text-sm sm:text-base text-white font-medium">{lang.language}</span>
                      <span className="text-xs sm:text-sm text-gray-400">{lang.count.toLocaleString()} pkgs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 sm:w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(lang.count / stats.topLanguages[0].count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-400 w-16 text-right">Avg: {lang.avgScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Submit New Analysis</span>
            </Link>
            <Link to="/reports" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Browse Reports</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

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

export default Dashboard;