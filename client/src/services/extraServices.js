import api from './api';

export const profileService = {
  async getProfile() {
    const res = await api.get('/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/profile', data);
    return res.data;
  },

  async updateMatchSettings(data) {
    const res = await api.put('/profile/match-settings', data);
    return res.data;
  },
};

export const resumeService = {
  async uploadResume(formData) {
    const res = await api.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  async confirmExtraction(data) {
    const res = await api.post('/resume/confirm', data);
    return res.data;
  },

  async getResume() {
    const res = await api.get('/resume');
    return res.data;
  },
};

export const analyticsService = {
  async getAnalytics() {
    const res = await api.get('/analytics');
    return res.data;
  },
};

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  async deleteNotification(id) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

export const syncService = {
  async getStatus() {
    const res = await api.get('/sync/status');
    return res.data;
  },

  async triggerSync(source = 'all') {
    const res = await api.post('/sync/manual', { source });
    return res.data;
  },
};
