import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Bell, 
  Trophy, 
  Cpu, 
  Settings, 
  LogOut,
  Search,
  ChevronRight
} from 'lucide-react';
import './Layout.css';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
  >
    <Icon size={20} />
    <span>{label}</span>
    <ChevronRight className="chevron" size={16} />
  </NavLink>
);

const Layout = () => {
  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar glass">
        <div className="sidebar-logo">
          <div className="logo-icon">Z</div>
          <span className="logo-text">ZENOVA</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group">
            <p className="group-title">MAIN</p>
            <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarLink to="/users" icon={Users} label="Users" />
            <SidebarLink to="/analytics" icon={BarChart3} label="Analytics" />
          </div>

          <div className="nav-group">
            <p className="group-title">PLATFORM</p>
            <SidebarLink to="/notifications" icon={Bell} label="Notifications" />
            <SidebarLink to="/gamification" icon={Trophy} label="Gamification" />
            <SidebarLink to="/ai" icon={Cpu} label="AI Center" />
          </div>

          <div className="nav-group">
            <p className="group-title">SYSTEM</p>
            <SidebarLink to="/roles" icon={ShieldCheck} label="Access Control" />
            <SidebarLink to="/system" icon={Settings} label="System Health" />
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar glass">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search anything..." />
          </div>

          <div className="topbar-actions">
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">Admin User</span>
                <span className="user-role">Super Administrator</span>
              </div>
              <div className="user-avatar">AD</div>
            </div>
          </div>
        </header>

        <section className="page-container">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default Layout;
