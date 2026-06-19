import React, { useState, useEffect } from 'react';

export default function Pipeline() {
  const [pipelineRuns, setPipelineRuns] = useState([]);
  const [patternSuggestions, setPatternSuggestions] = useState([]);
  const [benchmarkResults, setBenchmarkResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const fetchPipelineData = async () => {
    try {
      setLoading(true);

      // Fetch pipeline runs
      const runsResponse = await fetch('/api/pipeline/runs');
      const runsData = await runsResponse.json();
      setPipelineRuns(runsData.runs || []);

      // Fetch pattern suggestions
      const patternsResponse = await fetch('/api/pipeline/patterns');
      const patternsData = await patternsResponse.json();
      setPatternSuggestions(patternsData.patterns || []);

      // Fetch benchmark results
      const benchmarksResponse = await fetch('/api/pipeline/benchmarks');
      const benchmarksData = await benchmarksResponse.json();
      setBenchmarkResults(benchmarksData.results || []);

    } catch (error) {
      console.error('Failed to fetch pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualRun = async () => {
    try {
      const response = await fetch('/api/pipeline/trigger', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Pipeline run triggered successfully');
        fetchPipelineData();
      }
    } catch (error) {
      console.error('Failed to trigger pipeline:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Pipeline Dashboard</h1>
          <p className="text-gray-400">Automated scanning and pattern improvement pipeline</p>
        </div>
        <button
          onClick={triggerManualRun}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          Trigger Manual Run
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-green-500">{pipelineRuns.length}</div>
          <div className="text-sm text-gray-400">Total Pipeline Runs</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-blue-500">{patternSuggestions.length}</div>
          <div className="text-sm text-gray-400">Pattern Suggestions</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-purple-500">{benchmarkResults.length}</div>
          <div className="text-sm text-gray-400">Benchmarks Run</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-3xl font-bold text-yellow-500">
            {patternSuggestions.filter(p => p.validation_status === 'validated').length}
          </div>
          <div className="text-sm text-gray-400">Validated Patterns</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="border-b border-gray-700">
          <nav className="flex">
            {['overview', 'runs', 'patterns', 'benchmarks'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white">Pipeline Overview</h2>

              {pipelineRuns.length > 0 ? (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3">Latest Run</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Status</div>
                      <div className={`text-lg font-semibold ${
                        pipelineRuns[0].success ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {pipelineRuns[0].success ? 'Success' : 'Failed'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Repositories Scanned</div>
                      <div className="text-lg font-semibold text-white">
                        {pipelineRuns[0].repositories_scanned}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">New Findings</div>
                      <div className="text-lg font-semibold text-white">
                        {pipelineRuns[0].new_findings}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="text-lg font-semibold text-white">
                        {Math.floor(pipelineRuns[0].duration / 60)}m {pipelineRuns[0].duration % 60}s
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    Run ID: {pipelineRuns[0].run_id} •{' '}
                    {new Date(pipelineRuns[0].run_time).toLocaleString()}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No pipeline runs found</p>
              )}
            </div>
          )}

          {activeTab === 'runs' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Pipeline Runs</h2>
              {pipelineRuns.map((run) => (
                <div key={run.run_id} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          run.success ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {run.success ? 'Success' : 'Failed'}
                        </span>
                        <span className="text-white font-medium">{run.run_id}</span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {new Date(run.run_time).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Duration</div>
                      <div className="text-white font-medium">
                        {Math.floor(run.duration / 60)}m {run.duration % 60}s
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Repositories: </span>
                      <span className="text-white">{run.repositories_scanned}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">New Findings: </span>
                      <span className="text-white">{run.new_findings}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Updated Reports: </span>
                      <span className="text-white">{run.updated_reports}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Pattern Suggestions: </span>
                      <span className="text-white">{run.pattern_suggestions?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'patterns' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Pattern Suggestions</h2>
              {patternSuggestions.map((pattern) => (
                <div key={pattern.id} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{pattern.name}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          pattern.validation_status === 'validated' ? 'bg-green-600 text-white' :
                          pattern.validation_status === 'rejected' ? 'bg-red-600 text-white' :
                          'bg-yellow-600 text-white'
                        }`}>
                          {pattern.validation_status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{pattern.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Confidence</div>
                      <div className="text-lg font-semibold text-white">
                        {(pattern.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Category: </span>
                      <span className="text-white capitalize">{pattern.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Severity: </span>
                      <span className="text-white capitalize">{pattern.severity}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">CWE: </span>
                      <span className="text-white">{pattern.cwe || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">OWASP: </span>
                      <span className="text-white">{pattern.owasp || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-800 rounded font-mono text-sm text-gray-300">
                    {pattern.pattern}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'benchmarks' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Benchmark Results</h2>
              {benchmarkResults.map((benchmark) => (
                <div key={benchmark.pattern_id} className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{benchmark.pattern_id}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          benchmark.passed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {benchmark.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        benchmark.score >= 75 ? 'text-green-500' :
                        benchmark.score >= 50 ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {benchmark.score.toFixed(1)}/100
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Accuracy: </span>
                      <span className="text-white">{(benchmark.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">False Positives: </span>
                      <span className="text-white">{benchmark.false_positives}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">False Negatives: </span>
                      <span className="text-white">{benchmark.false_negatives}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Execution Time: </span>
                      <span className="text-white">{benchmark.execution_time_ms.toFixed(1)}ms</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}