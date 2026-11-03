import api from './api';

export const applicationService = {
  async getApplications(params = {}) {
    const res = await api.get('/applications', { params });
    return res.data;
  },

  async getApplicationById(id) {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  async createApplication(data) {
    const res = await api.post('/applications', data);
    return res.data;
  },

  async updateStatus(id, status, note = '') {
    const res = await api.patch(`/applications/${id}/status`, { status, note });
    return res.data;
  },

  async updateApplication(id, data) {
    const res = await api.put(`/applications/${id}`, data);
    return res.data;
  },

  async addNote(id, text) {
    const res = await api.post(`/applications/${id}/notes`, { text });
    return res.data;
  },

  async deleteApplication(id) {
    const res = await api.delete(`/applications/${id}`);
    return res.data;
  },
};
