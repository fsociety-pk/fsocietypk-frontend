import axios from 'axios';
import { API_BASE_URL, API_WITH_CREDENTIALS } from './apiConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: API_WITH_CREDENTIALS,
  // Fail clearly if the API host or reverse proxy stops responding.
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        error.message = 'The server did not respond in time. Please try again shortly.';
      } else if (!error.response) {
        error.message = 'Cannot reach the server. Please check the connection and try again.';
      } else {
        const serverMessage = error.response.data?.message;
        if (typeof serverMessage === 'string' && serverMessage.trim()) {
          error.message = serverMessage;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
