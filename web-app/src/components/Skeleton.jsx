/**
 * Skeleton placeholders with shimmer animation.
 * Use to indicate loading without flashing a spinner.
 */
const baseShimmer =
  'animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer';

export function Skeleton({ className = '' }) {
  return <div role="status" aria-busy="true" className={`${baseShimmer} rounded ${className}`} />;
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div role="status" aria-busy="true" className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`${baseShimmer} rounded h-3`}
          style={{ width: `${Math.max(40, 100 - i * 10)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className={`${baseShimmer} h-3 w-24 rounded`} />
          <div className={`${baseShimmer} h-8 w-20 rounded`} />
        </div>
        <div className={`${baseShimmer} w-12 h-12 rounded-lg`} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 8, columns = 5 }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className={`${baseShimmer} h-3 w-20 rounded`} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-t border-gray-700">
                {Array.from({ length: columns }).map((_, c) => (
                  <td key={c} className="px-4 py-3">
                    <div
                      className={`${baseShimmer} h-3 rounded`}
                      style={{ width: `${60 + ((r + c) % 4) * 10}%` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 space-y-3"
    >
      <div className={`${baseShimmer} h-4 w-1/3 rounded`} />
      <div className={`${baseShimmer} h-8 w-1/2 rounded`} />
      <div className={`${baseShimmer} h-3 w-2/3 rounded`} />
    </div>
  );
}

export function SkeletonChart({ height = 200 }) {
  return (
    <div role="status" aria-busy="true" className={`${baseShimmer} rounded`} style={{ height }} />
  );
}

export function SkeletonDonut({ size = 160 }) {
  return (
    <div
      role="status"
      aria-busy="true"
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className={`${baseShimmer} rounded-full`} style={{ width: size, height: size }} />
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ width: size * 0.6, height: size * 0.6 }}
      >
        <div
          className={`${baseShimmer} rounded-full`}
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      </div>
    </div>
  );
}
