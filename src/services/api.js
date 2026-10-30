import axios from 'axios';

// Cliente único para hablar con la API; la dirección viene del archivo .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export default api;