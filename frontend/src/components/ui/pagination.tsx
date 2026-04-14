interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);
  const arrowButtonClassName =
    "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border text-sm font-medium transition-colors";
  const pageButtonClassName =
    "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-full border px-3 text-sm font-medium transition-colors";

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage <= 1}
        className={`${arrowButtonClassName} border-border bg-surface text-text-primary hover:border-accent/60 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(currentPage - 1)}
      >
        &#8249;
      </button>
      {pages.map((page, idx) => {
        const prev = pages[idx - 1];
        const showDots = prev && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-2">
            {showDots ? <span className="px-2 text-sm text-text-secondary">...</span> : null}
            <button
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              className={
                page === currentPage
                  ? `${pageButtonClassName} border-accent bg-accent text-black`
                  : `${pageButtonClassName} border-border bg-surface text-text-primary hover:border-accent/60 hover:text-text-primary`
              }
              onClick={() => onChange(page)}
            >
              {page}
            </button>
          </span>
        );
      })}
      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage >= totalPages}
        className={`${arrowButtonClassName} border-border bg-surface text-text-primary hover:border-accent/60 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40`}
        onClick={() => onChange(currentPage + 1)}
      >
        &#8250;
      </button>
    </nav>
  );
}
