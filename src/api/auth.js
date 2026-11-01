import client from './client';

export const login = async (email, password) => {
  const { data } = await client.post('/api/auth/login', { email, password });
  return data;
};

export const getMe = async () => {
  const { data } = await client.get('/api/auth/me');
  return data;
};
