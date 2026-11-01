import { useEffect, useState } from 'react';
import './Dashboard.css';
import { getDashboardData } from '../../api/dashboard';
import Badge from '../../components/Badge/Badge';
import {
  IconProductos,
  IconCategorias,
  IconProveedores,
  IconKardex,
} from '../../components/Icons/Icons';

const CHART_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

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
    return <div className="empty-state">Cargando panel de control...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  const {
    totalProductos = 0,
    totalCategorias = 0,
    totalProveedores = 0,
    bajoStock = 0,
    recientes = [],
    stockPorCategoria = [],
  } = data || {};

  // Cálculo para el Donut Chart SVG puro
  const totalStockGeneral = stockPorCategoria.reduce((sum, c) => sum + c.totalStock, 0);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="dashboard-page">
      {/* 4 Tarjetas KPI */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__title">Total Productos</span>
            <div className="kpi-card__icon">
              <IconProductos size={20} />
            </div>
          </div>
          <div className="kpi-card__value">{totalProductos}</div>
          <span className="kpi-card__subtext">Ítems registrados en inventario</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__title">Categorías</span>
            <div className="kpi-card__icon">
              <IconCategorias size={20} />
            </div>
          </div>
          <div className="kpi-card__value">{totalCategorias}</div>
          <span className="kpi-card__subtext">Familias de productos activas</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-card__header">
            <span className="kpi-card__title">Proveedores</span>
            <div className="kpi-card__icon">
              <IconProveedores size={20} />
            </div>
          </div>
          <div className="kpi-card__value">{totalProveedores}</div>
          <span className="kpi-card__subtext">Empresas proveedoras registradas</span>
        </div>

        <div className={`kpi-card ${bajoStock > 0 ? 'kpi-card--danger' : ''}`}>
          <div className="kpi-card__header">
            <span className="kpi-card__title">Bajo Stock</span>
            <div className="kpi-card__icon">
              <IconKardex size={20} />
            </div>
          </div>
          <div className={`kpi-card__value ${bajoStock > 0 ? 'kpi-card__value--danger' : ''}`}>
            {bajoStock}
          </div>
          <span className="kpi-card__subtext">Productos con stock ≤ 5 unidades</span>
        </div>
      </div>

      {/* Grid de Contenido: Movimientos recientes + Donut Chart */}
      <div className="dashboard-content-grid">
        {/* Tabla Movimientos Recientes */}
        <div className="dashboard-section-card">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Movimientos Recientes (Kardex)</h3>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Usuario</th>
                </tr>
              </thead>
              <tbody>
                {recientes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No hay movimientos recientes registrados.
                    </td>
                  </tr>
                ) : (
                  recientes.map((m) => (
                    <tr key={m.id}>
                      <td>
                        {new Date(m.fecha_hora || m.createdAt).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td><strong>{m.Producto?.nombre || 'Producto #' + m.producto_id}</strong></td>
                      <td>
                        <Badge tipo={m.tipo_movimiento}>
                          {m.tipo_movimiento}
                        </Badge>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {m.tipo_movimiento === 'Salida' ? `-${m.cantidad}` : `+${m.cantidad}`}
                      </td>
                      <td>{m.Usuario?.nombre || 'Sistema'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico de dona SVG "Stock por Categoría" */}
        <div className="dashboard-section-card">
          <div className="dashboard-section-header">
            <h3 className="dashboard-section-title">Stock por Categoría</h3>
          </div>

          <div className="donut-chart-container">
            {totalStockGeneral === 0 ? (
              <div className="empty-state">Sin stock distribuido en categorías.</div>
            ) : (
              <>
                <div className="donut-svg-wrapper">
                  <svg width="180" height="180" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="20"
                    />
                    {stockPorCategoria.map((cat, idx) => {
                      if (cat.totalStock === 0) return null;
                      const percent = cat.totalStock / totalStockGeneral;
                      const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
                      const strokeDashoffset = -circumference * accumulatedPercent;
                      accumulatedPercent += percent;
                      const color = CHART_COLORS[idx % CHART_COLORS.length];

                      return (
                        <circle
                          key={cat.id}
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke={color}
                          strokeWidth="20"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          transform="rotate(-90 80 80)"
                        />
                      );
                    })}
                  </svg>

                  <div className="donut-center-text">
                    <div className="donut-center-number">{totalStockGeneral}</div>
                    <div className="donut-center-label">Unds. totales</div>
                  </div>
                </div>

                <div className="donut-legend">
                  {stockPorCategoria.map((cat, idx) => (
                    <div key={cat.id} className="donut-legend-item">
                      <span className="donut-legend-name">
                        <span
                          className="donut-legend-color"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        {cat.nombre}
                      </span>
                      <span className="donut-legend-val">{cat.totalStock} unds.</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
