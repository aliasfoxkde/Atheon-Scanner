import { useEffect, useRef, useState } from 'react';

export default function SecurityRadarChart({ securityData, totalRepos, size = 400 }) {
  const canvasRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [activeFilters, setActiveFilters] = useState({
    severity: 'all', // all, critical, high, medium, low
    category: 'all', // all, injection, xss, auth, crypto, config
    language: 'all'  // all, javascript, python, typescript, go
  });
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced security metrics calculation
  const calculateMetrics = () => {
    const { totalFindings, critical, high, medium, low } = securityData;

    return {
      'Injection Attacks': Math.min((high * 0.8 + medium * 0.3) / (totalRepos || 1) * 10, 100),
      'XSS Vulnerabilities': Math.min((high * 0.6 + medium * 0.2) / (totalRepos || 1) * 10, 100),
      'Auth Issues': Math.min((critical * 2 + high * 0.4) / (totalRepos || 1) * 10, 100),
      'Crypto Weakness': Math.min((critical + high * 0.3) / (totalRepos || 1) * 10, 100),
      'Config Security': Math.min((medium + low * 0.5) / (totalRepos || 1) * 10, 100),
      'Data Exposure': Math.min((critical * 1.5 + high * 0.5) / (totalRepos || 1) * 10, 100),
      'API Security': Math.min((high * 0.7 + medium * 0.4) / (totalRepos || 1) * 10, 100),
      'Dependencies': Math.min((medium * 0.8 + low * 0.3) / (totalRepos || 1) * 10, 100)
    };
  };

  const metrics = calculateMetrics();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Animation
    let progress = 0;
    const animate = () => {
      progress += 0.015;
      if (progress > 1) progress = 1;

      setAnimationProgress(progress);
      drawChart(ctx, metrics, progress, hoveredSegment);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [securityData, hoveredSegment, activeFilters]);

  const drawChart = (ctx, data, progress, hovered) => {
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 60;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const metrics_list = Object.keys(data);
    const values = Object.values(data);
    const maxValue = 100;

    // Draw concentric radar grids
    const gridLevels = 5;
    for (let level = 1; level <= gridLevels; level++) {
      const levelRadius = (radius / gridLevels) * level;

      ctx.beginPath();
      metrics_list.forEach((_, i) => {
        const angle = (Math.PI * 2 * i) / metrics_list.length - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines and labels
    metrics_list.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics_list.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Background dot
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.fill();
    });

    // Draw data area
    ctx.beginPath();
    metrics_list.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics_list.length - Math.PI / 2;
      const normalizedValue = (values[i] / maxValue) * progress;
      const dataRadius = radius * normalizedValue;
      const x = centerX + dataRadius * Math.cos(angle);
      const y = centerY + dataRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();

    // Create gradient fill
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
    gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points and connecting lines
    metrics_list.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics_list.length - Math.PI / 2;
      const normalizedValue = (values[i] / maxValue) * progress;
      const dataRadius = radius * normalizedValue;
      const x = centerX + dataRadius * Math.cos(angle);
      const y = centerY + dataRadius * Math.sin(angle);

      // Draw connecting line to center
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw data point
      const pointRadius = hovered === metric ? 8 : 5;
      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, Math.PI * 2);

      const valueColor = getValueColor(values[i]);
      ctx.fillStyle = valueColor;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw value label on point
      if (hovered === metric || progress === 1) {
        ctx.font = `${hovered === metric ? 'bold ' : ''}10px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(values[i].toFixed(0), x, y - 12);
      }
    });

    // Draw labels
    ctx.font = '11px sans-serif';
    ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';

    metrics_list.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics_list.length - Math.PI / 2;
      const labelRadius = radius + 35;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Highlight hovered label
      if (hovered === metric) {
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ef4444';
      } else {
        ctx.font = '11px sans-serif';
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569';
      }

      ctx.fillText(metric, x, y);
    });
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = size / 2;
    const centerY = size / 2;

    // Find nearest segment
    const metrics_list = Object.keys(metrics);
    let nearestMetric = null;
    let minDistance = Infinity;

    metrics_list.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics_list.length - Math.PI / 2;
      const pointX = centerX + ((size / 2) - 60) * Math.cos(angle);
      const pointY = centerY + ((size / 2) - 60) * Math.sin(angle);

      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      if (distance < minDistance && distance < 40) {
        minDistance = distance;
        nearestMetric = metric;
      }
    });

    setHoveredSegment(nearestMetric);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  const getValueColor = (value) => {
    if (value >= 80) return '#ef4444'; // high severity - red
    if (value >= 60) return '#f97316'; // medium-high - orange
    if (value >= 40) return '#f59e0b'; // medium - yellow
    if (value >= 20) return '#eab308'; // low-medium - yellow-green
    return '#22c55e'; // low - green
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const filterOptions = {
    severity: ['all', 'critical', 'high', 'medium', 'low'],
    category: ['all', 'injection', 'xss', 'auth', 'crypto', 'config'],
    language: ['all', 'javascript', 'python', 'typescript', 'go', 'rust']
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between items-center w-full mb-4">
        <h3 className="text-lg font-bold text-white">Security Radar Analysis</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="w-full mb-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([filterType, options]) => (
              <div key={filterType} className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">{filterType}</label>
                <select
                  value={activeFilters[filterType]}
                  onChange={(e) => setActiveFilters({...activeFilters, [filterType]: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {options.map(option => (
                    <option key={option} value={option} className="bg-gray-800">
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair"
        />
        {hoveredSegment && metrics[hoveredSegment] !== undefined && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900 px-4 py-2 rounded-lg shadow-xl border border-gray-600">
            <div className="text-sm font-bold text-white">
              {hoveredSegment}: {metrics[hoveredSegment].toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">Security Risk Score</div>
          </div>
        )}
      </div>

      {/* Enhanced Statistics Display */}
      <div className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overall Stats */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Overall Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Total Findings</span>
              <span className="text-sm font-bold text-white">{securityData.totalFindings.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Repositories Affected</span>
              <span className="text-sm font-bold text-white">{totalRepos.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Avg Findings/Repo</span>
              <span className="text-sm font-bold text-white">
                {(securityData.totalFindings / (totalRepos || 1)).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Severity Breakdown</h4>
          <div className="space-y-2">
            {[
              { label: 'Critical', value: securityData.critical, color: '#ef4444' },
              { label: 'High', value: securityData.high, color: '#f97316' },
              { label: 'Medium', value: securityData.medium, color: '#f59e0b' },
              { label: 'Low', value: securityData.low, color: '#22c55e' }
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
                <span className="text-sm font-bold text-white">{value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Risk Assessment</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Critical Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${Math.min((securityData.critical / totalRepos) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-red-400">
                  {((securityData.critical / totalRepos) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">High Risk</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-orange-500"
                    style={{ width: `${Math.min((securityData.high / totalRepos) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-orange-400">
                  {((securityData.high / totalRepos) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Legend */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Security Metrics</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getValueColor(value) }}
                />
                <span className="text-xs text-gray-400 truncate">{key}</span>
                <span className="text-xs font-bold text-white">{value.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}