import { useEffect, useState } from 'react';
import './Usuarios.css';
import { getUsuarios, createUsuario, updateUsuario } from '../../api/usuarios';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal/Modal';
import { TopbarAction } from '../../components/Layout/TopbarAction';
import Badge from '../../components/Badge/Badge';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import { requestConfirm } from '../../lib/confirm';
import { toast } from '../../lib/toast';
import Card from '../../components/ui/Card';
import Chip from '../../components/ui/Chip';
import DataTable from '../../components/ui/DataTable';
import {
  IconPlus,
  IconEdit,
  IconUsuarios,
} from '../../components/Icons/Icons';

const formVacio = {
  nombre: '',
  email: '',
  password: '',
  rol: 'Almacenero',
  estado: 'Activo',
};

const estadoDe = (u) => u.estado || 'Activo';

const mensajeError = (err, porDefecto) =>
  err.response?.data?.error || err.response?.data?.message || porDefecto;

export default function Usuarios() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';

  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(esAdmin);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 5;

  useEffect(() => {
    // Solo el Administrador consulta la lista de usuarios
    if (!esAdmin) {
      setLoading(false);
      return undefined;
    }

    let cancelado = false;

    getUsuarios()
      .then((data) => {
        if (cancelado) return;
        setUsuarios(data);
        setError('');
      })
      .catch((err) => {
        if (!cancelado) {
          setError(mensajeError(err, 'Error al cargar usuarios'));
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [esAdmin]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
      setError('');
    } catch (err) {
      setError(mensajeError(err, 'Error al cargar usuarios'));
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

  const abrirModalEditar = (u) => {
    setEditandoId(u.id);
    setForm({
      nombre: u.nombre || '',
      email: u.email || '',
      password: '',
      rol: u.rol || 'Almacenero',
      estado: u.estado || 'Activo',
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
      setFormError('El nombre es obligatorio');
      return;
    }
    if (!form.email.trim()) {
      setFormError('El correo es obligatorio');
      return;
    }
    if (!editandoId && (!form.password || form.password.length < 6)) {
      setFormError('La contraseña es obligatoria y debe tener al menos 6 caracteres');
      return;
    }

    setGuardando(true);
    setFormError('');

    const payload = {
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      rol: form.rol,
      estado: form.estado,
    };

    if (form.password && form.password.trim() !== '') {
      payload.password = form.password;
    }

    try {
      if (editandoId) {
        await updateUsuario(editandoId, payload);
        toast.success('Usuario actualizado');
      } else {
        await createUsuario(payload);
        toast.success('Usuario creado');
      }
      cerrarModal();
      await cargarUsuarios();
    } catch (err) {
      setFormError(mensajeError(err, 'Error al guardar el usuario'));
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (u) => {
    const nuevoEstado = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const confirmado = await requestConfirm({
      title: 'Cambiar estado del usuario',
      message: `¿Deseas cambiar el estado del usuario "${u.nombre}" a ${nuevoEstado}?`,
      confirmLabel: 'Cambiar estado',
      tone: u.estado === 'Activo' ? 'danger' : 'default',
    });
    if (!confirmado) return;

    try {
      await updateUsuario(u.id, { estado: nuevoEstado });
      toast.success(
        nuevoEstado === 'Activo'
          ? 'Usuario activado'
          : 'Usuario desactivado'
      );
      await cargarUsuarios();
    } catch (err) {
      toast.error(mensajeError(err, 'No se pudo actualizar el estado'));
    }
  };

  // Filtrado por estado + búsqueda, antes de paginar
  const filtrados = usuarios.filter((u) => {
    const coincideEstado =
      estadoFiltro === 'todos' || estadoDe(u) === estadoFiltro;
    const nom = (u.nombre || '').toLowerCase();
    const mail = (u.email || '').toLowerCase();
    const q = busqueda.toLowerCase().trim();
    const coincideBusqueda = nom.includes(q) || mail.includes(q);

    return coincideEstado && coincideBusqueda;
  });

  const totalItems = filtrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);
  const hayFiltros = busqueda.trim() !== '' || estadoFiltro !== 'todos';

  const totalActivos = usuarios.filter((u) => estadoDe(u) === 'Activo').length;
  const totalInactivos = usuarios.length - totalActivos;

  const columnas = [
    {
      key: 'id',
      header: 'ID',
      width: 64,
      render: (u) => <span className="row-id">#{u.id}</span>,
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (u) => <span className="user-name">{u.nombre}</span>,
    },
    {
      key: 'email',
      header: 'Correo electrónico',
      render: (u) => <span className="user-email">{u.email}</span>,
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (u) => u.rol || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      width: 120,
      align: 'center',
      render: (u) => (
        <Badge tipo={estadoDe(u)}>{estadoDe(u)}</Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: 200,
      align: 'center',
      render: (u) => (
        <div className="table-actions table-actions--center">
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={() => abrirModalEditar(u)}
            title="Editar usuario"
          >
            <IconEdit size={14} />
            <span>Editar</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              u.estado === 'Activo' ? 'btn-outline-danger' : 'btn-secondary'
            }`}
            onClick={() => toggleEstado(u)}
            title={
              u.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'
            }
          >
            {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      ),
    },
  ];

  // Quien no es Administrador no gestiona usuarios
  if (!esAdmin) {
    return (
      <div className="usuarios-page">
        <Card as="section" className="page-panel">
          <header className="page-panel__header">
            <div>
              <h2 className="page-panel__title">Acceso restringido</h2>
              <p className="page-panel__subtitle">
                Solo un Administrador puede ver y gestionar los usuarios del sistema.
              </p>
            </div>
          </header>
        </Card>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      <TopbarAction>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          <IconPlus size={16} />
          <span>Nuevo usuario</span>
        </button>
      </TopbarAction>

      <Card as="section" className="page-panel" aria-labelledby="usuarios-title">
        <header className="page-panel__header">
          <div>
            <h2 id="usuarios-title" className="page-panel__title">
              Usuarios registrados
            </h2>
            <p className="page-panel__subtitle">
              {totalItems} de {usuarios.length} usuarios
            </p>
          </div>
        </header>

        <div className="page-toolbar">
          <div className="usuarios-search">
            <SearchInput
              value={busqueda}
              onChange={(val) => {
                setBusqueda(val);
                setPaginaActual(1);
              }}
              placeholder="Buscar por nombre o email…"
            />
          </div>

          <div
            className="usuarios-chips"
            role="group"
            aria-label="Filtrar por estado"
          >
            <Chip
              active={estadoFiltro === 'todos'}
              count={usuarios.length}
              onClick={() => {
                setEstadoFiltro('todos');
                setPaginaActual(1);
              }}
            >
              Todos
            </Chip>
            <Chip
              active={estadoFiltro === 'Activo'}
              count={totalActivos}
              onClick={() => {
                setEstadoFiltro('Activo');
                setPaginaActual(1);
              }}
            >
              Activos
            </Chip>
            <Chip
              active={estadoFiltro === 'Inactivo'}
              count={totalInactivos}
              onClick={() => {
                setEstadoFiltro('Inactivo');
                setPaginaActual(1);
              }}
            >
              Inactivos
            </Chip>
          </div>
        </div>

        <DataTable
          columns={columnas}
          rows={paginados}
          rowKey={(u) => u.id}
          loading={loading}
          error={error}
          loadingMessage="Cargando usuarios…"
          minWidth={820}
          emptyTitle={
            hayFiltros ? 'No se encontraron usuarios' : 'Aún no hay usuarios'
          }
          emptyMessage={
            hayFiltros
              ? 'Prueba con otro término de búsqueda o cambia el estado.'
              : 'Crea el primer usuario con el botón de la barra superior.'
          }
          emptyIcon={<IconUsuarios size={30} />}
        />

        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
          resourceName="usuarios"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar usuario' : 'Nuevo usuario'}
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo *</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              placeholder="Ej. Daniela Mendoza"
              value={form.nombre}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="ejemplo@inventario.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Contraseña{' '}
              {editandoId
                ? '(dejar en blanco para mantener la actual)'
                : '*'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={
                editandoId ? '••••••••' : 'Mínimo 6 caracteres'
              }
              value={form.password}
              onChange={handleChange}
              required={!editandoId}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rol">Rol de usuario *</label>
              <select
                id="rol"
                name="rol"
                required
                value={form.rol}
                onChange={handleChange}
              >
                <option value="Administrador">Administrador</option>
                <option value="Almacenero">Almacenero</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado *</label>
              <select
                id="estado"
                name="estado"
                required
                value={form.estado}
                onChange={handleChange}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
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
                  ? 'Actualizar usuario'
                  : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}