import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, Coins, Loader2, RefreshCw } from 'lucide-react';
import adminApi from '../../utils/api';
import './Analytics.css';

const PERIOD_OPTIONS = [
  { label: '7 Days',  value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
  { label: '1 Year',  value: '1y' },
];

const Analytics = () => {
  const [period, setPeriod] = useState('30d');
  const [growthData, setGrowthData] = useState([]);
  const [activityData, setActivityData] = useState(null);
  const [coinsFlow, setCoinsFlow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [growthRes, activityRes, coinsRes] = await Promise.allSettled([
        adminApi.dashboardUserGrowth(period),
        adminApi.dashboardActivitySummary(period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365),
        adminApi.dashboardNovaCoinsFlow(period === '7d' ? 7 : 30),
      ]);

      if (growthRes.status === 'fulfilled') {
        setGrowthData((growthRes.value?.data?.series || []).map(g => ({
          name: g.date.slice(5),
          users: g.count,
        })));
      }
      if (activityRes.status === 'fulfilled') {
        setActivityData(activityRes.value?.data?.breakdown || null);
      }
      if (coinsRes.status === 'fulfilled') {
        setCoinsFlow((coinsRes.value?.data?.series || []).map(c => ({
          name: c.date.slice(5),
          earned: c.earned,
          spent: c.spent,
        })));
      }
    } catch (err) {
      setError(err?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const activityBars = activityData
    ? Object.entries(activityData).map(([key, val]) => ({ category: key.charAt(0).toUpperCase() + key.slice(1), count: val }))
    : [];

  return (
    <div className="analytics-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Analytics</h1>
          <p>Platform performance and engagement insights.</p>
        </div>
        <div className="analytics-controls">
          <div className="period-tabs">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`period-tab ${period === opt.value ? 'active' : ''}`}
                onClick={() => setPeriod(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button className="primary-btn" onClick={fetchData}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="analytics-error glass">
          ⚠️ {error}
        </div>
      )}

      <div className="analytics-grid">
        {/* User Growth Chart */}
        <div className="chart-card glass large">
          <div className="chart-card-header">
            <div className="chart-icon primary"><Users size={18} /></div>
            <div>
              <h3>User Growth</h3>
              <p>New registrations over selected period</p>
            </div>
          </div>
          <div className="chart-body-area">
            {loading ? (
              <div className="chart-loading">
                <Loader2 size={28} className="spin" style={{ opacity: 0.4 }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="users" stroke="var(--primary)" fill="url(#ugGrad)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="chart-card glass small">
          <div className="chart-card-header">
            <div className="chart-icon secondary"><BarChart3 size={18} /></div>
            <div>
              <h3>Activity Breakdown</h3>
              <p>Logs by feature category</p>
            </div>
          </div>
          <div className="chart-body-area">
            {loading ? (
              <div className="chart-loading">
                <Loader2 size={28} className="spin" style={{ opacity: 0.4 }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={activityBars} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="category" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                  <Bar dataKey="count" fill="var(--secondary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* NovaCoins Flow */}
        <div className="chart-card glass full-width">
          <div className="chart-card-header">
            <div className="chart-icon warning"><Coins size={18} /></div>
            <div>
              <h3>NovaCoins Flow</h3>
              <p>Earned vs Spent per day</p>
            </div>
          </div>
          <div className="chart-body-area">
            {loading ? (
              <div className="chart-loading">
                <Loader2 size={28} className="spin" style={{ opacity: 0.4 }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={coinsFlow}>
                  <defs>
                    <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="earned" stroke="#10b981" fill="url(#earnedGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="spent" stroke="#ef4444" fill="url(#spentGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
