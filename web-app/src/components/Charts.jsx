import { useEffect, useRef, useState } from 'react';

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
    const radius = (size / 2) - 40;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Get metrics from data
    const metrics = Object.keys(data);
    const values = Object.values(data);
    const maxValue = Math.max(...values);

    // Draw background circles
    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Background circle
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw axis lines
    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const normalizedValue = (values[i] / maxValue) * progress;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Data point
      const pointRadius = hovered === metric ? 6 : 4;
      const dataX = centerX + (radius * normalizedValue) * Math.cos(angle);
      const dataY = centerY + (radius * normalizedValue) * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(dataX, dataY, pointRadius, 0, Math.PI * 2);
      ctx.fillStyle = hovered === metric
        ? 'rgba(239, 68, 68, 1)'
        : 'rgba(79, 70, 229, 0.8)';
      ctx.fill();

      // Connecting line to center
      ctx.beginPath();
      ctx.moveTo(dataX, dataY);
      ctx.lineTo(centerX, centerY);
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.3)';
      ctx.stroke();
    });

    // Draw labels
    ctx.font = '10px sans-serif';
    ctx.fillStyle = document.documentElement.classList.contains('dark')
      ? '#94a3b8'
      : '#475569';

    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const x = centerX + (radius + 20) * Math.cos(angle);
      const y = centerY + (radius + 20) * Math.sin(angle);

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

    // Find nearest segment
    const metrics = Object.keys(data);
    let nearestMetric = null;
    let minDistance = Infinity;

    metrics.forEach((metric, i) => {
      const angle = (Math.PI * 2 * i) / metrics.length - Math.PI / 2;
      const pointX = centerX + ((size / 2) - 40) * Math.cos(angle);
      const pointY = centerY + ((size / 2) - 40) * Math.sin(angle);

      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      if (distance < minDistance && distance < 30) {
        minDistance = distance;
        nearestMetric = metric;
      }
    });

    setHoveredSegment(nearestMetric);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
  };

  const getColor = (value) => {
    if (value >= 80) return '#10b981'; // green
    if (value >= 60) return '#3b82f6'; // blue
    if (value >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
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
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">
            <div className="text-xs font-medium text-gray-900 dark:text-white">
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
              style={{ backgroundColor: getColor(value) }}
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
  const maxValue = Math.max(...Object.values(data));

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="group">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{key}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{value}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-purple-700"
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

  const chartData = Object.entries(data).map(([key, value]) => ({
    label: key,
    value: value,
    percentage: (value / Object.values(data).reduce((a, b) => a + b, 0)) * 100
  }));

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

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
                  fill={colors[index % colors.length]}
                  stroke={document.documentElement.classList.contains('dark') ? '#1f2937' : 'white'}
                  strokeWidth={2}
                  style={{
                    opacity: hoveredSegment === segment.label ? 1 : 0.8,
                    transform: hoveredSegment === segment.label ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.2s'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {hoveredSegment && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">
              <div className="text-xs font-medium text-gray-900 dark:text-white">
                {hoveredSegment}: {data[hoveredSegment]} ({chartData.find(d => d.label === hoveredSegment)?.percentage.toFixed(1)}%)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 w-full">
        {chartData.map((segment, index) => (
          <div
            key={segment.label}
            className="flex items-center space-x-2 text-xs"
            onMouseEnter={() => setHoveredSegment(segment.label)}
            onMouseLeave={() => setHoveredSegment(null)}
            style={{ cursor: 'pointer' }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-gray-600 dark:text-gray-400">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Line Chart Component
export function LineChart({ data, title = "Trend Analysis" }) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    drawChart(ctx, data, hoveredPoint);
  }, [data, hoveredPoint]);

  const drawChart = (ctx, data, hovered) => {
    if (!ctx || !data || data.length === 0) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = 0;

    // Draw grid lines
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - 2 * padding) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#6b7280' : '#9ca3af';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw line chart
    ctx.beginPath();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    data.forEach((point, i) => {
      const x = padding + ((width - 2 * padding) / (data.length - 1)) * i;
      const y = height - padding - ((point.value / maxValue) * (height - 2 * padding));

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw gradient fill
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw data points
    data.forEach((point, i) => {
      const x = padding + ((width - 2 * padding) / (data.length - 1)) * i;
      const y = height - padding - ((point.value / maxValue) * (height - 2 * padding));

      ctx.beginPath();
      ctx.arc(x, y, hovered === i ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = hovered === i
        ? '#4f46e5'
        : '#6366f1';
      ctx.fill();

      // Draw tooltip for hovered point
      if (hovered === i) {
        ctx.fillStyle = document.documentElement.classList.contains('dark') ? '#94a3b8' : '#475569';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(point.value.toString(), x, y - 10);
      }
    });
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find nearest data point
    let nearestIndex = -1;
    let minDistance = Infinity;

    data.forEach((point, i) => {
      const pointX = 40 + ((rect.width - 80) / (data.length - 1)) * i;
      const distance = Math.abs(x - pointX);
      if (distance < minDistance && distance < 20) {
        minDistance = distance;
        nearestIndex = i;
      }
    });

    setHoveredPoint(nearestIndex !== -1 ? nearestIndex : null);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{title}</h3>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width="100%"
          height="200"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair"
        />
        {hoveredPoint !== null && (
          <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600">
            <div className="text-xs font-medium text-gray-900 dark:text-white">
              {data[hoveredPoint].label}: {data[hoveredPoint].value}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for Object.entries
function ObjectEntries(obj) {
  return Object.entries(obj);
}