import { useState, useEffect } from 'react';
import { X, User, Calendar, Activity, Cpu, ShieldAlert, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import adminApi from '../../utils/api';
import './UserDetailPanel.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const UserDetailPanel = ({ userId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profRes, statsRes, actRes, threadRes] = await Promise.allSettled([
          adminApi.getUser(userId),
          adminApi.getUserStats(userId),
          adminApi.getUserActivity(userId, 14),
          adminApi.aiUserThreads(userId, 10),
        ]);

        if (profRes.status === 'fulfilled') {
          const d = profRes.value?.data;
          setProfile(d?.user || d);
        }
        if (statsRes.status === 'fulfilled') {
          const d = statsRes.value?.data;
          setStats(d?.stats || d);
        }
        if (actRes.status === 'fulfilled') {
          setActivity(actRes.value?.data?.events || actRes.value?.data || []);
        }
        if (threadRes.status === 'fulfilled') {
          setThreads(threadRes.value?.data?.threads || threadRes.value?.data || []);
        }
      } catch (err) {
        setError('Failed to load user details.');
      }
      setLoading(false);
    };
    fetchDetails();
  }, [userId]);

  return (
    <div className="user-detail-overlay" onClick={onClose}>
      <div className="user-detail-panel glass animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        {loading ? (
          <div className="detail-loading"><Loader2 size={32} className="spin" /></div>
        ) : error ? (
          <div className="detail-error">⚠️ {error}</div>
        ) : (
          <div className="detail-content">
            <div className="detail-header">
              <div className="detail-avatar">
                {(profile?.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="detail-title">
                <h2>{profile?.full_name || 'Unknown User'}</h2>
                <p>{profile?.email || profile?.phone || 'No contact info'}</p>
                <div className="detail-badges">
                  {(profile?.roles || []).map(r => (
                    <span key={r.id || r._id || r} className="role-badge">{r.name || r}</span>
                  ))}
                  <span className={`status-pill ${profile?.is_banned ? 'banned' : 'active'}`}>
                    {profile?.is_banned ? 'Banned' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3><User size={18} /> Profile & Stats</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Joined</label>
                  <span>{fmtDate(profile?.created_at)}</span>
                </div>
                <div className="detail-item">
                  <label>Last Active</label>
                  <span>{fmtDate(profile?.last_active_at)}</span>
                </div>
                <div className="detail-item">
                  <label>User ID</label>
                  <span style={{ fontSize: '0.85em', fontFamily: 'monospace' }}>{profile?._id || profile?.id || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Gender</label>
                  <span style={{ textTransform: 'capitalize' }}>{profile?.gender || '—'}</span>
                </div>
                <div className="detail-item">
                  <label>Level</label>
                  <span>Lv. {stats?.level || profile?.gamification?.level || profile?.level || 1}</span>
                </div>
                <div className="detail-item">
                  <label>NovaCoins</label>
                  <span style={{ color: 'var(--warning)' }}>🪙 {(stats?.nova_coins ?? profile?.gamification?.nova_coins ?? profile?.nova_coins ?? 0).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Streak</label>
                  <span>🔥 {stats?.streak_days ?? profile?.gamification?.streak_days ?? profile?.streak_days ?? 0} days</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3><Activity size={18} /> Recent Activity (14d)</h3>
              {activity.length === 0 ? (
                <p className="empty-text">No recent activity.</p>
              ) : (
                <ul className="activity-list">
                  {activity.slice(0, 5).map((act, i) => (
                    <li key={i}>
                      <span className="act-kind">{act.kind || act.type}</span>
                      <span className="act-time">{fmtDate(act.createdAt || act.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="detail-section">
              <h3><Cpu size={18} /> AI Threads (Top 10)</h3>
              {threads.length === 0 ? (
                <p className="empty-text">No AI conversations.</p>
              ) : (
                <ul className="thread-list">
                  {threads.map((t, i) => (
                    <li key={i}>
                      <span className="thread-title">{t.title || `Thread ${i + 1}`}</span>
                      <span className="thread-agent">Agent: {t.agent}</span>
                      <span className="thread-msgs">{t.message_count || t.messageCount || '?'} msgs</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailPanel;

