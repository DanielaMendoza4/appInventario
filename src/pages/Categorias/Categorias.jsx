import { useEffect, useState } from 'react';
import './Categorias.css';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../api/categorias';
import Modal from '../../components/Modal/Modal';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import { IconPlus, IconEdit, IconDelete } from '../../components/Icons/Icons';

const formVacio = { nombre: '', descripcion: '' };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
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

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const abrirModalNuevo = () => {
    setEditandoId(null);
    setForm(formVacio);
    setFormError('');
    setModalOpen(true);
  };

  const abrirModalEditar = (c) => {
    setEditandoId(c.id);
    setForm({
      nombre: c.nombre || '',
      descripcion: c.descripcion || '',
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
      setFormError('El nombre de la categoría es obligatorio');
      return;
    }

    setGuardando(true);
    setFormError('');

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion?.trim() || null,
    };

    try {
      if (editandoId) {
        await updateCategoria(editandoId, payload);
      } else {
        await createCategoria(payload);
      }
      cerrarModal();
      await cargarCategorias();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar la categoría');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      return;
    }
    try {
      await deleteCategoria(id);
      await cargarCategorias();
    } catch (err) {
      alert(err.response?.data?.error || 'No se puede eliminar la categoría si tiene productos asignados');
    }
  };

  // Filtrar
  const filtradas = categorias.filter((c) =>
    (c.nombre || '').toLowerCase().includes(busqueda.toLowerCase().trim())
  );

  // Paginar
  const totalItems = filtradas.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginadas = filtradas.slice(indiceInicio, indiceInicio + itemsPorPagina);

  return (
    <div className="categorias-page">
      <div className="page-header">
        <h2 className="page-title">Categorías</h2>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          <IconPlus size={16} />
          <span>+ Nueva Categoría</span>
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
            placeholder="Buscar por nombre..."
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Cant. Productos</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="empty-state">Cargando categorías...</td>
                </tr>
              ) : paginadas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    {busqueda ? 'No se encontraron categorías coincidentes' : 'No hay categorías registradas'}
                  </td>
                </tr>
              ) : (
                paginadas.map((c) => {
                  const cantProductos = c.Productos ? c.Productos.length : 0;
                  return (
                    <tr key={c.id}>
                      <td><strong>#{c.id}</strong></td>
                      <td><strong>{c.nombre}</strong></td>
                      <td>{c.descripcion || <span style={{ color: 'var(--color-text-light)' }}>Sin descripción</span>}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="cant-badge">{cantProductos}</span>
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => abrirModalEditar(c)}
                            title="Editar categoría"
                          >
                            <IconEdit size={14} />
                            <span>Editar</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(c.id, c.nombre)}
                            title="Eliminar categoría"
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
          resourceName="categorías"
        />
      </div>

      {/* Modal Nueva / Editar Categoría */}
      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la Categoría *</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              placeholder="Ej. Audio y Sonido"
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
              placeholder="Breve detalle de la categoría"
              value={form.descripcion}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Actualizar Categoría' : 'Guardar Categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
