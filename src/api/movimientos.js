import client from './client';

export const getMovimientos = async () => {
  const { data } = await client.get('/api/movimientos');
  return data;
};

export const createMovimiento = async (movimiento) => {
  const { data } = await client.post('/api/movimientos', movimiento);
  return data;
};

export const anularMovimiento = async (id) => {
  const { data } = await client.put(`/api/movimientos/${id}/anular`);
  return data;
};
