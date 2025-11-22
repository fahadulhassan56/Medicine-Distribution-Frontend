import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token from localStorage for EVERY request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handler (optional)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized → logout automatically
    if (error.response?.status === 401) {
      console.warn("Token missing or invalid. Redirecting to login…");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
