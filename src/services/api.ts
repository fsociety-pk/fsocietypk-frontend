import axios from 'axios';
import { API_BASE_URL, API_WITH_CREDENTIALS } from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: API_WITH_CREDENTIALS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  }
);

export default api;
