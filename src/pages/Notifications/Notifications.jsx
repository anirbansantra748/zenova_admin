import { useState, useEffect } from 'react';
import { Bell, Send, Loader2, RefreshCw, Users, CheckCircle2, Clock } from 'lucide-react';
import adminApi from '../../utils/api';
import './Notifications.css';

const CATEGORIES = ['Hydration', 'Meditation', 'Steps', 'Meal', 'Sleep', 'Mood', 'Menstrual', 'Screen Time'];

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '', body: '', category: 'Mood',
    targetMode: 'all', userIds: '',
  });
  const [sendResult, setSendResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, statsRes] = await Promise.allSettled([
        adminApi.listNotifications({ limit: 30 }),
        adminApi.notificationStats(),
      ]);
      // Backend returns { data: { items: [...], total, ... } }
      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.value?.data?.items || notifRes.value?.data?.notifications || []);
      }
      if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data);
    } catch (_) {}
    setLoading(false);
  };


  useEffect(() => { fetchData(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendResult(null);
    try {
      const target = form.targetMode === 'all'
        ? { mode: 'all' }
        : form.targetMode === 'user'
        ? { mode: 'user', userIds: form.userIds.split(',').map(s => s.trim()).filter(Boolean) }
        : { mode: 'role', role: 'User' };

      const res = await adminApi.sendNotification({
        title: form.title,
        body: form.body,
        category: form.category,
        target,
      });
      setSendResult({ success: true, ...res?.data });
      fetchData();
    } catch (err) {
      setSendResult({ success: false, message: err?.message || 'Send failed' });
    } finally {
      setSendLoading(false);
    }
  };

  const StatBadge = ({ icon: Icon, label, value, color }) => (
    <div className="notif-stat glass">
      <div className={`notif-stat-icon ${color}`}><Icon size={18} /></div>
      <div>
        <p className="notif-stat-value">{value ?? '—'}</p>
        <p className="notif-stat-label">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="notifications-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Notifications</h1>
          <p>Send push notifications and view delivery history.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            <Send size={16} />
            <span>Send Notification</span>
          </button>
          <button className="secondary-btn" onClick={fetchData}>
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* Stats Row */}
      <div className="notif-stats-row">
        <StatBadge icon={Bell} label="Total Sent" value={stats?.total?.toLocaleString()} color="primary" />
        <StatBadge icon={CheckCircle2} label="Delivered" value={stats?.sent?.toLocaleString()} color="success" />
        <StatBadge icon={Users} label="Read" value={stats?.read?.toLocaleString()} color="secondary" />
        <StatBadge icon={Clock} label="Scheduled" value={stats?.scheduled?.toLocaleString()} color="warning" />
      </div>

      {/* Notification List */}
      <div className="notif-table glass">
        <div className="notif-table-header">
          <h3>Recent Notifications</h3>
        </div>
        {loading ? (
          <div className="notif-loading">
            <Loader2 size={28} className="spin" style={{ opacity: 0.4 }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">No notifications yet.</div>
        ) : (
          <table className="notif-data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n, i) => (
                <tr key={n.id || i}>
                  <td>
                    <div className="notif-title">{n.title || '—'}</div>
                    <div className="notif-body-text">{n.body || ''}</div>
                  </td>
                  <td><span className="notif-category-pill">{n.category || '—'}</span></td>
                  <td>
                    <span className={`status-pill ${n.status === 'read' ? 'active' : 'pending'}`}>
                      {n.status || 'sent'}
                    </span>
                  </td>
                  <td className="notif-date">{fmtDate(n.sent_at || n.scheduled_at || n.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Send Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-box glass animate-fade-in">
            <h2>Send Push Notification</h2>
            <form className="send-form" onSubmit={handleSend}>
              <div className="send-field">
                <label>Title</label>
                <input required placeholder="e.g. Morning Boost ☀️" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="send-field">
                <label>Message Body</label>
                <textarea required rows={3} placeholder="Your message here..." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              </div>
              <div className="send-row">
                <div className="send-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="send-field">
                  <label>Target</label>
                  <select value={form.targetMode} onChange={e => setForm(f => ({ ...f, targetMode: e.target.value }))}>
                    <option value="all">All Users</option>
                    <option value="role">Role: User</option>
                    <option value="user">Specific User IDs</option>
                  </select>
                </div>
              </div>
              {form.targetMode === 'user' && (
                <div className="send-field">
                  <label>User IDs (comma separated)</label>
                  <input placeholder="65f..., 65f..." value={form.userIds} onChange={e => setForm(f => ({ ...f, userIds: e.target.value }))} />
                </div>
              )}

              {sendResult && (
                <div className={`send-result ${sendResult.success ? 'success' : 'error'}`}>
                  {sendResult.success
                    ? `✅ Sent: ${sendResult.sent ?? '?'} | Skipped: ${sendResult.skipped ?? '?'} | Failed: ${sendResult.failed ?? '?'}`
                    : `⚠️ ${sendResult.message}`}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => { setShowModal(false); setSendResult(null); }}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={sendLoading}>
                  {sendLoading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                  <span>Send Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
