import { useEffect, useState } from 'react';
import './Productos.css';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../../api/productos';
import { getCategorias } from '../../api/categorias';
import { getProveedores } from '../../api/proveedores';
import Modal from '../../components/Modal/Modal';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import { IconPlus, IconEdit, IconDelete } from '../../components/Icons/Icons';

const formVacio = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: 0,
  categoria_id: '',
  proveedor_id: '',
};

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
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prods, cats, provs] = await Promise.all([
        getProductos(),
        getCategorias(),
        getProveedores(),
      ]);
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

  useEffect(() => {
    cargarDatos();
  }, []);

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

  // Filtrado de productos por nombre o categoría
  const productosFiltrados = productos.filter((p) => {
    const nombre = (p.nombre || '').toLowerCase();
    const categoria = (p.Categoria?.nombre || '').toLowerCase();
    const query = busqueda.toLowerCase().trim();
    return nombre.includes(query) || categoria.includes(query);
  });

  // Paginación
  const totalItems = productosFiltrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  return (
    <div className="productos-page">
      <div className="page-header">
        <h2 className="page-title">Productos</h2>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          <IconPlus size={16} />
          <span>+ Nuevo Producto</span>
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
            placeholder="Buscar por Nombre o Categoría…"
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state">Cargando productos...</td>
                </tr>
              ) : productosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {busqueda ? 'No se encontraron productos coincidentes' : 'No hay productos registrados'}
                  </td>
                </tr>
              ) : (
                productosPaginados.map((p) => {
                  const stockBajo = Number(p.stock) <= 5;
                  return (
                    <tr key={p.id}>
                      <td><strong>#{p.id}</strong></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                        {p.descripcion && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {p.descripcion}
                          </div>
                        )}
                      </td>
                      <td>{p.Categoria?.nombre || '-'}</td>
                      <td style={{ fontWeight: 600 }}>
                        S/ {Number(p.precio).toFixed(2)}
                      </td>
                      <td>
                        <span className={`stock-pill ${stockBajo ? 'stock-pill--low' : ''}`}>
                          {p.stock} unds.
                          {stockBajo && ' ⚠️'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => abrirModalEditar(p)}
                            title="Editar producto"
                          >
                            <IconEdit size={14} />
                            <span>Editar</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(p.id, p.nombre)}
                            title="Eliminar producto"
                          >
                            <IconDelete size={14} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
          resourceName="productos"
        />
      </div>

      {/* Modal Formulario Nuevo / Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar Producto' : 'Nuevo Producto'}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto *</label>
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
              rows="2"
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
              <label htmlFor="stock">Stock Inicial *</label>
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
              <label htmlFor="proveedor_id">Proveedor (Opcional)</label>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
