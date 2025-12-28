import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.vercel.app/api' 
    : 'http://localhost:5000/api');

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

