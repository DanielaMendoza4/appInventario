import { useEffect, useState } from 'react';
import api from '../services/api';

const vacio = { nombre: '', descripcion: '' };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0); // al cambiarlo, se vuelve a cargar la lista

  useEffect(() => {
    api.get('/categorias')
      .then(({ data }) => setCategorias(data))
      .catch(() => setError('No se pudo cargar la lista de categorías'));
  }, [version]);

  const recargar = () => setVersion((v) => v + 1);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const limpiar = () => {
    setForm(vacio);
    setEditandoId(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        await api.put(`/categorias/${editandoId}`, form);
      } else {
        await api.post('/categorias', form);
      }
      limpiar();
      recargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar');
    }
  };

  const editar = (categoria) => {
    setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' });
    setEditandoId(categoria.id);
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    setError('');
    try {
      await api.delete(`/categorias/${id}`);
      recargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const visibles = categorias.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <h2 className="mb-4">Categorías</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-4">
        {/* Formulario */}
        <div className="col-12 col-lg-4">
          <form onSubmit={guardar} className="card card-body">
            <h5 className="mb-3">{editandoId ? 'Editar categoría' : 'Nueva categoría'}</h5>

            <label className="form-label">Nombre</label>
            <input
              className="form-control mb-3"
              name="nombre"
              value={form.nombre}
              onChange={cambiar}
              required
            />

            <label className="form-label">Descripción</label>
            <textarea
              className="form-control mb-3"
              name="descripcion"
              rows="3"
              value={form.descripcion}
              onChange={cambiar}
            />

            <button className="btn btn-primary w-100" type="submit">
              {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
            {editandoId && (
              <button className="btn btn-outline-secondary w-100 mt-2" type="button" onClick={limpiar}>
                Cancelar
              </button>
            )}
          </form>
        </div>

        {/* Lista */}
        <div className="col-12 col-lg-8">
          <input
            className="form-control mb-3"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((c) => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.nombre}</td>
                      <td>{c.descripcion}</td>
                      <td className="text-nowrap">
                        <button className="btn btn-warning btn-sm me-2" onClick={() => editar(c)}>
                          Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => eliminar(c.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visibles.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        No hay categorías para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}