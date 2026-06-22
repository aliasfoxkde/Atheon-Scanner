import { useEffect, useState } from 'react';
import apiService from '../services/api';
import { Skeleton } from './Skeleton';
import Modal from './Modal';

export default function CompareModal({ ids = [], onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiService.getCompareReports(ids);
        if (mounted) {
          if (res.success) setReports(res.data.reports || []);
          else setError(res.error || 'Failed to load reports');
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [ids]);

  if (!ids || ids.length < 2) return null;

  const compareMetric = (key, format = (v) => v) => {
    const values = reports.map((r) => r[key] || 0);
    const max = Math.max(...values, 1);
    return reports.map((r, i) => {
      const v = r[key] || 0;
      return { name: r.name, raw: v, formatted: format(v), pct: max ? (v / max) * 100 : 0, idx: i };
    });
  };

  const scoreRows = compareMetric('quality_score');
  const depRows = compareMetric('total_dependencies');
  const fileRows = compareMetric('total_files');
  const starRows = compareMetric('stars');

  return (
    <Modal id="compare-modal" label="Compare reports" onClose={onClose} size="max-w-5xl">
      <div className="p-4 sm:p-6 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Compare reports</h2>
          <p className="text-sm text-gray-400">{reports.length} packages</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-2"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : error ? (
          <div className="text-red-300">{error}</div>
        ) : reports.length === 0 ? (
          <p className="text-gray-400">No reports found for the selected ids</p>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th scope="col" className="text-left text-gray-400 font-medium px-3 py-2 w-32">Metric</th>
                    {reports.map((r) => (
                      <th key={r.id} scope="col" className="text-left text-white font-semibold px-3 py-2 min-w-32 truncate">
                        {r.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-gray-400 px-3 py-2">Language</td>
                    {reports.map((r) => <td key={r.id} className="text-white px-3 py-2">{r.language}</td>)}
                  </tr>
                  <tr>
                    <td className="text-gray-400 px-3 py-2">Tier</td>
                    {reports.map((r) => (
                      <td key={r.id} className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          r.tier === 'A' ? 'bg-green-500' :
                          r.tier === 'B' ? 'bg-blue-500' :
                          r.tier === 'C' ? 'bg-yellow-500' :
                          r.tier === 'D' ? 'bg-orange-500' : 'bg-red-500'
                        } text-white`}>{r.tier}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-gray-400 px-3 py-2">Scan method</td>
                    {reports.map((r) => <td key={r.id} className="text-white px-3 py-2 text-xs">{r.scan_method}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>

            {[
              { label: 'Quality score', rows: scoreRows, format: (v) => v, color: 'bg-blue-500' },
              { label: 'GitHub stars', rows: starRows, format: (v) => v.toLocaleString(), color: 'bg-yellow-500' },
              { label: 'Dependencies', rows: depRows, format: (v) => v.toLocaleString(), color: 'bg-purple-500' },
              { label: 'Files', rows: fileRows, format: (v) => v.toLocaleString(), color: 'bg-green-500' },
            ].map((m) => (
              <div key={m.label}>
                <h3 className="text-sm font-semibold text-white mb-2">{m.label}</h3>
                <div className="space-y-2">
                  {m.rows.map((row) => (
                    <div key={row.idx} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-32 truncate" title={row.name}>{row.name}</span>
                      <div className="flex-1 bg-gray-900 rounded h-5 overflow-hidden">
                        <div className={`${m.color} h-full transition-all`} style={{ width: `${row.pct}%` }} />
                      </div>
                      <span className="text-xs text-white w-16 text-right">{m.format(row.raw)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}