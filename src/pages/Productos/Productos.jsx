import { useEffect, useState } from 'react';
import './Productos.css';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../../api/productos';
import { getCategorias } from '../../api/categorias';
import { getProveedores } from '../../api/proveedores';
import Modal from '../../components/Modal/Modal';
import { TopbarAction } from '../../components/Layout/TopbarAction';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import DataTable from '../../components/ui/DataTable';
import {
  IconPlus,
  IconEdit,
  IconDelete,
  IconProductos,
} from '../../components/Icons/Icons';

const formVacio = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: 0,
  categoria_id: '',
  proveedor_id: '',
};

const fetchProductosData = () =>
  Promise.all([getProductos(), getCategorias(), getProveedores()]);

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  useEffect(() => {
    let cancelado = false;

    fetchProductosData()
      .then(([prods, cats, provs]) => {
        if (cancelado) return;
        setProductos(prods);
        setCategorias(cats);
        setProveedores(provs);
        setError('');
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err.response?.data?.error || 'Error al cargar los productos');
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
      const [prods, cats, provs] = await fetchProductosData();
      setProductos(prods);
      setCategorias(cats);
      setProveedores(provs);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setEditandoId(null);
    setForm(formVacio);
    setFormError('');
    setModalOpen(true);
  };

  const abrirModalEditar = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre || '',
      descripcion: p.descripcion || '',
      precio: p.precio || '',
      stock: p.stock ?? 0,
      categoria_id: p.categoria_id || '',
      proveedor_id: p.proveedor_id || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditandoId(null);
    setForm(formVacio);
    setFormError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) {
      setFormError('El nombre del producto es obligatorio');
      return;
    }
    if (!form.categoria_id) {
      setFormError('Debes seleccionar una categoría');
      return;
    }
    if (Number(form.precio) < 0 || form.precio === '') {
      setFormError('El precio debe ser un número positivo');
      return;
    }
    if (Number(form.stock) < 0 || form.stock === '') {
      setFormError('El stock debe ser un número entero mayor o igual a 0');
      return;
    }

    setGuardando(true);
    setFormError('');

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10),
      categoria_id: parseInt(form.categoria_id, 10),
      proveedor_id: form.proveedor_id ? parseInt(form.proveedor_id, 10) : null,
    };

    try {
      if (editandoId) {
        await updateProducto(editandoId, payload);
      } else {
        await createProducto(payload);
      }
      cerrarModal();
      await cargarDatos();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      return;
    }
    try {
      await deleteProducto(id);
      await cargarDatos();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar el producto');
    }
  };

  // Filtrado por categoría + búsqueda, antes de paginar
  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria =
      categoriaFiltro === 'todas' || String(p.categoria_id) === categoriaFiltro;
    const nombre = (p.nombre || '').toLowerCase();
    const categoria = (p.Categoria?.nombre || '').toLowerCase();
    const query = busqueda.toLowerCase().trim();
    const coincideBusqueda = nombre.includes(query) || categoria.includes(query);

    return coincideCategoria && coincideBusqueda;
  });

  const totalItems = productosFiltrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const productosPaginados = productosFiltrados.slice(
    indiceInicio,
    indiceInicio + itemsPorPagina
  );

  const hayFiltros = busqueda.trim() !== '' || categoriaFiltro !== 'todas';

  const columnas = [
    {
      key: 'id',
      header: 'ID',
      width: 64,
      render: (p) => <span className="product-id">#{p.id}</span>,
    },
    {
      key: 'nombre',
      header: 'Producto',
      render: (p) => (
        <div className="product-cell">
          <span className="product-cell__name">{p.nombre}</span>
          {p.descripcion && (
            <span className="product-cell__desc">{p.descripcion}</span>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (p) => p.Categoria?.nombre || '—',
    },
    {
      key: 'precio',
      header: 'Precio',
      align: 'right',
      render: (p) => (
        <span className="product-price">
          S/ {Number(p.precio).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => {
        const stockBajo = Number(p.stock) <= 5;
        return (
          <span
            className={`stock-pill ${stockBajo ? 'stock-pill--low' : ''}`}
            aria-label={`${p.stock} unidades${stockBajo ? ', stock bajo' : ''}`}
          >
            <span className="stock-pill__dot" aria-hidden="true" />
            {p.stock} unds.
          </span>
        );
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: 176,
      align: 'center',
      render: (p) => (
        <div className="product-actions">
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={() => abrirModalEditar(p)}
            title="Editar producto"
          >
            <IconEdit size={14} />
            <span>Editar</span>
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => handleEliminar(p.id, p.nombre)}
            title="Eliminar producto"
          >
            <IconDelete size={14} />
            <span>Eliminar</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="productos-page">
      <TopbarAction>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          <IconPlus size={16} />
          <span>Nuevo producto</span>
        </button>
      </TopbarAction>

      <Card as="section" className="page-panel" aria-labelledby="productos-title">
        <header className="page-panel__header">
          <div>
            <h2 id="productos-title" className="page-panel__title">
              Productos registrados
            </h2>
            <p className="page-panel__subtitle">
              {totalItems} de {productos.length} productos
            </p>
          </div>
        </header>

        <div className="page-toolbar">
          <div className="productos-search">
            <SearchInput
              value={busqueda}
              onChange={(val) => {
                setBusqueda(val);
                setPaginaActual(1);
              }}
              placeholder="Buscar por nombre o categoría…"
            />
          </div>

          <div
            className="productos-chips"
            role="group"
            aria-label="Filtrar por categoría"
          >
            <Chip
              active={categoriaFiltro === 'todas'}
              count={productos.length}
              onClick={() => {
                setCategoriaFiltro('todas');
                setPaginaActual(1);
              }}
            >
              Todas
            </Chip>

            {categorias.map((c) => (
              <Chip
                key={c.id}
                active={categoriaFiltro === String(c.id)}
                count={
                  productos.filter(
                    (p) => String(p.categoria_id) === String(c.id)
                  ).length
                }
                onClick={() => {
                  setCategoriaFiltro(String(c.id));
                  setPaginaActual(1);
                }}
              >
                {c.nombre}
              </Chip>
            ))}
          </div>
        </div>

        <DataTable
          columns={columnas}
          rows={productosPaginados}
          rowKey={(p) => p.id}
          loading={loading}
          error={error}
          loadingMessage="Cargando productos…"
          minWidth={760}
          emptyTitle={
            hayFiltros ? 'No se encontraron productos' : 'Aún no hay productos'
          }
          emptyMessage={
            hayFiltros
              ? 'Prueba con otro término de búsqueda o selecciona otra categoría.'
              : 'Crea tu primer producto con el botón de la barra superior.'
          }
          emptyIcon={<IconProductos size={30} />}
        />

        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
          resourceName="productos"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar producto' : 'Nuevo producto'}
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del producto *</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              placeholder="Ej. Teclado mecánico RGB"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows="3"
              placeholder="Características o detalles del producto"
              value={form.descripcion}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio">Precio (S/) *</label>
              <input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={form.precio}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock inicial *</label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                required
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoria_id">Categoría *</label>
              <select
                id="categoria_id"
                name="categoria_id"
                required
                value={form.categoria_id}
                onChange={handleChange}
              >
                <option value="">-- Selecciona categoría --</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="proveedor_id">Proveedor (opcional)</label>
              <select
                id="proveedor_id"
                name="proveedor_id"
                value={form.proveedor_id}
                onChange={handleChange}
              >
                <option value="">-- Ninguno / Sin asignar --</option>
                {proveedores.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.razon_social}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando
                ? 'Guardando…'
                : editandoId
                  ? 'Actualizar producto'
                  : 'Crear producto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
