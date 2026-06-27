/**
 * Shared Pagination component.
 * Props:
 *   page      — current page number (1-based)
 *   pages     — total page count
 *   total     — total item count
 *   perPage   — items per page (for range display)
 *   onChange  — (page) => void
 */
export default function Pagination({ page, pages, total, perPage, onChange }) {
  if (pages <= 1) return null;

  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  // Build page number buttons with ellipsis for large page counts
  const getPageNumbers = () => {
    const items = [];
    const delta = 2;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        items.push(i);
      } else if (items[items.length - 1] !== '...') {
        items.push('...');
      }
    }

    return items;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="px-4 py-3 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
      <div className="text-gray-400">
        Showing {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(1)}
          disabled={page === 1}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
          aria-label="First page"
        >
          «
        </button>
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
          aria-label="Previous page"
        >
          Previous
        </button>
        {pageNumbers.map((num, idx) =>
          num === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-500" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`px-3 py-1 rounded transition-colors ${
                num === page ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              aria-label={`Page ${num}`}
              aria-current={num === page ? 'page' : undefined}
            >
              {num}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === pages}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
        <button
          onClick={() => onChange(pages)}
          disabled={page === pages}
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs transition-colors"
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}
