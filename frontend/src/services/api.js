import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Brands
export const fetchBrands = async () => {
  const { data } = await api.get('/brands');
  return data.data;
};

export const createBrand = async (brandData) => {
  const { data } = await api.post('/brands', brandData);
  return data.data;
};

export const updateBrand = async (id, brandData) => {
  const { data } = await api.put(`/brands/${id}`, brandData);
  return data.data;
};

// Mentions
export const fetchMentions = async (brandId, params = {}) => {
  const { data } = await api.get('/mentions', {
    params: { brandId, ...params }
  });
  return data.data;
};

export const fetchMentionStats = async (brandId) => {
  const { data } = await api.get(`/mentions/stats/${brandId}`);
  return data.data;
};

export const fetchTrendData = async (brandId, period = '24h') => {
  const { data } = await api.get(`/mentions/trends/${brandId}`, {
    params: { period }
  });
  return data.data;
};

// Alerts
export const fetchAlerts = async (brandId) => {
  const { data } = await api.get('/alerts', {
    params: { brandId, isRead: false }
  });
  return data.data;
};

export const markAlertRead = async (alertId) => {
  const { data } = await api.patch(`/alerts/${alertId}/read`);
  return data.data;
};

export default api;
