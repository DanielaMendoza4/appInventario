import { useEffect, useState } from 'react';
import api from '../services/api';

const LIMITE_BAJO_STOCK = 5;

export default function Dashboard() {
  const [datos, setDatos] = useState({
    productos: [], categorias: [], proveedores: [], movimientos: [],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/productos'),
      api.get('/categorias'),
      api.get('/proveedores'),
      api.get('/movimientos'),
    ])
      .then(([p, c, pr, m]) =>
        setDatos({
          productos: p.data, categorias: c.data,
          proveedores: pr.data, movimientos: m.data,
        })
      )
      .catch(() => setError('No se pudieron cargar los indicadores'));
  }, []);

  const bajoStock = datos.productos.filter((p) => p.stock <= LIMITE_BAJO_STOCK);

  const tarjetas = [
    ['Total Productos', datos.productos.length],
    ['Categorías', datos.categorias.length],
    ['Proveedores', datos.proveedores.length],
    ['Bajo Stock (Alertas)', bajoStock.length],
  ];

  return (
    <>
      <h2>Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {tarjetas.map(([titulo, valor]) => (
          <div key={titulo}
            style={{ flex: 1, minWidth: 160, padding: 16, borderRadius: 8,
                     background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.15)' }}>
            <small>{titulo}</small>
            <h1 style={{ margin: 0, color: titulo.startsWith('Bajo') && valor > 0 ? 'red' : 'inherit' }}>
              {valor}
            </h1>
          </div>
        ))}
      </div>

      <h3>Movimientos recientes</h3>
      <table>
        <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th></tr></thead>
        <tbody>
          {datos.movimientos.slice(0, 5).map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.fecha_hora || m.createdAt).toLocaleDateString('es-PE')}</td>
              <td>{m.Producto?.nombre}</td>
              <td>{m.tipo_movimiento}</td>
              <td>{m.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}