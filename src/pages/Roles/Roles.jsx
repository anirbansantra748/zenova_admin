import { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, RefreshCw, Lock } from 'lucide-react';
import adminApi from '../../utils/api';
import './Roles.css';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.allSettled([
        adminApi.listRoles(),
        adminApi.listPermissions(),
      ]);
      const r = rolesRes.status === 'fulfilled'
        ? (rolesRes.value?.data?.roles || rolesRes.value?.data || [])
        : [];
      setRoles(r);
      if (r.length > 0 && !activeRole) setActiveRole(r[0]);
      if (permsRes.status === 'fulfilled') {
        setPermissions(permsRes.value?.data?.permissions || permsRes.value?.data || []);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="roles-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Access Control</h1>
          <p>View roles and their permissions (read-only in MVP).</p>
        </div>
        <button className="secondary-btn" onClick={fetchData}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </header>

      <div className="roles-badge glass">
        <Lock size={14} />
        <span>Role and permission editing is disabled in MVP. Contact a Super Administrator to manage roles via the database.</span>
      </div>

      <div className="roles-layout">
        {/* Roles sidebar */}
        <div className="roles-sidebar glass">
          <p className="roles-sidebar-title">Roles</p>
          {loading ? (
            <div className="roles-loading"><Loader2 size={20} className="spin" style={{ opacity: 0.4 }} /></div>
          ) : roles.length === 0 ? (
            <p className="roles-empty">No roles found.</p>
          ) : (
            roles.map((r, i) => (
              <button
                key={r._id || r.id || i}
                className={`role-item ${activeRole?._id === r._id ? 'active' : ''}`}
                onClick={() => setActiveRole(r)}
              >
                <div className="role-item-icon">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="role-item-name">{r.name}</p>
                  <p className="role-item-desc">{r.description || '—'}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Role detail */}
        <div className="role-detail glass">
          {!activeRole ? (
            <div className="roles-empty-state">Select a role to view its permissions.</div>
          ) : (
            <>
              <div className="role-detail-header">
                <ShieldCheck size={24} className="role-detail-icon" />
                <div>
                  <h3>{activeRole.name}</h3>
                  <p>{activeRole.description || 'No description'}</p>
                </div>
              </div>

              <div className="permissions-section">
                <p className="perms-title">Permissions</p>
                {(activeRole.permissions || []).length === 0 ? (
                  <p className="roles-empty">No permissions linked to this role.</p>
                ) : (
                  <div className="perms-grid">
                    {(activeRole.permissions || []).map((p, i) => (
                      <div key={p._id || p.id || i} className="perm-chip">
                        <Lock size={12} />
                        <span>{p.name || (p.controller ? `${p.controller}:${p.action}` : String(p))}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="permissions-section">
                <p className="perms-title">All System Permissions</p>
                <div className="perms-grid">
                  {permissions.map((p, i) => (
                    <div key={p._id || p.id || i} className="perm-chip secondary">
                      <span>{p.name || (p.controller ? `${p.controller}:${p.action}` : String(p))}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roles;
