import { useEffect, useState } from 'react';
import api from '../services/api';

const vacio = { razon_social: '', contacto: '', telefono: '', email: '' };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    api.get('/proveedores')
      .then(({ data }) => setProveedores(data))
      .catch(() => setError('No se pudo cargar la lista de proveedores'));
  }, [version]);

  const recargar = () => setVersion((v) => v + 1);

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) await api.put(`/proveedores/${editandoId}`, form);
      else await api.post('/proveedores', form);
      setForm(vacio);
      setEditandoId(null);
      setError('');
      recargar();
    } catch {
      setError('No se pudo guardar el proveedor');
    }
  };

  const editar = (p) => {
    setEditandoId(p.id);
    setForm({
      razon_social: p.razon_social,
      contacto: p.contacto,
      telefono: p.telefono,
      email: p.email,
    });
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar proveedor?')) return;
    try {
      await api.delete(`/proveedores/${id}`);
      recargar();
    } catch {
      setError('No se pudo eliminar (puede tener productos asociados)');
    }
  };

  const filtrados = proveedores.filter((p) =>
    `${p.razon_social} ${p.contacto}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <h2>Proveedores</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={guardar}>
        <input placeholder="Razón social" required value={form.razon_social}
          onChange={(e) => setForm({ ...form, razon_social: e.target.value })} />
        <input placeholder="Contacto" value={form.contacto}
          onChange={(e) => setForm({ ...form, contacto: e.target.value })} />
        <input placeholder="Teléfono" value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
        <input type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <button>{editandoId ? 'Actualizar' : 'Guardar'}</button>
      </form>

      <input placeholder="Buscar por razón social o contacto..."
        value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <table>
        <thead>
          <tr><th>ID</th><th>Razón Social</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {filtrados.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.razon_social}</td><td>{p.contacto}</td>
              <td>{p.telefono}</td><td>{p.email}</td>
              <td>
                <button onClick={() => editar(p)}>Editar</button>
                <button onClick={() => eliminar(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}