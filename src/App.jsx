import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/Users/UserManagement';
import Analytics from './pages/Analytics/Analytics';
import Notifications from './pages/Notifications/Notifications';
import Gamification from './pages/Gamification/Gamification';
import AICenter from './pages/AICenter/AICenter';
import Roles from './pages/Roles/Roles';
import SystemHealth from './pages/SystemHealth/SystemHealth';
import AuditLogs from './pages/AuditLogs/AuditLogs';

// Auth guard — redirect to /login if no token
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('zenova_admin_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="users"         element={<UserManagement />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="gamification"  element={<Gamification />} />
          <Route path="ai"            element={<AICenter />} />
          <Route path="roles"         element={<Roles />} />
          <Route path="system"        element={<SystemHealth />} />
          <Route path="audit-logs"    element={<AuditLogs />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
