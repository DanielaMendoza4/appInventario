import client from './client';

export const getProductos = async () => {
  const { data } = await client.get('/api/productos');
  return data;
};

export const createProducto = async (producto) => {
  const { data } = await client.post('/api/productos', producto);
  return data;
};

export const updateProducto = async (id, producto) => {
  const { data } = await client.put(`/api/productos/${id}`, producto);
  return data;
};

export const deleteProducto = async (id) => {
  const { data } = await client.delete(`/api/productos/${id}`);
  return data;
};
