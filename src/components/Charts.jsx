import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TIER_COLORS = { S: '#22d3ee', A: '#4ade80', B: '#facc15', C: '#fb923c', D: '#f87171', F: '#94a3b8' };

export function TierBarChart({ data }) {
  return (
    <div role="img" aria-label="Quality tier distribution bar chart">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="tier" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count">
            {data.map((entry, i) => (
              <Cell key={i} fill={TIER_COLORS[entry.tier] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LanguageDonutChart({ data }) {
  const processedData = data.map(d => ({
    lang: (d.language || 'Unknown').slice(0, 6),
    count: d.count,
  }));

  return (
    <div role="img" aria-label={`Language distribution donut chart with ${data.length} languages`}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={processedData}>
          <XAxis dataKey="lang" />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
