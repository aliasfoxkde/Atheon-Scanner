import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { mockStats, simulateApiCall } from '../services/mockData';

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
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API
        const response = await apiService.getStats();

        if (response.success) {
          const data = response.data;
          setStats({
            totalRepos: data.total_repositories || 0,
            avgQualityScore: data.average_quality_score || 0,
            totalScans: data.total_scans || 0,
            criticalIssues: data.tier_distribution?.critical || 0,
            tierDistribution: data.tier_distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 },
            recentScans: data.recent_scans || [],
            topLanguages: data.top_languages || [],
            securityStats: {
              totalFindings: data.security_stats?.total_findings || 0,
              critical: data.security_stats?.critical || 0,
              high: data.security_stats?.high || 0,
              medium: data.security_stats?.medium || 0,
              low: data.security_stats?.low || 0
            }
          });
        } else {
          throw new Error(response.error);
        }
      } catch (err) {
        console.log('Using mock data:', err.message);
        // Fallback to mock data
        const mockResponse = await simulateApiCall(mockStats);
        const data = mockResponse.data;

        setStats({
          totalRepos: data.total_repositories,
          avgQualityScore: data.average_quality_score,
          totalScans: data.total_scans,
          criticalIssues: data.security_stats?.critical || 0,
          tierDistribution: data.tier_distribution,
          recentScans: data.recent_scans.map(scan => ({
            id: scan.id,
            repoName: scan.repo_name,
            language: scan.language,
            stars: scan.stars,
            qualityScore: scan.quality_score,
            tier: scan.tier,
            scanDate: scan.scan_date
          })),
          topLanguages: data.top_languages,
          securityStats: data.security_stats
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400 text-sm sm:text-base">Overview of code security and quality analysis</p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Repositories */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-gray-400">Repositories</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.totalRepos}</p>
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
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.avgQualityScore.toFixed(1)}</p>
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
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.totalScans}</p>
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
                      <p className="text-xs sm:text-sm text-gray-400">{scan.language} • {(scan.stars / 1000).toFixed(0)}k stars</p>
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
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Security Overview</h2>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {[
              { label: 'Critical', count: stats.securityStats.critical, color: 'red', percentage: (stats.securityStats.critical / stats.securityStats.totalFindings * 100).toFixed(1) },
              { label: 'High', count: stats.securityStats.high, color: 'orange', percentage: (stats.securityStats.high / stats.securityStats.totalFindings * 100).toFixed(1) },
              { label: 'Medium', count: stats.securityStats.medium, color: 'yellow', percentage: (stats.securityStats.medium / stats.securityStats.totalFindings * 100).toFixed(1) },
              { label: 'Low', count: stats.securityStats.low, color: 'blue', percentage: (stats.securityStats.low / stats.securityStats.totalFindings * 100).toFixed(1) },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <span className="text-sm font-medium text-gray-300">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-${item.color}-500 h-2 rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Findings</span>
                <span className="text-lg font-semibold text-white">{stats.securityStats.totalFindings}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Quality Tier Distribution</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-5 gap-2 sm:gap-4">
            {['A', 'B', 'C', 'D', 'F'].map((tier) => (
              <div key={tier} className="text-center">
                <div className={`w-full aspect-square rounded-lg flex items-center justify-center ${getTierBgColor(tier)}`}>
                  <span className="text-2xl sm:text-3xl font-bold text-white">{stats.tierDistribution[tier]}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-gray-300">Tier {tier}</p>
                <p className="text-xs text-gray-400">{((stats.tierDistribution[tier] / stats.totalRepos) * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Languages */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
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
                  <span className="text-xs sm:text-sm text-gray-400">{lang.count} repos</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

function getTierBgColor(tier) {
  switch (tier) {
    case 'A': return 'bg-green-500';
    case 'B': return 'bg-blue-500';
    case 'C': return 'bg-yellow-500';
    case 'D': return 'bg-orange-500';
    default: return 'bg-red-500';
  }
}

export default Dashboard;