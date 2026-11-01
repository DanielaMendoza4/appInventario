import client from './client';

export const getUsuarios = async () => {
  const { data } = await client.get('/api/usuarios');
  return data;
};

export const createUsuario = async (usuario) => {
  const { data } = await client.post('/api/usuarios', usuario);
  return data;
};

export const updateUsuario = async (id, usuario) => {
  const { data } = await client.put(`/api/usuarios/${id}`, usuario);
  return data;
};

export const deleteUsuario = async (id) => {
  const { data } = await client.delete(`/api/usuarios/${id}`);
  return data;
};
