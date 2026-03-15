import axios from 'axios';
import { mockApi, mockAuth } from './mockApi';

// Use mock API for Vercel deployment, real API for development
const USE_MOCK_API = process.env.NODE_ENV === 'production' || !process.env.REACT_APP_API_URL;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
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

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: USE_MOCK_API 
    ? (credentials) => mockAuth.login(credentials.email, credentials.password)
    : (credentials) => api.post('/auth/login', credentials),
  register: USE_MOCK_API 
    ? (userData) => mockAuth.register(userData.username, userData.email, userData.password)
    : (userData) => api.post('/auth/register', userData),
};

// Tasks API calls
export const tasksAPI = {
  getAll: USE_MOCK_API 
    ? () => mockApi.getTasks()
    : () => api.get('/tasks'),
  create: USE_MOCK_API 
    ? (taskData) => mockApi.createTask(taskData)
    : (taskData) => api.post('/tasks', taskData),
  update: USE_MOCK_API 
    ? (id, taskData) => mockApi.updateTask(id, taskData)
    : (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: USE_MOCK_API 
    ? (id) => mockApi.deleteTask(id)
    : (id) => api.delete(`/tasks/${id}`),
  getRecentlyDeleted: USE_MOCK_API 
    ? () => mockApi.getRecentlyDeleted()
    : () => api.get('/tasks/recently-deleted'),
  restore: USE_MOCK_API 
    ? (id) => mockApi.restoreTask(id)
    : (id) => api.post(`/tasks/${id}/restore`),
};

export default api;
