import client from './client';

export const getProveedores = async () => {
  const { data } = await client.get('/api/proveedores');
  return data;
};

export const createProveedor = async (proveedor) => {
  const { data } = await client.post('/api/proveedores', proveedor);
  return data;
};

export const updateProveedor = async (id, proveedor) => {
  const { data } = await client.put(`/api/proveedores/${id}`, proveedor);
  return data;
};

export const deleteProveedor = async (id) => {
  const { data } = await client.delete(`/api/proveedores/${id}`);
  return data;
};
