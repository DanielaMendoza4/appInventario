import { useEffect, useState } from 'react';
import './Dashboard.css';
import { getDashboardData } from '../../api/dashboard';
import Badge from '../../components/Badge/Badge';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import ProgressBar from '../../components/ui/ProgressBar';
import {
  IconProductos,
  IconCategorias,
  IconProveedores,
  IconKardex,
} from '../../components/Icons/Icons';

const CHART_COLORS = [
  '#C9A07F',
  '#8A6149',
  '#E3C4A3',
  '#6F4A37',
  '#D9A679',
  '#A67C5B',
  '#B98A63',
  '#7C5340',
];

const formatFecha = (mov) =>
  new Date(mov.fecha_hora || mov.createdAt).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboardData()
      .then((res) => setData(res))
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar indicadores'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Card className="dash-panel">
          <LoadingState message="Cargando panel de control…" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const {
    totalProductos = 0,
    totalCategorias = 0,
    totalProveedores = 0,
    bajoStock = 0,
    recientes = [],
    stockPorCategoria = [],
  } = data || {};

  const totalStockGeneral = stockPorCategoria.reduce(
    (sum, cat) => sum + cat.totalStock,
    0
  );

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const categoriasConStock = stockPorCategoria.filter(
    (cat) => cat.totalStock > 0
  );

  const chartSegments = categoriasConStock.map((cat, idx, arr) => {
    const percent = cat.totalStock / totalStockGeneral;
    const stockPrevio = arr
      .slice(0, idx)
      .reduce((sum, item) => sum + item.totalStock, 0);

    return {
      ...cat,
      percent,
      color: CHART_COLORS[idx % CHART_COLORS.length],
      dashArray: `${circumference * percent} ${circumference * (1 - percent)}`,
      dashOffset: -circumference * (stockPrevio / totalStockGeneral),
    };
  });

  const columnasMovimientos = [
    {
      key: 'fecha',
      header: 'Fecha',
      render: (m) => formatFecha(m),
    },
    {
      key: 'producto',
      header: 'Producto',
      render: (m) => (
        <span className="dash-table__strong">
          {m.Producto?.nombre || `Producto #${m.producto_id}`}
        </span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (m) => (
        <Badge tipo={m.tipo_movimiento}>{m.tipo_movimiento}</Badge>
      ),
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
      align: 'right',
      render: (m) => (
        <span
          className={`dash-qty ${
            m.tipo_movimiento === 'Salida' ? 'dash-qty--out' : 'dash-qty--in'
          }`}
        >
          {m.tipo_movimiento === 'Salida' ? `-${m.cantidad}` : `+${m.cantidad}`}
        </span>
      ),
    },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (m) => m.Usuario?.nombre || 'Sistema',
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dash-kpi-grid">
        <StatCard
          label="Total Productos"
          value={totalProductos}
          hint="Ítems registrados en inventario"
          icon={<IconProductos size={20} />}
          staggerIndex={0}
        />
        <StatCard
          label="Categorías"
          value={totalCategorias}
          hint="Familias de productos activas"
          icon={<IconCategorias size={20} />}
          staggerIndex={1}
        />
        <StatCard
          label="Proveedores"
          value={totalProveedores}
          hint="Empresas proveedoras registradas"
          icon={<IconProveedores size={20} />}
          staggerIndex={2}
        />
        <StatCard
          label="Bajo Stock"
          value={bajoStock}
          hint="Productos con stock ≤ 5 unidades"
          icon={<IconKardex size={20} />}
          tone={bajoStock > 0 ? 'danger' : 'success'}
          staggerIndex={3}
        />
      </div>

      <div className="dash-grid">
        <Card
          as="section"
          className="dash-panel"
          aria-labelledby="dash-mov-title"
        >
          <header className="dash-panel__header">
            <h2 id="dash-mov-title" className="dash-panel__title">
              Movimientos recientes
            </h2>
            <span className="dash-panel__meta">
              {recientes.length} registro{recientes.length === 1 ? '' : 's'}
            </span>
          </header>

          <DataTable
            columns={columnasMovimientos}
            rows={recientes}
            rowKey={(m) => m.id}
            minWidth={620}
            emptyTitle="Sin movimientos recientes"
            emptyMessage="Aún no se registran entradas, salidas o ajustes en el kardex."
            emptyIcon={<IconKardex size={28} />}
          />
        </Card>

        <Card
          as="section"
          className="dash-panel"
          aria-labelledby="dash-stock-title"
        >
          <header className="dash-panel__header">
            <h2 id="dash-stock-title" className="dash-panel__title">
              Stock por categoría
            </h2>
            <span className="dash-panel__meta">{totalStockGeneral} unds.</span>
          </header>

          <div className="dash-panel__body">
            {totalStockGeneral === 0 ? (
              <EmptyState
                icon={<IconCategorias size={28} />}
                title="Sin stock registrado"
                message="Registra productos con stock para ver la distribución por categoría."
              />
            ) : (
              <>
                <div className="dash-donut">
                  <svg
                    viewBox="0 0 160 160"
                    role="img"
                    aria-label={`Distribución de stock por categoría. Total ${totalStockGeneral} unidades.`}
                  >
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="var(--color-border-subtle)"
                      strokeWidth="20"
                    />
                    {chartSegments.map((seg) => (
                      <circle
                        key={seg.id}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="20"
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        transform="rotate(-90 80 80)"
                      />
                    ))}
                  </svg>

                  <div className="dash-donut__center" aria-hidden="true">
                    <span className="dash-donut__number">
                      {totalStockGeneral}
                    </span>
                    <span className="dash-donut__label">unds. totales</span>
                  </div>
                </div>

                <ul className="dash-stock-list">
                  {chartSegments.map((seg, idx) => (
                    <li key={seg.id} className="dash-stock-row">
                      <div className="dash-stock-row__top">
                        <span className="dash-stock-row__name">
                          <span
                            className="dash-stock-row__dot"
                            style={{ backgroundColor: seg.color }}
                            aria-hidden="true"
                          />
                          {seg.nombre}
                        </span>
                        <span className="dash-stock-row__value">
                          {seg.totalStock} unds.
                          <span className="dash-stock-row__percent">
                            {Math.round(seg.percent * 100)}%
                          </span>
                        </span>
                      </div>
                      <ProgressBar
                        value={seg.percent * 100}
                        color={seg.color}
                        delay={idx * 90}
                        label={`${seg.nombre}: ${Math.round(seg.percent * 100)}% del stock total`}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
