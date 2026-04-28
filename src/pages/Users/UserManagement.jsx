import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Calendar,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import adminApi from '../../utils/api';
import UserDetailPanel from './UserDetailPanel';
import './UserManagement.css';

// ── Helper ────────────────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtRelative = (iso) => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ── Action menu (per-row) ─────────────────────────────────────────────────────
const ActionMenu = ({ user, onBan, onUnban, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="action-menu-wrapper" ref={ref}>
      <button className="action-dots" onClick={() => setOpen(!open)} title="Actions">
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="action-dropdown glass">
          {user.is_banned ? (
            <button onClick={() => { setOpen(false); onUnban(user.id); }}>
              <CheckCircle2 size={14} /> Unban User
            </button>
          ) : (
            <button className="danger" onClick={() => { setOpen(false); onBan(user.id, user.full_name); }}>
              <ShieldAlert size={14} /> Ban User
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [bannedFilter, setBannedFilter] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const LIMIT = 20;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch)  params.search       = debouncedSearch;
      if (roleFilter)       params.role         = roleFilter;
      if (bannedFilter)     params.isBanned     = bannedFilter;

      const res = await adminApi.listUsers(params);
      const d   = res?.data;
      setUsers(d?.users || []);
      setTotal(d?.total || 0);
      setTotalPages(d?.total_pages || 1);
    } catch (err) {
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, roleFilter, bannedFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (userId, name) => {
    const reason = window.prompt(`Reason for banning ${name}:`, 'Violated community guidelines');
    if (!reason) return;
    try {
      await adminApi.banUser(userId, reason);
      fetchUsers();
    } catch (err) {
      alert(err?.message || 'Ban failed');
    }
  };

  const handleUnban = async (userId) => {
    if (!window.confirm('Unban this user?')) return;
    try {
      await adminApi.unbanUser(userId);
      fetchUsers();
    } catch (err) {
      alert(err?.message || 'Unban failed');
    }
  };

  return (
    <div className="users-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>User Management</h1>
          <p>View, manage and monitor Zenova platform users.</p>
        </div>
        <button className="primary-btn" onClick={fetchUsers}>
          <RefreshCw size={18} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Controls */}
      <div className="table-controls glass">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button className="filter-btn">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <select className="role-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="Super Administrator">Super Admin</option>
            <option value="Administrator">Administrator</option>
            <option value="Moderator">Moderator</option>
            <option value="User">User</option>
          </select>
          <select className="role-select" value={bannedFilter} onChange={(e) => { setBannedFilter(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass" style={{ padding: '14px 20px', borderRadius: '10px', border: '1px solid #f59e0b', color: '#f59e0b', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Users Table */}
      <div className="table-container glass">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Level / Coins</th>
              <th>Last Active</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="spin" style={{ display: 'inline-block', marginBottom: '8px', opacity: 0.4 }} />
                  <br />Loading users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} onClick={() => setSelectedUserId(user.id)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar-small">
                        {(user.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <span className="name">{user.full_name}</span>
                        <span className="email">{user.email || user.phone || '—'}</span>
                        <span className="id" style={{ fontSize: '10px', opacity: 0.4, fontFamily: 'monospace' }}>{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {(user.roles || []).map((r) => (
                      <span key={r} className={`role-badge ${r.toLowerCase().replace(/ /g, '-')}`}>
                        {r}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`status-pill ${user.is_banned ? 'banned' : 'active'}`}>
                      {user.is_banned ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Lv.{user.level}</span>
                      &nbsp;&nbsp;
                      <span style={{ color: 'var(--warning)' }}>🪙 {user.nova_coins?.toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="active-time">
                      <Calendar size={12} />
                      <span>{fmtRelative(user.last_active_at)}</span>
                    </div>
                  </td>
                  <td>{fmtDate(user.created_at)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <ActionMenu user={user} onBan={handleBan} onUnban={handleUnban} onRefresh={fetchUsers} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer / Pagination */}
        <div className="table-footer">
          <p>
            Showing {users.length} of {total.toLocaleString()} users
          </p>
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, page - 2) + i;
              if (pg > totalPages) return null;
              return (
                <button key={pg} className={pg === page ? 'active' : ''} onClick={() => setPage(pg)}>
                  {pg}
                </button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && <span>…</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {selectedUserId && (
        <UserDetailPanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
};

export default UserManagement;
