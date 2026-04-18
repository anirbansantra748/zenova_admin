import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/Users/UserManagement';

// Placeholder Pages (Will be expanded)
const Analytics = () => <div className="animate-fade-in"><h1>Analytics Center</h1><p>Coming soon...</p></div>;
const RolesPermissions = () => <div className="animate-fade-in"><h1>Roles & Permissions</h1><p>Coming soon...</p></div>;
const Notifications = () => <div className="animate-fade-in"><h1>Notification Management</h1><p>Coming soon...</p></div>;
const Gamification = () => <div className="animate-fade-in"><h1>Gamification & Quests</h1><p>Coming soon...</p></div>;
const AICenter = () => <div className="animate-fade-in"><h1>AI & Chat Monitoring</h1><p>Coming soon...</p></div>;
const SystemHealth = () => <div className="animate-fade-in"><h1>System Health & Logs</h1><p>Coming soon...</p></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="roles" element={<RolesPermissions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="ai" element={<AICenter />} />
          <Route path="system" element={<SystemHealth />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
