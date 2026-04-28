// src/utils/api.js
// Axios client for the Zenova Admin backend.
// All admin endpoints live at /api/admin/* and require JWT auth.
// The token is stored in localStorage under 'zenova_admin_token'.
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 15000,
});

// ── Request interceptor: attach Bearer token ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zenova_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: unwrap { success, data, message } ────────────────
api.interceptors.response.use(
  (r) => r.data, // gives caller { success, data, message } or just r.data
  (err) => {
    const status = err.response?.status;
    if (status === 401) {
      localStorage.removeItem('zenova_admin_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

// ── Convenience helpers ──────────────────────────────────────────────────────

/** Dashboard */
export const adminApi = {
  // Auth
  login: (body) => api.post('/auth/signin', body),
  getMe: () => api.get('/auth/me'),

  // Dashboard & Analytics
  dashboardOverview: () => api.get('/admin/dashboard/overview'),
  dashboardUserGrowth: (period = '30d') => api.get(`/admin/dashboard/user-growth?period=${period}`),
  dashboardActivitySummary: (days = 30) => api.get(`/admin/dashboard/activity-summary?days=${days}`),
  dashboardTopFeatures: (days = 30) => api.get(`/admin/dashboard/top-features?days=${days}`),
  dashboardNovaCoinsFlow: (days = 7) => api.get(`/admin/dashboard/nova-coins-flow?days=${days}`),

  // Users
  listUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (userId) => api.get(`/admin/users/${userId}`),
  getUserActivity: (userId, days = 14) => api.get(`/admin/users/${userId}/activity?days=${days}`),
  getUserStats: (userId) => api.get(`/admin/users/${userId}/stats`),
  updateUser: (userId, body) => api.patch(`/admin/users/${userId}`, body),
  banUser: (userId, reason) => api.patch(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => api.patch(`/admin/users/${userId}/unban`),

  // Notifications
  listNotifications: (params = {}) => api.get('/admin/notifications', { params }),
  notificationStats: () => api.get('/admin/notifications/stats'),
  sendNotification: (body) => api.post('/admin/notifications/send', body),

  // Safety events
  listSafetyEvents: (params = {}) => api.get('/admin/safety-events', { params }),
  safetyStats: (days = 30) => api.get(`/admin/safety-events/stats?days=${days}`),

  // Audit logs
  listAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),

  // AI monitoring
  aiOverview: (days = 30) => api.get(`/admin/ai/overview?days=${days}`),
  aiUserThreads: (userId, limit = 20) => api.get(`/admin/ai/users/${userId}/threads?limit=${limit}`),
  aiThreadMessages: (threadId, params = {}) => api.get(`/admin/ai/threads/${threadId}/messages`, { params }),

  // Gamification
  economyOverview: (days = 30) => api.get(`/admin/gamification/economy-overview?days=${days}`),
  listTransactions: (params = {}) => api.get('/admin/gamification/transactions', { params }),
  adjustCoins: (body) => api.post('/admin/gamification/adjust-coins', body),

  // Quests
  listQuests: (params = {}) => api.get('/admin/quests', { params }),
  getQuestCompletions: (questId, limit = 50) => api.get(`/admin/quests/${questId}/completions?limit=${limit}`),
  createQuest: (body) => api.post('/admin/quests', body),
  updateQuest: (questId, body) => api.patch(`/admin/quests/${questId}`, body),
  toggleQuest: (questId, isActive) => api.patch(`/admin/quests/${questId}/toggle`, { isActive }),

  // Roles
  listRoles: () => api.get('/admin/roles'),
  listPermissions: () => api.get('/admin/roles/permissions'),

  // System
  systemHealth: () => api.get('/admin/system/health'),
};

export default adminApi;

