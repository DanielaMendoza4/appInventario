import { useEffect, useState } from 'react';
import './Kardex.css';
import { getMovimientos, createMovimiento, anularMovimiento } from '../../api/movimientos';
import { getProductos } from '../../api/productos';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import { IconPlus, IconEye } from '../../components/Icons/Icons';

const formVacio = {
  producto_id: '',
  tipo_movimiento: 'Entrada',
  cantidad: '',
  observaciones: '',
};

export default function Kardex() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalRegistroOpen, setModalRegistroOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [movs, prods] = await Promise.all([
        getMovimientos(),
        getProductos(),
      ]);
      setMovimientos(movs);
      setProductos(prods);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar los movimientos del kardex');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const abrirRegistro = () => {
    setForm(formVacio);
    setFormError('');
    setModalRegistroOpen(true);
  };

  const abrirDetalle = (mov) => {
    setMovimientoSeleccionado(mov);
    setModalDetalleOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.producto_id) {
      setFormError('Selecciona un producto');
      return;
    }
    const cant = parseInt(form.cantidad, 10);
    if (!cant || cant <= 0) {
      setFormError('La cantidad debe ser un número entero mayor a 0');
      return;
    }

    const prodSel = productos.find((p) => p.id === parseInt(form.producto_id, 10));
    if (form.tipo_movimiento === 'Salida' && prodSel && cant > prodSel.stock) {
      setFormError(`Stock insuficiente. Stock actual disponible: ${prodSel.stock} unidades.`);
      return;
    }

    setGuardando(true);
    setFormError('');

    try {
      await createMovimiento({
        producto_id: parseInt(form.producto_id, 10),
        usuario_id: user?.id || 1,
        tipo_movimiento: form.tipo_movimiento,
        cantidad: cant,
        observaciones: form.observaciones?.trim() || null,
      });

      setModalRegistroOpen(false);
      setForm(formVacio);
      await cargarDatos();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al registrar el movimiento');
    } finally {
      setGuardando(false);
    }
  };

  const handleAnular = async (mov) => {
    const confirmacion = window.confirm(
      `¿Deseas anular el movimiento #${mov.id} (${mov.tipo_movimiento} de ${mov.cantidad} unds. de "${mov.Producto?.nombre}")?\nEl stock del producto será revertido automáticamente.`
    );
    if (!confirmacion) return;

    try {
      await anularMovimiento(mov.id);
      await cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo anular el movimiento');
    }
  };

  // Filtrado por producto, tipo o usuario
  const filtrados = movimientos.filter((m) => {
    const prod = (m.Producto?.nombre || '').toLowerCase();
    const tipo = (m.tipo_movimiento || '').toLowerCase();
    const usr = (m.Usuario?.nombre || '').toLowerCase();
    const q = busqueda.toLowerCase().trim();
    return prod.includes(q) || tipo.includes(q) || usr.includes(q);
  });

  // Paginación
  const totalItems = filtrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const productoSeleccionadoActual = productos.find(
    (p) => p.id === parseInt(form.producto_id, 10)
  );

  return (
    <div className="kardex-page">
      <div className="page-header">
        <h2 className="page-title">Kardex / Movimientos</h2>
        <button className="btn btn-primary" onClick={abrirRegistro}>
          <IconPlus size={16} />
          <span>+ Registrar Movimiento</span>
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="page-actions-bar" style={{ padding: '1rem 1rem 0' }}>
          <SearchInput
            value={busqueda}
            onChange={(val) => {
              setBusqueda(val);
              setPaginaActual(1);
            }}
            placeholder="Buscar por producto, tipo o usuario…"
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Fecha / Hora</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Usuario</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-state">Cargando kardex...</td>
                </tr>
              ) : paginados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">
                    {busqueda ? 'No se encontraron movimientos coincidentes' : 'No hay movimientos registrados'}
                  </td>
                </tr>
              ) : (
                paginados.map((m) => (
                  <tr key={m.id}>
                    <td><strong>#{m.id}</strong></td>
                    <td>
                      {new Date(m.fecha_hora || m.createdAt).toLocaleString('es-PE', {
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
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => abrirDetalle(m)}
                          title="Ver detalle del movimiento"
                        >
                          <IconEye size={14} />
                          <span>Ver</span>
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleAnular(m)}
                          title="Anular movimiento y revertir stock"
                        >
                          <span>Anular</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
          resourceName="movimientos"
        />
      </div>

      {/* Modal Registro de Movimiento */}
      <Modal
        isOpen={modalRegistroOpen}
        onClose={() => setModalRegistroOpen(false)}
        title="Registrar Movimiento de Inventario"
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="producto_id">Producto *</label>
            <select
              id="producto_id"
              name="producto_id"
              required
              value={form.producto_id}
              onChange={handleChange}
            >
              <option value="">-- Selecciona producto --</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} (Stock actual: {p.stock} unds.)
                </option>
              ))}
            </select>
            {productoSeleccionadoActual && (
              <small>Stock disponible: <strong>{productoSeleccionadoActual.stock} unds.</strong></small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo_movimiento">Tipo de Movimiento *</label>
              <select
                id="tipo_movimiento"
                name="tipo_movimiento"
                required
                value={form.tipo_movimiento}
                onChange={handleChange}
              >
                <option value="Entrada">Entrada (Aumenta stock)</option>
                <option value="Salida">Salida (Disminuye stock)</option>
                <option value="Ajuste">Ajuste (Modificación)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cantidad">Cantidad *</label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="1"
                required
                placeholder="Ej. 10"
                value={form.cantidad}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="observaciones">Observaciones / Motivo</label>
            <textarea
              id="observaciones"
              name="observaciones"
              rows="3"
              placeholder="Ej. Compra a proveedor, devolución, merma de almacén..."
              value={form.observaciones}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalRegistroOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Registrando…' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalle de Movimiento */}
      <Modal
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        title={`Detalle de Movimiento #${movimientoSeleccionado?.id}`}
      >
        {movimientoSeleccionado && (
          <div className="kardex-detail-grid">
            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Producto</span>
              <span className="kardex-detail-value">{movimientoSeleccionado.Producto?.nombre}</span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Tipo de Movimiento</span>
              <span className="kardex-detail-value">
                <Badge tipo={movimientoSeleccionado.tipo_movimiento}>
                  {movimientoSeleccionado.tipo_movimiento}
                </Badge>
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Cantidad Afectada</span>
              <span className="kardex-detail-value" style={{ fontWeight: 700 }}>
                {movimientoSeleccionado.tipo_movimiento === 'Salida'
                  ? `-${movimientoSeleccionado.cantidad}`
                  : `+${movimientoSeleccionado.cantidad}`} unidades
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Stock Actual del Producto</span>
              <span className="kardex-detail-value">
                {movimientoSeleccionado.Producto?.stock ?? '-'} unds.
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Usuario Responsable</span>
              <span className="kardex-detail-value">{movimientoSeleccionado.Usuario?.nombre || 'Sistema'}</span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Fecha y Hora de Registro</span>
              <span className="kardex-detail-value">
                {new Date(movimientoSeleccionado.fecha_hora || movimientoSeleccionado.createdAt).toLocaleString('es-PE')}
              </span>
            </div>

            <div className="kardex-detail-item" style={{ gridColumn: '1 / -1' }}>
              <span className="kardex-detail-label">Observaciones</span>
              <span className="kardex-detail-value">
                {movimientoSeleccionado.observaciones || 'Sin observaciones registradas.'}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setModalDetalleOpen(false)}
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
}
