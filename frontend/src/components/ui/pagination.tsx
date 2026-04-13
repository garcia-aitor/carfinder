import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function buildPages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  for (let i = currentPage - 2; i <= currentPage + 2; i += 1) {
    if (i >= 1 && i <= totalPages) {
      pages.add(i);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);

  return (
    <nav className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
      >
        Prev
      </Button>
      {pages.map((page, idx) => {
        const prev = pages[idx - 1];
        const showDots = prev && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-2">
            {showDots ? <span className="px-1 text-text-secondary">...</span> : null}
            <Button
              variant={page === currentPage ? "primary" : "secondary"}
              className="min-w-11"
              onClick={() => onChange(page)}
            >
              {page}
            </Button>
          </span>
        );
      })}
      <Button
        variant="secondary"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
