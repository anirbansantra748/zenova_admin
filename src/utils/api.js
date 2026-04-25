// src/utils/api.js
// Axios client for the Zenova Admin backend.
// All admin endpoints live at /api/admin/* and require JWT auth.
// The token is stored in localStorage under 'zenova_admin_token'.
import axios from 'axios';
import * as mock from './mockData';

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

// ── Fallback Wrapper ────────────────────────────────────────────────────────
const withFallback = async (promise, mockData) => {
  try {
    const res = await promise;
    return res;
  } catch (err) {
    console.warn('API Error, falling back to mock data:', err);
    return { success: true, data: mockData, message: 'Loaded from mock data (Backend Offline)' };
  }
};

// ── Convenience helpers ──────────────────────────────────────────────────────

/** Dashboard */
export const adminApi = {
  // Auth
  login: async (body) => {
    try {
      return await api.post('/auth/signin', body);
    } catch (err) {
      // Demo login for Vercel deployment
      if (body.email === 'admin@zenova.app' || body.email === 'demo@zenova.app' || body.email?.includes('test')) {
        return { 
          success: true, 
          data: { 
            token: 'mock-jwt-token', 
            user: { full_name: 'Demo Admin', email: body.email, roles: ['Super Administrator'] } 
          } 
        };
      }
      throw err;
    }
  },
  getMe: () => withFallback(api.get('/auth/me'), mock.mockUsers[0]),

  // Dashboard & Analytics
  dashboardOverview: () => withFallback(api.get('/admin/dashboard/overview'), {
    users: {
      total: 12482,
      new_today: 142,
      active_today: 2105,
      active_last_7d: 8500
    },
    gamification: {
      nova_coins_in_circulation: 450200
    },
    ai: {
      chat_messages_today: 8942
    }
  }),
  dashboardUserGrowth: (period = '30d') => withFallback(api.get(`/admin/dashboard/user-growth?period=${period}`), {
    series: mock.mockDashboardSeries
  }),
  dashboardActivitySummary: (days = 30) => withFallback(api.get(`/admin/dashboard/activity-summary?days=${days}`), {
    breakdown: {
      meals: 1250,
      workouts: 850,
      meditation: 400,
      sleep: 300,
      mood: 150,
      yoga: 100,
      steps: 2100
    }
  }),
  dashboardTopFeatures: (days = 30) => withFallback(api.get(`/admin/dashboard/top-features?days=${days}`), [
    { feature: 'meals', count: 1250 },
    { feature: 'workouts', count: 850 },
    { feature: 'meditation', count: 400 },
    { feature: 'sleep', count: 300 },
    { feature: 'mood', count: 150 },
  ]),
  dashboardNovaCoinsFlow: (days = 7) => withFallback(api.get(`/admin/dashboard/nova-coins-flow?days=${days}`), {
    series: mock.mockDashboardSeries.map(s => ({
      date: s.date,
      earned: Math.floor(Math.random() * 5000) + 1000,
      spent: Math.floor(Math.random() * 4000) + 500
    }))
  }),

  // Users
  listUsers: (params = {}) => withFallback(api.get('/admin/users', { params }), {
    users: mock.mockUsers,
    total: mock.mockUsers.length,
    total_pages: 1
  }),
  getUser: (userId) => withFallback(api.get(`/admin/users/${userId}`), mock.mockUsers.find(u => u.id === userId) || mock.mockUsers[0]),
  getUserActivity: (userId, days = 14) => withFallback(api.get(`/admin/users/${userId}/activity?days=${days}`), []),
  getUserStats: (userId) => withFallback(api.get(`/admin/users/${userId}/stats`), {
    total_logins: 45,
    messages_sent: 120,
    challenges_completed: 8
  }),
  updateUser: (userId, body) => api.patch(`/admin/users/${userId}`, body),
  banUser: (userId, reason) => api.patch(`/admin/users/${userId}/ban`, { reason }),
  unbanUser: (userId) => api.patch(`/admin/users/${userId}/unban`),

  // Notifications
  listNotifications: (params = {}) => withFallback(api.get('/admin/notifications', { params }), {
    items: mock.mockNotifications.map(n => ({
      ...n,
      sent_at: n.sentAt,
      created_at: n.sentAt
    }))
  }),
  notificationStats: () => withFallback(api.get('/admin/notifications/stats'), { 
    total: 1250, 
    sent: 1245, 
    read: 850, 
    scheduled: 5 
  }),
  sendNotification: (body) => api.post('/admin/notifications/send', body),

  // Safety events
  listSafetyEvents: (params = {}) => withFallback(api.get('/admin/safety-events', { params }), []),
  safetyStats: (days = 30) => withFallback(api.get(`/admin/safety-events/stats?days=${days}`), {
    total: 3,
    critical: 1,
    warning: 2
  }),

  // Audit logs
  listAuditLogs: (params = {}) => withFallback(api.get('/admin/audit-logs', { params }), []),

  // AI monitoring
  aiOverview: (days = 30) => withFallback(api.get(`/admin/ai/overview?days=${days}`), mock.mockAiStats),
  aiUserThreads: (userId, limit = 20) => withFallback(api.get(`/admin/ai/users/${userId}/threads?limit=${limit}`), []),
  aiThreadMessages: (threadId, params = {}) => withFallback(api.get(`/admin/ai/threads/${threadId}/messages`, { params }), []),

  // Gamification
  economyOverview: (days = 30) => withFallback(api.get(`/admin/gamification/economy-overview?days=${days}`), mock.mockEconomyStats),
  listTransactions: (params = {}) => withFallback(api.get('/admin/gamification/transactions', { params }), mock.mockEconomyStats.recentTransactions),
  adjustCoins: (body) => api.post('/admin/gamification/adjust-coins', body),

  // Quests
  listQuests: (params = {}) => withFallback(api.get('/admin/quests', { params }), []),
  getQuestCompletions: (questId, limit = 50) => withFallback(api.get(`/admin/quests/${questId}/completions?limit=${limit}`), []),
  createQuest: (body) => api.post('/admin/quests', body),
  updateQuest: (questId, body) => api.patch(`/admin/quests/${questId}`, body),
  toggleQuest: (questId, isActive) => api.patch(`/admin/quests/${questId}/toggle`, { isActive }),

  // Roles
  listRoles: () => withFallback(api.get('/admin/roles'), mock.mockRoles),
  listPermissions: () => withFallback(api.get('/admin/roles/permissions'), []),

  // System
  systemHealth: () => withFallback(api.get('/admin/system/health'), mock.mockSystemHealth),
};

export default adminApi;
