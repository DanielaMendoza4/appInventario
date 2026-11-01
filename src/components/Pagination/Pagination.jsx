import './Pagination.css';

export default function Pagination({
  totalItems,
  itemsPerPage = 5,
  currentPage,
  onPageChange,
  resourceName = 'elementos',
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Mostrando <strong>{startItem}-{endItem}</strong> de <strong>{totalItems}</strong> {resourceName}
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          &laquo; Anterior
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`pagination-btn ${p === currentPage ? 'pagination-btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="pagination-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Siguiente &raquo;
        </button>
      </div>
    </div>
  );
}
