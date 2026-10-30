import { useEffect, useState } from 'react';
import api from '../services/api';

const vacio = { productoId: '', tipo_movimiento: 'Entrada', cantidad: '', observaciones: '' };

export default function Kardex() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    api.get('/productos')
      .then(({ data }) => setProductos(data))
      .catch(() => setError('No se pudieron cargar los productos'));
  }, [version]); // se recarga también para ver el stock actualizado

  useEffect(() => {
    api.get('/movimientos')
      .then(({ data }) => setMovimientos(data))
      .catch(() => setError('No se pudo cargar el kardex'));
  }, [version]);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.productoId) return setError('Selecciona un producto');
    try {
      // usuarioId fijo = 1 mientras no haya login
      await api.post('/movimientos', { ...form, usuarioId: 1 });
      setForm(vacio);
      setError('');
      setVersion((v) => v + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el movimiento');
    }
  };

  const filtrados = movimientos.filter((m) =>
    `${m.Producto?.nombre || ''} ${m.tipo_movimiento}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <>
      <h2>Kardex / Movimientos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={guardar}>
        <select required value={form.productoId}
          onChange={(e) => setForm({ ...form, productoId: e.target.value })}>
          <option value="">-- Producto --</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>
          ))}
        </select>

        <select value={form.tipo_movimiento}
          onChange={(e) => setForm({ ...form, tipo_movimiento: e.target.value })}>
          <option>Entrada</option>
          <option>Salida</option>
          <option>Ajuste</option>
        </select>

        <input type="number" min="1" placeholder="Cantidad" required value={form.cantidad}
          onChange={(e) => setForm({ ...form, cantidad: e.target.value })} />
        <input placeholder="Observaciones" value={form.observaciones}
          onChange={(e) => setForm({ ...form, observaciones: e.target.value })} />
        <button>Registrar movimiento</button>
      </form>

      <input placeholder="Buscar por producto o tipo..."
        value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

      <table>
        <thead>
          <tr><th>ID</th><th>Fecha / Hora</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Observaciones</th></tr>
        </thead>
        <tbody>
          {filtrados.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{new Date(m.fecha_hora || m.createdAt).toLocaleString('es-PE')}</td>
              <td>{m.Producto?.nombre}</td>
              <td>{m.tipo_movimiento}</td>
              <td>{m.tipo_movimiento === 'Salida' ? `-${m.cantidad}` : `+${m.cantidad}`}</td>
              <td>{m.observaciones}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}