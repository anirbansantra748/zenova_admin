export const statsData = [
  { id: 1, label: 'Total Users', value: '12,482', change: '+12%', icon: 'users', color: 'primary' },
  { id: 2, label: 'NovaCoins Circulation', value: '450,200', change: '+8%', icon: 'coins', color: 'secondary' },
  { id: 3, label: 'Daily Active Users', value: '2,105', change: '+5%', icon: 'activity', color: 'success' },
  { id: 4, label: 'AI Messages Today', value: '8,942', change: '+18%', icon: 'message', color: 'warning' },
];

export const growthChartData = [
  { name: 'Jan', users: 4000, coins: 2400 },
  { name: 'Feb', users: 3000, coins: 1398 },
  { name: 'Mar', users: 2000, coins: 9800 },
  { name: 'Apr', users: 2780, coins: 3908 },
  { name: 'May', users: 1890, coins: 4800 },
  { name: 'Jun', users: 2390, coins: 3800 },
  { name: 'Jul', users: 3490, coins: 4300 },
];

export const mockDashboardSeries = Array.from({ length: 30 }).map((_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  count: Math.floor(Math.random() * 500) + 1000
}));

export const activityData = [
  { feature: 'meals', count: 1250 },
  { feature: 'workouts', count: 850 },
  { feature: 'meditation', count: 400 },
  { feature: 'sleep', count: 300 },
  { feature: 'mood', count: 150 },
];

export const mockUsers = [
  { 
    id: '1', 
    full_name: 'Anirban Ghosh', 
    email: 'anirban@example.com', 
    roles: ['Super Administrator'], 
    is_banned: false, 
    level: 45,
    nova_coins: 12500,
    last_active_at: new Date(Date.now() - 2 * 60000).toISOString(), 
    created_at: '2024-01-12T10:00:00Z' 
  },
  { 
    id: '2', 
    full_name: 'Calia Coach', 
    email: 'calia_ai@zenova.app', 
    roles: ['Moderator'], 
    is_banned: false, 
    level: 99,
    nova_coins: 0,
    last_active_at: new Date().toISOString(), 
    created_at: '2023-12-05T08:00:00Z' 
  },
  { 
    id: '3', 
    full_name: 'John Doe', 
    email: 'john@doe.com', 
    roles: ['User'], 
    is_banned: false, 
    level: 12,
    nova_coins: 450,
    last_active_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), 
    created_at: '2024-02-20T15:30:00Z' 
  },
  { 
    id: '4', 
    full_name: 'Sarah Smith', 
    email: 'sarah@zenova.app', 
    roles: ['Administrator'], 
    is_banned: false, 
    level: 32,
    nova_coins: 2100,
    last_active_at: new Date(Date.now() - 3600000).toISOString(), 
    created_at: '2024-03-01T12:00:00Z' 
  },
  { 
    id: '5', 
    full_name: 'Michael Ross', 
    email: 'mross@legal.com', 
    roles: ['User'], 
    is_banned: true, 
    level: 5,
    nova_coins: 50,
    last_active_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(), 
    created_at: '2023-11-15T09:45:00Z' 
  },
];

export const mockNotifications = [
  { id: '1', title: 'System Update', message: 'The platform will be undergoing maintenance tomorrow at 2 AM GMT.', type: 'info', status: 'Sent', sentAt: '2024-04-20 10:30' },
  { id: '2', title: 'New Event: Fitness Challenge', message: 'Join the new 30-day fitness challenge and win NovaCoins!', type: 'success', status: 'Scheduled', sentAt: '2024-04-25 08:00' },
  { id: '3', title: 'Account Security Alert', message: 'We detected a login from a new device.', type: 'warning', status: 'Sent', sentAt: '2024-04-18 15:45' },
];

export const mockAiStats = {
  activeThreads: 1420,
  totalMessages: 125000,
  avgResponseTime: '0.8s',
  sentimentScore: 4.5,
  usageByModel: [
    { name: 'GPT-4o', value: 65 },
    { name: 'Claude 3.5 Sonnet', value: 25 },
    { name: 'Gemini 1.5 Pro', value: 10 },
  ]
};

export const mockEconomyStats = {
  totalCirculation: '2,450,000',
  dailyTransactions: 1250,
  burnRate: '15,000',
  rewardRate: '45,000',
  recentTransactions: [
    { id: 't1', user: 'Anirban Ghosh', type: 'Reward', amount: 50, timestamp: '10 mins ago' },
    { id: 't2', user: 'John Doe', type: 'Purchase', amount: -200, timestamp: '1 hour ago' },
    { id: 't3', user: 'Sarah Smith', type: 'Gift', amount: 100, timestamp: '3 hours ago' },
  ]
};

export const mockSystemHealth = {
  status: 'Healthy',
  uptime: '99.98%',
  services: [
    { name: 'API Gateway', status: 'Online', latency: '45ms' },
    { name: 'Auth Service', status: 'Online', latency: '22ms' },
    { name: 'User Service', status: 'Online', latency: '30ms' },
    { name: 'AI Worker', status: 'Online', latency: '120ms' },
    { name: 'Database', status: 'Online', latency: '5ms' },
  ]
};

export const mockRoles = [
  { id: 'r1', name: 'Super Administrator', permissions: ['ALL'] },
  { id: 'r2', name: 'Administrator', permissions: ['USERS_READ', 'USERS_WRITE', 'ANALYTICS_READ'] },
  { id: 'r3', name: 'Moderator', permissions: ['USERS_READ', 'SAFETY_WRITE'] },
];
