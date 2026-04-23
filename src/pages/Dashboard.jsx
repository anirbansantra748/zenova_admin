import { useState, useEffect } from 'react';
import { 
  Users, 
  Coins, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import adminApi from '../utils/api';
import './Dashboard.css';

// ── Helper ────────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
};

const FEATURE_COLORS = {
  meals:      '#8b5cf6',
  workouts:   '#06b6d4',
  sleep:      '#3b82f6',
  mood:       '#f43f5e',
  meditation: '#10b981',
  yoga:       '#f59e0b',
  steps:      '#ec4899',
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, icon: Icon, color, loading }) => (
  <div className="stat-card glass animate-fade-in">
    <div className="stat-header">
      <div className={`stat-icon-wrapper ${color}`}>
        <Icon size={20} />
      </div>
      {sub != null && (
        <div className="stat-badge">
          <TrendingUp size={12} />
          <span>{sub}</span>
        </div>
      )}
    </div>
    <div className="stat-body">
      {loading ? (
        <Loader2 size={22} className="spin" style={{ opacity: 0.4 }} />
      ) : (
        <h3>{value}</h3>
      )}
      <p>{label}</p>
    </div>
  </div>
);

// ── Dashboard page ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [overview, setOverview]     = useState(null);
  const [growth, setGrowth]         = useState([]);
  const [features, setFeatures]     = useState([]);
  const [safetyStats, setSafety]    = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ovRes, growRes, featRes, safetyRes] = await Promise.allSettled([
          adminApi.dashboardOverview(),
          adminApi.dashboardUserGrowth('30d'),
          adminApi.dashboardTopFeatures(30),
          adminApi.safetyStats(7),
        ]);

        if (ovRes.status === 'fulfilled')       setOverview(ovRes.value?.data);
        if (growRes.status === 'fulfilled')     setGrowth(growRes.value?.data?.series || []);
        if (featRes.status === 'fulfilled')     setFeatures(featRes.value?.data || []);
        if (safetyRes.status === 'fulfilled')   setSafety(safetyRes.value?.data);
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build stat cards from live overview
  const statsCards = [
    {
      id: 'total-users',
      label:  'Total Users',
      value:  fmt(overview?.users?.total),
      sub:    overview ? `+${overview.users.new_today} today` : null,
      icon:   Users,
      color:  'primary',
    },
    {
      id: 'nova-coins',
      label:  'NovaCoins Circulation',
      value:  fmt(overview?.gamification?.nova_coins_in_circulation),
      sub:    null,
      icon:   Coins,
      color:  'secondary',
    },
    {
      id: 'dau',
      label:  'Active Today',
      value:  fmt(overview?.users?.active_today),
      sub:    overview ? `${fmt(overview.users.active_last_7d)} / 7d` : null,
      icon:   Activity,
      color:  'success',
    },
    {
      id: 'ai-msgs',
      label:  'AI Messages Today',
      value:  fmt(overview?.ai?.chat_messages_today),
      sub:    safetyStats?.total ? `⚠️ ${safetyStats.total} crisis / 7d` : 'No crises',
      icon:   MessageSquare,
      color:  'warning',
    },
  ];

  // Map top-features array → pie data
  const pieData = features.slice(0, 7).map((f) => ({
    category: f.feature.charAt(0).toUpperCase() + f.feature.slice(1),
    value:    f.count,
    color:    FEATURE_COLORS[f.feature] || '#6366f1',
  }));

  // Map user-growth series → chart data
  const chartData = growth.map((g) => ({
    name:  g.date.slice(5), // MM-DD
    users: g.count,
  }));

  const crisisCount = safetyStats?.total || 0;

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>Welcome back, Admin</h1>
          <p>Here's what's happening with Zenova today.</p>
        </div>
        <button className="primary-btn" onClick={() => window.location.reload()}>
          <ArrowUpRight size={18} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Crisis banner */}
      {crisisCount > 0 && (
        <div className="crisis-banner glass" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px', marginBottom: '20px',
          borderRadius: '10px', border: '1px solid #ef4444',
          backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444'
        }}>
          <AlertTriangle size={18} />
          <span>
            <strong>{crisisCount}</strong> crisis event{crisisCount !== 1 ? 's' : ''} detected in the last 7 days.
            Review in <a href="/ai" style={{ color: '#ef4444', textDecoration: 'underline' }}>AI Center</a>.
          </span>
        </div>
      )}

      {error && (
        <div className="glass" style={{
          padding: '14px 20px', marginBottom: '20px', borderRadius: '10px',
          border: '1px solid #f59e0b', color: '#f59e0b', fontSize: '0.9rem'
        }}>
          ⚠️ {error} — showing cached data where available.
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsCards.map(stat => (
          <StatCard key={stat.id} {...stat} loading={loading && !overview} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-wrapper glass large">
          <div className="chart-header">
            <h3>User Growth (Last 30 Days)</h3>
            <p>New registrations by day</p>
          </div>
          <div className="chart-body">
            {loading && chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Loader2 size={28} className="spin" style={{ opacity: 0.4 }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="var(--primary)" 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="chart-wrapper glass small">
          <div className="chart-header">
            <h3>Feature Engagement</h3>
            <p>Usage by category (last 30d)</p>
          </div>
          <div className="chart-body flex-center">
            {loading && pieData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <Loader2 size={28} className="spin" style={{ opacity: 0.4 }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="pie-legend">
              {(pieData.length > 0 ? pieData : []).map((item, i) => (
                <div key={i} className="legend-item">
                  <span className="dot" style={{ backgroundColor: item.color }}></span>
                  <span className="label">{item.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
