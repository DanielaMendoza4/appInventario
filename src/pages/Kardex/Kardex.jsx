import { useEffect, useState } from 'react';
import './Kardex.css';
import { getMovimientos, createMovimiento, anularMovimiento } from '../../api/movimientos';
import { getProductos } from '../../api/productos';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { TopbarAction } from '../../components/Layout/TopbarAction';
import Badge from '../../components/Badge/Badge';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import DataTable from '../../components/ui/DataTable';
import {
  IconPlus,
  IconEye,
  IconKardex,
} from '../../components/Icons/Icons';

const TIPOS = ['Entrada', 'Salida', 'Ajuste'];

const formVacio = {
  producto_id: '',
  tipo_movimiento: 'Entrada',
  cantidad: '',
  observaciones: '',
};

const fetchKardexData = () => Promise.all([getMovimientos(), getProductos()]);

const formatFechaTabla = (mov) =>
  new Date(mov.fecha_hora || mov.createdAt).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

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
  const [tipoFiltro, setTipoFiltro] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  useEffect(() => {
    let cancelado = false;

    fetchKardexData()
      .then(([movs, prods]) => {
        if (cancelado) return;
        setMovimientos(movs);
        setProductos(prods);
        setError('');
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err.response?.data?.error ||
              'Error al cargar los movimientos del kardex'
          );
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [movs, prods] = await fetchKardexData();
      setMovimientos(movs);
      setProductos(prods);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Error al cargar los movimientos del kardex'
      );
    } finally {
      setLoading(false);
    }
  };

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

    const prodSel = productos.find(
      (p) => p.id === parseInt(form.producto_id, 10)
    );
    if (form.tipo_movimiento === 'Salida' && prodSel && cant > prodSel.stock) {
      setFormError(
        `Stock insuficiente. Stock actual disponible: ${prodSel.stock} unidades.`
      );
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
      setFormError(
        err.response?.data?.error || 'Error al registrar el movimiento'
      );
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

  // Filtrado por tipo + búsqueda, antes de paginar
  const filtrados = movimientos.filter((m) => {
    const coincideTipo =
      tipoFiltro === 'todos' || m.tipo_movimiento === tipoFiltro;
    const prod = (m.Producto?.nombre || '').toLowerCase();
    const tipo = (m.tipo_movimiento || '').toLowerCase();
    const usr = (m.Usuario?.nombre || '').toLowerCase();
    const q = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      prod.includes(q) || tipo.includes(q) || usr.includes(q);

    return coincideTipo && coincideBusqueda;
  });

  const totalItems = filtrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  const hayFiltros = busqueda.trim() !== '' || tipoFiltro !== 'todos';

  const contarTipo = (tipo) =>
    movimientos.filter((m) => m.tipo_movimiento === tipo).length;

  const productoSeleccionadoActual = productos.find(
    (p) => p.id === parseInt(form.producto_id, 10)
  );

  const columnas = [
    {
      key: 'id',
      header: 'ID',
      width: 64,
      render: (m) => <span className="row-id">#{m.id}</span>,
    },
    {
      key: 'fecha',
      header: 'Fecha / hora',
      render: (m) => formatFechaTabla(m),
    },
    {
      key: 'producto',
      header: 'Producto',
      render: (m) => (
        <span className="kardex-product">
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
          className={`kardex-qty ${
            m.tipo_movimiento === 'Salida'
              ? 'kardex-qty--out'
              : 'kardex-qty--in'
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
    {
      key: 'acciones',
      header: 'Acciones',
      width: 168,
      align: 'center',
      render: (m) => (
        <div className="table-actions table-actions--center">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => abrirDetalle(m)}
            title="Ver detalle del movimiento"
          >
            <IconEye size={14} />
            <span>Ver</span>
          </button>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => handleAnular(m)}
            title="Anular movimiento y revertir stock"
          >
            <span>Anular</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="kardex-page">
      <TopbarAction>
        <button className="btn btn-primary" onClick={abrirRegistro}>
          <IconPlus size={16} />
          <span>Registrar movimiento</span>
        </button>
      </TopbarAction>

      <Card as="section" className="page-panel" aria-labelledby="kardex-title">
        <header className="page-panel__header">
          <div>
            <h2 id="kardex-title" className="page-panel__title">
              Movimientos de kardex
            </h2>
            <p className="page-panel__subtitle">
              {totalItems} de {movimientos.length} movimientos
            </p>
          </div>
        </header>

        <div className="page-toolbar">
          <div className="kardex-search">
            <SearchInput
              value={busqueda}
              onChange={(val) => {
                setBusqueda(val);
                setPaginaActual(1);
              }}
              placeholder="Buscar por producto, tipo o usuario…"
            />
          </div>

          <div
            className="kardex-chips"
            role="group"
            aria-label="Filtrar por tipo de movimiento"
          >
            <Chip
              active={tipoFiltro === 'todos'}
              count={movimientos.length}
              onClick={() => {
                setTipoFiltro('todos');
                setPaginaActual(1);
              }}
            >
              Todas
            </Chip>

            {TIPOS.map((tipo) => (
              <Chip
                key={tipo}
                active={tipoFiltro === tipo}
                count={contarTipo(tipo)}
                onClick={() => {
                  setTipoFiltro(tipo);
                  setPaginaActual(1);
                }}
              >
                {tipo}
              </Chip>
            ))}
          </div>
        </div>

        <DataTable
          columns={columnas}
          rows={paginados}
          rowKey={(m) => m.id}
          loading={loading}
          error={error}
          loadingMessage="Cargando kardex…"
          minWidth={900}
          emptyTitle={
            hayFiltros
              ? 'No se encontraron movimientos'
              : 'Aún no hay movimientos'
          }
          emptyMessage={
            hayFiltros
              ? 'Prueba con otro término de búsqueda o cambia el tipo de movimiento.'
              : 'Registra la primera entrada o salida con el botón de la barra superior.'
          }
          emptyIcon={<IconKardex size={30} />}
        />

        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
          resourceName="movimientos"
        />
      </Card>

      <Modal
        isOpen={modalRegistroOpen}
        onClose={() => setModalRegistroOpen(false)}
        title="Registrar movimiento"
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

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
              <small>
                Stock disponible:{' '}
                <strong>{productoSeleccionadoActual.stock} unds.</strong>
              </small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo_movimiento">Tipo de movimiento *</label>
              <select
                id="tipo_movimiento"
                name="tipo_movimiento"
                required
                value={form.tipo_movimiento}
                onChange={handleChange}
              >
                <option value="Entrada">Entrada (aumenta stock)</option>
                <option value="Salida">Salida (disminuye stock)</option>
                <option value="Ajuste">Ajuste (modificación)</option>
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
              placeholder="Ej. Compra a proveedor, devolución, merma de almacén…"
              value={form.observaciones}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalRegistroOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Registrando…' : 'Registrar movimiento'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        title={`Detalle de movimiento #${movimientoSeleccionado?.id ?? ''}`}
      >
        {movimientoSeleccionado && (
          <div className="kardex-detail-grid">
            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Producto</span>
              <span className="kardex-detail-value">
                {movimientoSeleccionado.Producto?.nombre}
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Tipo de movimiento</span>
              <span className="kardex-detail-value">
                <Badge tipo={movimientoSeleccionado.tipo_movimiento}>
                  {movimientoSeleccionado.tipo_movimiento}
                </Badge>
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Cantidad afectada</span>
              <span
                className={`kardex-detail-value kardex-qty ${
                  movimientoSeleccionado.tipo_movimiento === 'Salida'
                    ? 'kardex-qty--out'
                    : 'kardex-qty--in'
                }`}
              >
                {movimientoSeleccionado.tipo_movimiento === 'Salida'
                  ? `-${movimientoSeleccionado.cantidad}`
                  : `+${movimientoSeleccionado.cantidad}`}{' '}
                unidades
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Stock actual del producto</span>
              <span className="kardex-detail-value">
                {movimientoSeleccionado.Producto?.stock ?? '-'} unds.
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Usuario responsable</span>
              <span className="kardex-detail-value">
                {movimientoSeleccionado.Usuario?.nombre || 'Sistema'}
              </span>
            </div>

            <div className="kardex-detail-item">
              <span className="kardex-detail-label">Fecha y hora de registro</span>
              <span className="kardex-detail-value">
                {new Date(
                  movimientoSeleccionado.fecha_hora ||
                    movimientoSeleccionado.createdAt
                ).toLocaleString('es-PE')}
              </span>
            </div>

            <div className="kardex-detail-item kardex-detail-item--full">
              <span className="kardex-detail-label">Observaciones</span>
              <span className="kardex-detail-value">
                {movimientoSeleccionado.observaciones ||
                  'Sin observaciones registradas.'}
              </span>
            </div>
          </div>
        )}

        <div className="form-actions kardex-detail-actions">
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
