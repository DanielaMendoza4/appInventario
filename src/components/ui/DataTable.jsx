import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import './DataTable.css';

export default function DataTable({
  columns = [],
  rows = [],
  rowKey,
  loading = false,
  error = '',
  loadingMessage = 'Cargando datos…',
  emptyTitle = 'Sin resultados',
  emptyMessage = 'No hay datos para mostrar.',
  emptyIcon,
  emptyAction,
  minWidth = 680,
  caption,
}) {
  const getRowKey =
    rowKey || ((row, index) => (row && row.id !== undefined ? row.id : index));

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (!rows.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        compact
      />
    );
  }

  return (
    <div className="ui-table-wrap">
      <table className="ui-table" style={{ minWidth }}>
        {caption && <caption className="visually-hidden">{caption}</caption>}

        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row, index)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render ? col.render(row, index) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
