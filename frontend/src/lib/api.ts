import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // Proxied by Vite to the backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add interceptors for request or response handling (e.g., auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally if needed
    // e.g., if (error.response.status === 401) { logout(); }
    return Promise.reject(error);
  }
);

export const api = {
  get: <T = any>(url: string, params?: object) => apiClient.get<T>(url, { params }),
  post: <T = any>(url: string, data?: object) => apiClient.post<T>(url, data),
  put: <T = any>(url: string, data?: object) => apiClient.put<T>(url, data),
  delete: <T = any>(url: string) => apiClient.delete<T>(url),
  // Add other methods like patch if needed
};

// Example usage:
// import { api } from '@/lib/api';
// const fetchUsers = async () => {
//   try {
//     const response = await api.get('/users');
//     return response.data;
//   } catch (error) {
//     console.error('Failed to fetch users:', error);
//     throw error;
//   }
// }; 