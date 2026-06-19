import { useEffect, useRef, useState } from 'react';

// Spider/Radar Chart Component
export default function SpiderChart({ data, size = 300, title = "Analysis Coverage" }) {
  const canvasRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Animation
    let progress = 0;
    const animate = () => {
      progress += 0.02;
      if (progress > 1) progress = 1;

      setAnimationProgress(progress);
      drawChart(ctx, data, progress, hoveredSegment);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [data, hoveredSegment]);

  const drawChart = (ctx, data, progress, hovered) => {
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = (size / 2) - 50;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Get metrics from data
    const metrics = Object.keys(data);
    const values = Object.values(data);
    const maxValue = Math.max(...values, 100);

    // Draw radar grid
    const gridLevels = 5;
    for (let level = 1; level <= gridLevels; level++) {
      const levelRadius = (radius / gridLevels) * level;

      ctx.beginPath();
      metrics.forEach((_, i) => {
        const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
        const x = centerX + levelRadius * Math.cos(angle);
        const y = centerY + levelRadius * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axis lines
    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw data area
    ctx.beginPath();
    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
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
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
    gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.2)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const normalizedValue = (values[i] / maxValue) * progress;
      const dataRadius = radius * normalizedValue;
      const x = centerX + dataRadius * Math.cos(angle);
      const y = centerY + dataRadius * Math.sin(angle);

      const pointRadius = hovered === metric ? 8 : 5;
      ctx.beginPath();
      ctx.arc(x, y, pointRadius, 0, Math.PI * 2);

      const valueColor = getValueColor(values[i]);
      ctx.fillStyle = valueColor;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw value on point
      if (hovered === metric || progress === 1) {
        ctx.font = `${hovered === metric ? 'bold ' : ''}10px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(values[i].toFixed(0), x, y - 12);
      }
    });

    // Draw labels
    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const labelRadius = radius + 30;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      ctx.font = `${hovered === metric ? 'bold ' : ''}11px sans-serif`;
      ctx.fillStyle = hovered === metric ? '#22c55e' : 'rgba(203, 213, 225, 0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
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

    const metrics = Object.keys(data);
    let nearestMetric = null;
    let minDistance = Infinity;

    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const pointX = centerX + ((size / 2) - 50) * Math.cos(angle);
      const pointY = centerY + ((size / 2) - 50) * Math.sin(angle);

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
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#3b82f6';
    if (value >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair"
        />
        {hoveredSegment && data[hoveredSegment] !== undefined && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg border border-gray-600">
            <div className="text-xs font-medium text-white">
              {hoveredSegment}: {data[hoveredSegment]}/100
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 w-full">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getValueColor(value) }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bar Chart Component
export function BarChart({ data, title = "Analysis Results" }) {
  const maxValue = Math.max(...Object.values(data), 1);

  const getBarColor = (value) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return 'from-green-500 to-emerald-600';
    if (percentage >= 60) return 'from-blue-500 to-cyan-600';
    if (percentage >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{key}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{value.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getBarColor(value)} rounded-full transition-all duration-500 group-hover:opacity-80`}
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Donut Chart Component
export function DonutChart({ data, size = 200, title = "Findings Distribution" }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [rotation, setRotation] = useState(0);

  const chartData = Object.entries(data).filter(([_, value]) => value > 0).map(([key, value]) => ({
    label: key,
    value: value,
    percentage: (value / Object.values(data).reduce((a, b) => a + b, 0)) * 100
  }));

  const colors = {
    'Critical': '#ef4444',
    'High': '#f97316',
    'Medium': '#f59e0b',
    'Low': '#22c55e',
    'Info': '#3b82f6',
    'default': '#6366f1'
  };

  const getColor = (label) => colors[label] || colors['default'];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={(size - 40) / 2}
              fill="none"
              stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}
              strokeWidth={20}
            />
            <text
              x={size / 2}
              y={size / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm fill-gray-500"
            >
              No Data
            </text>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform transition-transform duration-500 hover:scale-105">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - 40) / 2}
            fill="none"
            stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}
            strokeWidth={20}
          />

          {/* Data segments */}
          {chartData.map((segment, index) => {
            const startAngle = rotation;
            const segmentAngle = (segment.value / total) * 360;
            const endAngle = startAngle + segmentAngle;

            const x1 = size / 2 + ((size - 40) / 2 - 10) * Math.cos((startAngle * Math.PI) / 180);
            const y1 = size / 2 + ((size - 40) / 2 - 10) * Math.sin((startAngle * Math.PI) / 180);
            const x2 = size / 2 + ((size - 40) / 2 - 10) * Math.cos((endAngle * Math.PI) / 180);
            const y2 = size / 2 + ((size - 40) / 2 - 10) * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            return (
              <g key={segment.label}
                onMouseEnter={() => setHoveredSegment(segment.label)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{ cursor: 'pointer' }}
              >
                <path
                  d={`M ${x1} ${y1} A ${((size - 40) / 2 - 10)} ${((size - 40) / 2 - 10)} 0 ${largeArcFlag} 1 ${x2} ${y2}`}
                  fill={getColor(segment.label)}
                  stroke={document.documentElement.classList.contains('dark') ? '#1f2937' : 'white'}
                  strokeWidth={2}
                  style={{
                    opacity: hoveredSegment === segment.label ? 1 : 0.85,
                    transform: hoveredSegment === segment.label ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.2s'
                  }}
                />
              </g>
            );
          })}

          {/* Center text */}
          <text
            x={size / 2}
            y={size / 2 - 8}
            textAnchor="middle"
            className="text-lg font-bold fill-white"
          >
            {total.toLocaleString()}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 10}
            textAnchor="middle"
            className="text-xs fill-gray-400"
          >
            Total Issues
          </text>
        </svg>

        {hoveredSegment && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gray-900 dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-600">
              <div className="text-xs font-medium text-white">
                {hoveredSegment}: {data[hoveredSegment].toLocaleString()} ({chartData.find(d => d.label === hoveredSegment)?.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 w-full">
        {chartData.map((segment) => (
          <div
            key={segment.label}
            className="flex items-center space-x-2 text-xs"
            onMouseEnter={() => setHoveredSegment(segment.label)}
            onMouseLeave={() => setHoveredSegment(null)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColor(segment.label) }}
            />
            <span className="text-gray-600 dark:text-gray-400">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function
function getValueColor(value) {
  if (value >= 80) return '#22c55e';
  if (value >= 60) return '#3b82f6';
  if (value >= 40) return '#f59e0b';
  return '#ef4444';
}