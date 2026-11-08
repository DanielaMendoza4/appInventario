import { useEffect, useState } from 'react';
import './Proveedores.css';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../api/proveedores';
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
  IconProveedores,
} from '../../components/Icons/Icons';

const formVacio = {
  razon_social: '',
  contacto: '',
  telefono: '',
  email: '',
};

const mensajeError = (err, porDefecto) =>
  err.response?.data?.error || err.response?.data?.message || porDefecto;

export default function Proveedores() {
  const { user } = useAuth();
  const esAdmin = user?.rol === 'Administrador';

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

  useEffect(() => {
    let cancelado = false;

    getProveedores()
      .then((data) => {
        if (cancelado) return;
        setProveedores(data);
        setError('');
      })
      .catch((err) => {
        if (!cancelado) {
          setError(mensajeError(err, 'Error al cargar proveedores'));
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const cargarProveedores = async () => {
    try {
      setLoading(true);
      const data = await getProveedores();
      setProveedores(data);
      setError('');
    } catch (err) {
      setError(mensajeError(err, 'Error al cargar proveedores'));
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
        toast.success('Proveedor actualizado');
      } else {
        await createProveedor(payload);
        toast.success('Proveedor creado');
      }
      cerrarModal();
      await cargarProveedores();
    } catch (err) {
      setFormError(mensajeError(err, 'Error al guardar el proveedor'));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, razonSocial) => {
    const confirmado = await requestConfirm({
      title: 'Eliminar proveedor',
      message: `¿Estás seguro de eliminar al proveedor "${razonSocial}"?`,
      confirmLabel: 'Eliminar',
      tone: 'danger',
    });
    if (!confirmado) return;

    try {
      await deleteProveedor(id);
      toast.success('Proveedor eliminado');
      await cargarProveedores();
    } catch (err) {
      toast.error(
        mensajeError(
          err,
          'No se puede eliminar el proveedor si tiene productos asociados'
        )
      );
    }
  };

  const filtrados = proveedores.filter((p) => {
    const rs = (p.razon_social || '').toLowerCase();
    const contacto = (p.contacto || '').toLowerCase();
    const query = busqueda.toLowerCase().trim();
    return rs.includes(query) || contacto.includes(query);
  });

  const totalItems = filtrados.length;
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const paginados = filtrados.slice(indiceInicio, indiceInicio + itemsPorPagina);
  const hayBusqueda = busqueda.trim() !== '';

  const columnas = [
    {
      key: 'id',
      header: 'ID',
      width: 64,
      render: (p) => <span className="row-id">#{p.id}</span>,
    },
    {
      key: 'razon_social',
      header: 'Razón social',
      render: (p) => <span className="prov-name">{p.razon_social}</span>,
    },
    {
      key: 'contacto',
      header: 'Contacto',
      render: (p) => p.contacto || <span className="muted-cell">—</span>,
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (p) => p.telefono || <span className="muted-cell">—</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (p) =>
        p.email ? (
          <a className="prov-email" href={`mailto:${p.email}`}>
            {p.email}
          </a>
        ) : (
          <span className="muted-cell">—</span>
        ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: 176,
      align: 'center',
      render: (p) => (
        <div className="table-actions table-actions--center">
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={() => abrirModalEditar(p)}
            title="Editar proveedor"
          >
            <IconEdit size={14} />
            <span>Editar</span>
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => handleEliminar(p.id, p.razon_social)}
            title="Eliminar proveedor"
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
    <div className="proveedores-page">
      {esAdmin && (
        <TopbarAction>
          <button className="btn btn-primary" onClick={abrirModalNuevo}>
            <IconPlus size={16} />
            <span>Nuevo proveedor</span>
          </button>
        </TopbarAction>
      )}

      <Card as="section" className="page-panel" aria-labelledby="proveedores-title">
        <header className="page-panel__header">
          <div>
            <h2 id="proveedores-title" className="page-panel__title">
              Proveedores registrados
            </h2>
            <p className="page-panel__subtitle">
              {totalItems} de {proveedores.length} proveedores
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
            placeholder="Buscar por razón social o contacto…"
          />
        </div>

        <DataTable
          columns={columnasVisibles}
          rows={paginados}
          rowKey={(p) => p.id}
          loading={loading}
          error={error}
          loadingMessage="Cargando proveedores…"
          minWidth={820}
          emptyTitle={
            hayBusqueda
              ? 'No se encontraron proveedores'
              : 'Aún no hay proveedores'
          }
          emptyMessage={
            hayBusqueda
              ? 'Prueba con otro término de búsqueda.'
              : esAdmin
                ? 'Registra tu primer proveedor con el botón de la barra superior.'
                : 'Todavía no se han registrado proveedores.'
          }
          emptyIcon={<IconProveedores size={30} />}
        />

        <Pagination
          totalItems={totalItems}
          itemsPerPage={itemsPorPagina}
          currentPage={paginaActual}
          onPageChange={setPaginaActual}
          resourceName="proveedores"
        />
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editandoId ? 'Editar proveedor' : 'Nuevo proveedor'}
      >
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}

        <form onSubmit={handleGuardar} className="form-grid">
          <div className="form-group">
            <label htmlFor="razon_social">Razón social / Empresa *</label>
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
            <label htmlFor="contacto">Nombre de contacto</label>
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
              <label htmlFor="email">Correo electrónico</label>
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

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={guardando}>
              {guardando
                ? 'Guardando…'
                : editandoId
                  ? 'Actualizar proveedor'
                  : 'Guardar proveedor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}