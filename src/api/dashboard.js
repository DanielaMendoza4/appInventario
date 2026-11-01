import client from './client';

export const getDashboardData = async () => {
  const { data } = await client.get('/api/dashboard');
  return data;
};
