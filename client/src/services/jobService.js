import api from './api';

export const jobService = {
  async getJobs(params = {}) {
    const res = await api.get('/jobs', { params });
    return res.data;
  },

  async getRecommendedJobs(params = {}) {
    const res = await api.get('/jobs/recommended', { params });
    return res.data;
  },

  async getJobById(id) {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },
};
