import { useState, useEffect } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getPipelineData } from '../services/api';
import { SkeletonTable } from '../components/Skeleton';

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

export default function Pipeline() {
  useDocumentTitle('Pipeline — Atheon Scanner');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('runs');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const result = await getPipelineData();
        setData(result);
      } catch (err) {
        console.error('Failed to load pipeline data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const tabs = [
    { id: 'runs', label: 'Runs' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'benchmarks', label: 'Benchmarks' },
    { id: 'methods', label: 'Scan Methods' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Pipeline</h1>
        <p className="text-gray-400 mt-1">Derived scan pipeline data</p>
      </div>

      {/* Source Badge */}
      <div className="inline-flex items-center px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-400">
        <span className="mr-2">Source:</span>
        <code className="text-blue-400">{data?.source || 'loading...'}</code>
      </div>

      {/* Pipeline Overview */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-3">Pipeline Overview</h2>
        <p className="text-gray-400">
          This page shows derived pipeline data based on your stored scan results.
          All metrics are computed from previously scanned repositories — no new
          scans are performed.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="flex gap-1" aria-label="Pipeline tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-600'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <SkeletonTable rows={5} cols={4} />
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {/* Runs Tab */}
          {activeTab === 'runs' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Scan Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Scan Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data?.runs?.length > 0 ? (
                    data.runs.map((run, index) => (
                      <tr key={`${run.scan_method}-${run.scan_date}-${index}`} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {run.scan_method || 'unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {formatDate(run.scan_date)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-gray-400">
                        No run data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Patterns Tab */}
          {activeTab === 'patterns' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Scan Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data?.patterns?.length > 0 ? (
                    data.patterns.map((pattern, index) => (
                      <tr key={`${pattern.scan_method}-${index}`} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {pattern.scan_method || 'unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {pattern.count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center text-gray-400">
                        No pattern data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Benchmarks Tab */}
          {activeTab === 'benchmarks' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Scan Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Min
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Max
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {data?.benchmarks?.length > 0 ? (
                    data.benchmarks.map((bench, index) => (
                      <tr key={`${bench.scan_method}-${index}`} className="hover:bg-gray-800 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {bench.scan_method || 'unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {bench.avgScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {bench.min}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {bench.max}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                          {bench.count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        No benchmark data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Scan Methods Tab */}
          {activeTab === 'methods' && (
            <div className="p-6">
              {data?.benchmarks?.length > 0 ? (
                <div className="space-y-6">
                  {data.benchmarks.map((bench) => (
                    <div
                      key={bench.scan_method}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <h3 className="text-lg font-semibold text-white mb-3">
                        {bench.scan_method || 'unknown'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Total Scans</p>
                          <p className="text-xl font-bold text-white">{bench.count}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Avg Score</p>
                          <p className="text-xl font-bold text-white">{bench.avgScore}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Min Score</p>
                          <p className="text-xl font-bold text-gray-300">{bench.min}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Max Score</p>
                          <p className="text-xl font-bold text-gray-300">{bench.max}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  No scan method data available
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
