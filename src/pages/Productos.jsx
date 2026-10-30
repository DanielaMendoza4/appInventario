import { useEffect, useState } from 'react';
import api from '../services/api';

const vacio = { nombre: '', descripcion: '', precio: '', stock: 0, categoriaId: '' };

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  // Categorías para el <select>
  useEffect(() => {
    api.get('/categorias')
      .then(({ data }) => setCategorias(data))
      .catch(() => setError('No se pudieron cargar las categorías'));
  }, []);

  useEffect(() => {
    api.get('/productos')
      .then(({ data }) => setProductos(data))
      .catch(() => setError('No se pudo cargar la lista de productos'));
  }, [version]);

  const recargar = () => setVersion((v) => v + 1);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.categoriaId) return setError('Selecciona una categoría');
    try {
      if (editandoId) await api.put(`/productos/${editandoId}`, form);
      else await api.post('/productos', form);
      setForm(vacio);
      setEditandoId(null);
      setError('');
      recargar();
    } catch {
      setError('No se pudo guardar el producto');
    }
  };

  const editar = (p) => {
    setEditandoId(p.id);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
      categoriaId: p.categoriaId,
    });
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      recargar();
    } catch {
      setError('No se pudo eliminar el producto');
    }
  };

  const nombreCategoria = (p) =>
    p.Categoria?.nombre ||
    categorias.find((c) => c.id === p.categoriaId)?.nombre ||
    '-';

  const filtrados = productos.filter((p) =>
    `${p.nombre} ${nombreCategoria(p)}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <h2>Productos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={guardar}>
        <input placeholder="Nombre" required value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
        <input placeholder="Descripción" value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        <input type="number" step="0.01" placeholder="Precio (S/)" required value={form.precio}
          onChange={(e) => setForm({ ...form, precio: e.target.value })} />
        <input type="number" placeholder="Stock" required value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })} />

        <select required value={form.categoriaId}
          onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
          <option value="">-- Selecciona categoría --</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <button>{editandoId ? 'Actualizar' : 'Guardar'}</button>
      </form>

      <input placeholder="Buscar por nombre o categoría..."
        value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {filtrados.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{nombreCategoria(p)}</td>
              <td>S/ {Number(p.precio).toFixed(2)}</td>
              <td style={{ color: p.stock <= 5 ? 'red' : 'inherit' }}>{p.stock}</td>
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