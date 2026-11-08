import { useEffect, useState } from 'react';
import './Categorias.css';
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../api/categorias';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { TopbarAction } from '../../components/Layout/TopbarAction';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import { requestConfirm } from '../../lib/confirm';
import { toast } from '../../lib/toast';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import {
  IconPlus,
  IconEdit,
  IconDelete,
  IconCategorias,
} from '../../components/Icons/Icons';

const formVacio = { nombre: '', descripcion: '' };

const mensajeError = (err, porDefecto) =>
  err.response?.data?.error || err.response?.data?.message || porDefecto;

export default function Categorias() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';

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

  useEffect(() => {
    let cancelado = false;

    getCategorias()
      .then((data) => {
        if (cancelado) return;
        setCategorias(data);
        setError('');
      })
      .catch((err) => {
        if (!cancelado) {
          setError(mensajeError(err, 'Error al cargar categorías'));
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
      setError('');
    } catch (err) {
      setError(mensajeError(err, 'Error al cargar categorías'));
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
        toast.success('Categoría actualizada');
      } else {
        await createCategoria(payload);
        toast.success('Categoría creada');
      }
      cerrarModal();
      await cargarCategorias();
    } catch (err) {
      setFormError(mensajeError(err, 'Error al guardar la categoría'));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    const confirmado = await requestConfirm({
      title: 'Eliminar categoría',
      message: `¿Estás seguro de eliminar la categoría "${nombre}"?`,
      confirmLabel: 'Eliminar',
      tone: 'danger',
    });
    if (!confirmado) return;

    try {
      await deleteCategoria(id);
      toast.success('Categoría eliminada');
      await cargarCategorias();
    } catch (err) {
      toast.error(
        mensajeError(
          err,
          'No se puede eliminar la categoría si tiene productos asignados'
        )
      );
    }
  };

  const filtradas = categorias.filter((c) =>
    (c.nombre || '').toLowerCase().includes(busqueda.toLowerCase().trim())
  );

  const totalItems = filtradas.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginadas = filtradas.slice(indiceInicio, indiceInicio + itemsPorPagina);
  const hayBusqueda = busqueda.trim() !== '';

  const columnas = [
    {
      key: 'id',
      header: 'ID',
      width: 64,
      render: (c) => <span className="row-id">#{c.id}</span>,
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (c) => <span className="cat-name">{c.nombre}</span>,
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (c) =>
        c.descripcion || <span className="muted-cell">Sin descripción</span>,
    },
    {
      key: 'productos',
      header: 'Productos',
      width: 110,
      align: 'center',
      render: (c) => {
        const cantProductos = c.Productos ? c.Productos.length : 0;
        return (
          <span
            className="cant-badge"
            aria-label={`${cantProductos} productos`}
          >
            {cantProductos}
          </span>
        );
      },
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: 176,
      align: 'center',
      render: (c) => (
        <div className="table-actions table-actions--center">
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={() => abrirModalEditar(c)}
            title="Editar categoría"
          >
            <IconEdit size={14} />
            <span>Editar</span>
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => handleEliminar(c.id, c.nombre)}
            title="Eliminar categoría"
          >
            <IconDelete size={14} />
            <span>Eliminar</span>
          </button>
        </div>
      ),
    },
  ];

  // Solo el Administrador ve la columna de acciones
  const columnasVisibles = esAdmin
    ? columnas
    : columnas.filter((c) => c.key !== 'acciones');

  return (
    <div className="categorias-page">
      {esAdmin && (
        <TopbarAction>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <IconPlus size={16} />
            <span>Nueva categoría</span>
          </button>
        </TopbarAction>
      )}

      <Card as="section" className="page-panel" aria-labelledby="categorias-title">
        <header className="page-panel__header">
          <div>
            <h2 id="categorias-title" className="page-panel__title">
              Categorías registradas
            </h2>
            <p className="page-panel__subtitle">
              {totalItems} de {categorias.length} categorías
            </p>
          </div>
        </header>

        <div className="page-toolbar">
          <SearchInput
            value={busqueda}
            onChange={(val) => {
              setBusqueda(val);
              setPaginaActual(1);
            }}
            placeholder="Buscar por nombre…"
          />
        </div>

        <DataTable
          columns={columnasVisibles}
          rows={paginadas}
          rowKey={(c) => c.id}
          loading={loading}
          error={error}
          loadingMessage="Cargando categorías…"
          minWidth={680}
          emptyTitle={
            hayBusqueda
              ? 'No se encontraron categorías'
              : 'Aún no hay categorías'
          }
          emptyMessage={
            hayBusqueda
              ? 'Prueba con otro término de búsqueda.'
              : esAdmin
                ? 'Crea tu primera categoría con el botón de la barra superior.'
                : 'Todavía no se han registrado categorías.'
          }
          emptyIcon={<IconCategorias size={30} />}
        />

        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
          resourceName="categorías"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar categoría' : 'Nueva categoría'}
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre de la categoría *</label>
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

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando
                ? 'Guardando…'
                : editandoId
                  ? 'Actualizar categoría'
                  : 'Guardar categoría'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}