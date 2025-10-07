import axios from 'axios';

// Automatically choose backend URL based on environment
const DEV_BACKEND = 'http://localhost:5001/api'; // local backend
const PROD_BACKEND = 'https://miniproject-1-egug.onrender.com/api'; // deployed backend

const BASE_URL = process.env.NODE_ENV === 'production' ? PROD_BACKEND : DEV_BACKEND;
const TIMEOUT = 30000; // 10 seconds timeout

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  withCredentials: true // needed if backend uses cookies
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Token expired or invalid → logout user
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        window.location.href = '/login';
      }

      console.error('API Error:', status, error.response.data);
    } else {
      console.error('API Network Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
