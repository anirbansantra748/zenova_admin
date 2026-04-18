import { 
  Users, 
  Coins, 
  Activity, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight 
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
import { statsData, growthChartData, activityData } from '../utils/mockData';
import './Dashboard.css';

const StatCard = ({ label, value, change, icon: Icon, color }) => (
  <div className="stat-card glass animate-fade-in">
    <div className="stat-header">
      <div className={`stat-icon-wrapper ${color}`}>
        <Icon size={20} />
      </div>
      <div className="stat-badge">
        <TrendingUp size={12} />
        <span>{change}</span>
      </div>
    </div>
    <div className="stat-body">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const ICON_MAP = {
    users: Users,
    coins: Coins,
    activity: Activity,
    message: MessageSquare
  };

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <h1>Welcome back, Admin</h1>
          <p>Here's what's happening with Zenova today.</p>
        </div>
        <button className="primary-btn">
          <ArrowUpRight size={18} />
          <span>Generate Report</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsData.map(stat => (
          <StatCard 
            key={stat.id} 
            {...stat} 
            icon={ICON_MAP[stat.icon]} 
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-wrapper glass large">
          <div className="chart-header">
            <h3>User Growth & Economy</h3>
            <p>New registrations vs NovaCoin circulation</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={growthChartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
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
          </div>
        </div>

        <div className="chart-wrapper glass small">
          <div className="chart-header">
            <h3>Feature Engagement</h3>
            <p>Usage by category</p>
          </div>
          <div className="chart-body flex-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {activityData.map((item, i) => (
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
