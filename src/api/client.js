import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Client (customer) API
export const clientAPI = axios.create({
  baseURL: `${API_BASE}/client`,
});

// Merchant API
export const merchantAPI = axios.create({
  baseURL: `${API_BASE}/merchant`,
});

// HQ API
export const hqAPI = axios.create({
  baseURL: `${API_BASE}/hq`,
});

// Auth interceptor — attach token from localStorage
[clientAPI, merchantAPI, hqAPI].forEach(instance => {
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

export default clientAPI;
