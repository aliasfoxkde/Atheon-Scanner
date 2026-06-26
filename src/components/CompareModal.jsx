import { useEffect } from 'react';

function getBestWorst(values) {
  const numericValues = values.filter((v) => typeof v === 'number');
  if (numericValues.length < 2) return { best: null, worst: null };

  const max = Math.max(...numericValues);
  const min = Math.min(...numericValues);

  return {
    best: max,
    worst: min,
  };
}

function CellValue({ value, isBest, isWorst }) {
  const baseClass = 'px-4 py-3 text-sm text-center';

  if (isBest && isWorst) {
    return <span className={`${baseClass} text-yellow-400 font-medium`}>{value}</span>;
  }
  if (isBest) {
    return <span className={`${baseClass} text-green-400 font-medium`}>{value}</span>;
  }
  if (isWorst) {
    return <span className={`${baseClass} text-red-400 font-medium`}>{value}</span>;
  }

  return <span className={`${baseClass} text-gray-300`}>{value}</span>;
}

function RowLabel({ label }) {
  return (
    <th scope="row" className="px-4 py-3 text-sm font-medium text-gray-400 text-left">
      {label}
    </th>
  );
}

export default function CompareModal({ reports, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!reports || reports.length < 2) {
    return null;
  }

  const comparisonData = [
    {
      label: 'Name',
      getValue: (r) => r.name || 'Unknown',
      isNumeric: false,
    },
    {
      label: 'Language',
      getValue: (r) => r.language || 'Unknown',
      isNumeric: false,
    },
    {
      label: 'Quality Score',
      getValue: (r) => r.quality_score ?? 0,
      isNumeric: true,
    },
    {
      label: 'Tier',
      getValue: (r) => {
        const score = r.quality_score || 70;
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
      },
      isNumeric: false,
    },
    {
      label: 'Stars',
      getValue: (r) => r.stars ?? 0,
      isNumeric: true,
      format: (v) => v?.toLocaleString() ?? 'N/A',
    },
    {
      label: 'Forks',
      getValue: (r) => r.forks ?? 0,
      isNumeric: true,
      format: (v) => v?.toLocaleString() ?? 'N/A',
    },
    {
      label: 'Dependencies',
      getValue: (r) => r.dependencies ?? 0,
      isNumeric: true,
    },
    {
      label: 'Files Analyzed',
      getValue: (r) => r.files_analyzed ?? r.files ?? 0,
      isNumeric: true,
    },
    {
      label: 'Scan Method',
      getValue: (r) => r.scan_method || 'Automated',
      isNumeric: false,
    },
    {
      label: 'Scan Date',
      getValue: (r) => r.scan_date || 'N/A',
      isNumeric: false,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Compare reports"
        className="bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">
            Compare Reports ({reports.length})
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-800 border-b border-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Attribute
                </th>
                {reports.map((report) => (
                  <th
                    key={report.id || report.name}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide min-w-[150px]"
                  >
                    {report.name || 'Unknown'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {comparisonData.map(({ label, getValue, isNumeric, format }) => {
                const values = reports.map(getValue);
                const { best, worst } = isNumeric ? getBestWorst(values) : { best: null, worst: null };

                return (
                  <tr key={label} className="hover:bg-gray-750">
                    <RowLabel label={label} />
                    {reports.map((report, index) => {
                      const rawValue = getValue(report);
                      const displayValue = format ? format(rawValue) : rawValue;
                      const isBest = isNumeric && rawValue === best && values.filter((v) => v === best).length === 1;
                      const isWorst = isNumeric && rawValue === worst && values.filter((v) => v === worst).length === 1;

                      return (
                        <td key={index} className="px-4 py-3">
                          <CellValue
                            value={displayValue}
                            isBest={isBest}
                            isWorst={isWorst}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            <span className="text-green-400">Green</span> = best,{' '}
            <span className="text-red-400">Red</span> = worst
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
