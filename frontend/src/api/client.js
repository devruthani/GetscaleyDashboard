import axios from 'axios';

/**
 * Axios instance configured for the API.
 * This is the standard way to make requests to the backend.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Request interceptor to add the JWT token to every request.
 * This ensures that authenticated routes work without manually adding the header every time.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle global errors.
 * For example, if the token expires (401), we can redirect to login.
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if necessary
      // localStorage.removeItem('token');
      // window.location.href = '/login'; // Or use a more React-friendly way
      console.warn('Unauthorized access - potential token expiration');
    }
    
    // Standardize error message
    const message = error.response?.data?.message || error.message || 'An unknown error occurred';
    console.error('API Error:', message);
    
    return Promise.reject({ ...error, message });
  }
);

export default apiClient;
