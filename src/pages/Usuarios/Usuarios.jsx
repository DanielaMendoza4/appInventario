import { useEffect, useState } from 'react';
import './Usuarios.css';
import { getUsuarios, createUsuario, updateUsuario } from '../../api/usuarios';
import Modal from '../../components/Modal/Modal';
import Badge from '../../components/Badge/Badge';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import { IconPlus, IconEdit } from '../../components/Icons/Icons';

const formVacio = {
  nombre: '',
  email: '',
  password: '',
  rol: 'Almacenero',
  estado: 'Activo',
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
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

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await getUsuarios();
      setUsuarios(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

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
      password: '', // En blanco al editar para no sobrescribir a menos que el usuario la cambie
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
      email: form.email.trim(),
      rol: form.rol,
      estado: form.estado,
    };

    if (form.password && form.password.trim() !== '') {
      payload.password = form.password;
    }

    try {
      if (editandoId) {
        await updateUsuario(editandoId, payload);
      } else {
        await createUsuario(payload);
      }
      cerrarModal();
      await cargarUsuarios();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar el usuario');
    } finally {
      setGuardando(false);
    }
  };

  const toggleEstado = async (u) => {
    const nuevoEstado = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
    const confirmacion = window.confirm(
      `¿Deseas cambiar el estado del usuario "${u.nombre}" a ${nuevoEstado}?`
    );
    if (!confirmacion) return;

    try {
      await updateUsuario(u.id, { estado: nuevoEstado });
      await cargarUsuarios();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo actualizar el estado');
    }
  };

  // Filtrado por Nombre o Email
  const filtrados = usuarios.filter((u) => {
    const nom = (u.nombre || '').toLowerCase();
    const mail = (u.email || '').toLowerCase();
    const q = busqueda.toLowerCase().trim();
    return nom.includes(q) || mail.includes(q);
  });

  // Paginación
  const totalItems = filtrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h2 className="page-title">Usuarios</h2>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          <IconPlus size={16} />
          <span>+ Nuevo Usuario</span>
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
            placeholder="Buscar por Nombre o Email…"
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Nombre</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Estado</th>
                <th style={{ width: '180px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state">Cargando usuarios...</td>
                </tr>
              ) : paginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {busqueda ? 'No se encontraron usuarios coincidentes' : 'No hay usuarios registrados'}
                  </td>
                </tr>
              ) : (
                paginados.map((u) => (
                  <tr key={u.id}>
                    <td><strong>#{u.id}</strong></td>
                    <td><strong>{u.nombre}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.rol}</td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge tipo={u.estado || 'Activo'}>
                        {u.estado || 'Activo'}
                      </Badge>
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => abrirModalEditar(u)}
                          title="Editar usuario"
                        >
                          <IconEdit size={14} />
                          <span>Editar</span>
                        </button>
                        <button
                          className={`btn btn-sm ${u.estado === 'Activo' ? 'btn-outline-danger' : 'btn-secondary'}`}
                          onClick={() => toggleEstado(u)}
                          title={u.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
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
          resourceName="usuarios"
        />
      </div>

      {/* Modal Nuevo / Editar Usuario */}
      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
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
            <label htmlFor="email">Correo Electrónico *</label>
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
              Contraseña {editandoId ? '(dejar en blanco para mantener la actual)' : '*'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder={editandoId ? '••••••••' : 'Mínimo 6 caracteres'}
              value={form.password}
              onChange={handleChange}
              required={!editandoId}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rol">Rol de Usuario *</label>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Actualizar Usuario' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
