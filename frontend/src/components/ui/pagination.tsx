interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** At most 5 page number slots so the control fits narrow viewports. */
function buildPages(currentPage: number, totalPages: number): number[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);
  const arrowButtonClassName =
    "inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border text-xs font-medium transition-colors md:h-9 md:w-9 md:text-sm";
  const pageButtonClassName =
    "inline-flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border px-2 text-xs font-medium transition-colors md:h-9 md:min-w-9 md:px-3 md:text-sm";

  return (
    <nav
      aria-label="Pagination"
      className="flex w-full max-w-full min-w-0 justify-center overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="inline-flex max-w-full min-w-0 flex-nowrap items-center justify-center gap-1 px-0.5 py-0.5 md:gap-2 md:px-0 md:py-0">
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
          const showDots = prev !== undefined && page - prev > 1;
          return (
            <span key={`${page}-${idx}`} className="inline-flex shrink-0 items-center gap-1 md:gap-2">
              {showDots ? (
                <span className="px-0.5 text-xs text-text-secondary md:px-2 md:text-sm">
                  …
                </span>
              ) : null}
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
      </div>
    </nav>
  );
}
