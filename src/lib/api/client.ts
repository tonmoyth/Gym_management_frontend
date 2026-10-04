import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/proxy',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional response interceptor to surface clear backend error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns a formatted error response, pass along
    return Promise.reject(error);
  }
);

export default apiClient;
