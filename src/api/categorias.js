import client from './client';

export const getCategorias = async () => {
  const { data } = await client.get('/api/categorias');
  return data;
};

export const createCategoria = async (categoria) => {
  const { data } = await client.post('/api/categorias', categoria);
  return data;
};

export const updateCategoria = async (id, categoria) => {
  const { data } = await client.put(`/api/categorias/${id}`, categoria);
  return data;
};

export const deleteCategoria = async (id) => {
  const { data } = await client.delete(`/api/categorias/${id}`);
  return data;
};
