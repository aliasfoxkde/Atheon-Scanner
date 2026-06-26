export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const showLeftDots = page > 3;
    const showRightDots = page < totalPages - 2;

    if (!showLeftDots) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (!showRightDots) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page > 4) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-2"
    >
      {/* Previous button */}
      <button
        onClick={handlePrevious}
        disabled={page === 1}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          page === 1
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        aria-label="Previous page"
      >
        <svg
          className="w-4 h-4 mr-1 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1.5 text-gray-500"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          const isCurrentPage = pageNum === page;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[2.5rem] px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isCurrentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label={`Page ${pageNum}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          page === totalPages
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        aria-label="Next page"
      >
        Next
        <svg
          className="w-4 h-4 ml-1 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Page info */}
      <span className="ml-2 text-sm text-gray-400" aria-live="polite">
        Page {page} of {totalPages}
      </span>
    </nav>
  );
}
