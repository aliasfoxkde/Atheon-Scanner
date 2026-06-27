import { useMemo, useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const FILTER_OPTIONS = {
  category: ['all', 'injection', 'xss', 'auth', 'crypto', 'config'],
};

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reducedMotion;
}

export default function SecurityRadarChart({ securityData, totalRepos, size = 400 }) {
  const [activeFilters, setActiveFilters] = useState({ severity: 'all', category: 'all' });
  const reducedMotion = useReducedMotion();

  const rawAxes = [
    { key: 'dependencyVulns', label: 'Dependency Vulns', category: 'config' },
    { key: 'sqlInjection', label: 'SQL Injection', category: 'injection' },
    { key: 'codeInjection', label: 'Code Injection', category: 'injection' },
    { key: 'xss', label: 'XSS', category: 'xss' },
    { key: 'secrets', label: 'Secrets Leaked', category: 'auth' },
    { key: 'crypto', label: 'Crypto Issues', category: 'crypto' },
    { key: 'config', label: 'Config Issues', category: 'config' },
  ];

  const chartData = useMemo(() => {
    const repos = totalRepos || 1;
    const filtered = rawAxes.filter((axis) => {
      if (activeFilters.category !== 'all' && axis.category !== activeFilters.category)
        return false;
      return true;
    });
    // Guard against empty filtered result
    if (filtered.length === 0) return [{ axis: 'No Data', value: 0, raw: 0, category: 'all' }];
    return filtered.map((axis) => {
      const raw = Number(securityData?.[axis.key]) || 0;
      const computed = (raw / repos) * 50;
      const value = Number.isFinite(computed) ? Math.min(computed, 100) : 0;
      return {
        axis: axis.label,
        value: Math.round(value),
        raw,
        category: axis.category,
      };
    });
  }, [securityData, totalRepos, activeFilters.category]); // intential: only category triggers recalc

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      className="flex flex-col items-center w-full"
      role="img"
      aria-label="Security radar analysis chart"
    >
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="text-lg font-bold text-white">Security Radar Analysis</h3>
        <div className="flex gap-2">
          <select
            value={activeFilters.category}
            onChange={(e) => setActiveFilters({ ...activeFilters, category: e.target.value })}
            aria-label="Filter by category"
            className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {FILTER_OPTIONS.category.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 'all' ? 'All Categories' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={size}>
        <RadarChart
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius="65%"
          isAnimationActive={!reducedMotion}
        >
          <PolarGrid stroke="rgba(148,163,184,0.2)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Radar
            name="Security Risk"
            dataKey="value"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f3f4f6',
            }}
            formatter={(value, name, props) => [
              <span key="val">
                <strong>{value}</strong>
                <span className="text-gray-400 text-xs ml-1">/100 risk</span>
                <br />
                <span className="text-gray-400 text-xs">
                  {props.payload?.raw?.toLocaleString() ?? '0'} raw findings
                </span>
              </span>,
              props.payload.axis,
            ]}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Severity Breakdown */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Severity Breakdown</h4>
          <div className="space-y-2">
            {[
              {
                label: 'Critical',
                count: securityData?.critical || 0,
                color: getSeverityColor('critical'),
              },
              { label: 'High', count: securityData?.high || 0, color: getSeverityColor('high') },
              {
                label: 'Medium',
                count: securityData?.medium || 0,
                color: getSeverityColor('medium'),
              },
              { label: 'Low', count: securityData?.low || 0, color: getSeverityColor('low') },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-white">{item.count.toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
              <span className="text-xs text-gray-400 font-medium">Total Findings</span>
              <span className="text-sm font-bold text-white">
                {(securityData?.totalFindings || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Pattern Distribution */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Pattern Distribution</h4>
          <div className="space-y-2">
            {chartData.map((d) => (
              <div key={d.axis} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        d.value >= 80
                          ? '#ef4444'
                          : d.value >= 60
                            ? '#f97316'
                            : d.value >= 40
                              ? '#f59e0b'
                              : '#22c55e',
                    }}
                  />
                  <span className="text-xs text-gray-400">{d.axis}</span>
                </div>
                <span className="text-xs font-bold text-white">{d.raw.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
