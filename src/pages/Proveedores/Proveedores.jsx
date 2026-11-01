import { useEffect, useState } from 'react';
import './Proveedores.css';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../api/proveedores';
import Modal from '../../components/Modal/Modal';
import SearchInput from '../../components/SearchInput/SearchInput';
import Pagination from '../../components/Pagination/Pagination';
import { IconPlus, IconEdit, IconDelete } from '../../components/Icons/Icons';

const formVacio = {
  razon_social: '',
  contacto: '',
  telefono: '',
  email: '',
};

export default function Proveedores() {
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

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const data = await getProveedores();
      setProveedores(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProveedores();
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
      razon_social: p.razon_social || '',
      contacto: p.contacto || '',
      telefono: p.telefono || '',
      email: p.email || '',
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
    if (!form.razon_social.trim()) {
      setFormError('La razón social es obligatoria');
      return;
    }

    setGuardando(true);
    setFormError('');

    const payload = {
      razon_social: form.razon_social.trim(),
      contacto: form.contacto?.trim() || null,
      telefono: form.telefono?.trim() || null,
      email: form.email?.trim() || null,
    };

    try {
      if (editandoId) {
        await updateProveedor(editandoId, payload);
      } else {
        await createProveedor(payload);
      }
      cerrarModal();
      await cargarProveedores();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error al guardar el proveedor');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, razonSocial) => {
    if (!window.confirm(`¿Estás seguro de eliminar al proveedor "${razonSocial}"?`)) {
      return;
    }
    try {
      await deleteProveedor(id);
      await cargarProveedores();
    } catch (err) {
      alert(err.response?.data?.error || 'No se puede eliminar el proveedor si tiene productos asociados');
    }
  };

  // Filtrado por Razón Social o Contacto
  const filtrados = proveedores.filter((p) => {
    const rs = (p.razon_social || '').toLowerCase();
    const contacto = (p.contacto || '').toLowerCase();
    const query = busqueda.toLowerCase().trim();
    return rs.includes(query) || contacto.includes(query);
  });

  // Paginación
  const totalItems = filtrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);

  return (
    <div className="proveedores-page">
      <div className="page-header">
        <h2 className="page-title">Proveedores</h2>
        <button className="btn btn-primary" onClick={abrirModalNuevo}>
          <IconPlus size={16} />
          <span>+ Nuevo Proveedor</span>
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
            placeholder="Buscar por Razón Social o Contacto…"
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Razón Social</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-state">Cargando proveedores...</td>
                </tr>
              ) : paginados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {busqueda ? 'No se encontraron proveedores coincidentes' : 'No hay proveedores registrados'}
                  </td>
                </tr>
              ) : (
                paginados.map((p) => (
                  <tr key={p.id}>
                    <td><strong>#{p.id}</strong></td>
                    <td><strong>{p.razon_social}</strong></td>
                    <td>{p.contacto || '-'}</td>
                    <td>{p.telefono || '-'}</td>
                    <td>
                      {p.email ? (
                        <a href={`mailto:${p.email}`} style={{ color: 'var(--color-primary)' }}>
                          {p.email}
                        </a>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'center' }}>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => abrirModalEditar(p)}
                          title="Editar proveedor"
                        >
                          <IconEdit size={14} />
                          <span>Editar</span>
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleEliminar(p.id, p.razon_social)}
                          title="Eliminar proveedor"
                        >
                          <IconDelete size={14} />
                          <span>Eliminar</span>
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
          resourceName="proveedores"
        />
      </div>

      {/* Modal Nuevo / Editar Proveedor */}
      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      >
        {formError && <div className="alert alert-danger">{formError}</div>}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="razon_social">Razón Social / Empresa *</label>
            <input
              id="razon_social"
              name="razon_social"
              type="text"
              required
              placeholder="Ej. Distribuidora Tecnológica S.A.C."
              value={form.razon_social}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="contacto">Nombre de Contacto</label>
            <input
              id="contacto"
              name="contacto"
              type="text"
              placeholder="Ej. Juan Pérez"
              value={form.contacto}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                name="telefono"
                type="text"
                placeholder="Ej. 987654321"
                value={form.telefono}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="ventas@proveedor.pe"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando ? 'Guardando…' : editandoId ? 'Actualizar Proveedor' : 'Guardar Proveedor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
