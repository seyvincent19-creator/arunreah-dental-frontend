interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, total, perPage, onChange }: PaginationProps) {
  if (lastPage <= 1) {
    return null;
  }

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === lastPage || Math.abs(page - currentPage) <= 1,
  );

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <span className="text-muted-soft small">
        Showing {from}-{to} of {total}
      </span>
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onChange(currentPage - 1)}>
              Prev
            </button>
          </li>
          {pages.map((page, idx) => (
            <li key={page} className="page-item d-flex align-items-center">
              {idx > 0 && pages[idx - 1] !== page - 1 && <span className="px-1 text-muted-soft">…</span>}
              <button
                className={`page-link ${page === currentPage ? 'active' : ''}`}
                onClick={() => onChange(page)}
              >
                {page}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === lastPage ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onChange(currentPage + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
