import axios from 'axios';

// Для GitHub Pages используем относительный путь или полный URL backend
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // В продакшене на GitHub Pages нужен полный URL backend
  if (process.env.NODE_ENV === 'production') {
    return 'https://your-backend-url.vercel.app/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const projectsAPI = {
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getByUserId: async (userId) => {
    const response = await api.get(`/projects/user/${userId}`);
    return response.data;
  },

  updateSubtitles: async (id, subtitles) => {
    const response = await api.patch(`/projects/${id}/subtitles`, { subtitles });
    return response.data;
  },

  regenerateScene: async (id, sceneIndex, prompt) => {
    const response = await api.post(`/projects/${id}/scenes/${sceneIndex}/regenerate`, { prompt });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export default api;

