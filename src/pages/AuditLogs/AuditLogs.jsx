import { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, RefreshCw, Clock, User, Target } from 'lucide-react';
import adminApi from '../../utils/api';
import './AuditLogs.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.listAuditLogs({ page, limit: 20 });
      setLogs(res?.data?.items || res?.data?.logs || []);
      setTotal(res?.data?.total || 0);
    } catch (err) {
      setError(err?.message || 'Failed to fetch audit logs.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="audit-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Track all administrative actions across the platform.</p>
        </div>
        <button className="secondary-btn" onClick={fetchLogs}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </header>

      {error && (
        <div className="glass" style={{ padding: '14px 20px', borderRadius: '10px', border: '1px solid #ef4444', color: '#ef4444', marginBottom: 20 }}>
          ⚠️ {error}
        </div>
      )}

      <div className="glass audit-table-wrap">
        {loading ? (
          <div className="audit-loading"><Loader2 size={24} className="spin" style={{ opacity: 0.4 }} /></div>
        ) : logs.length === 0 ? (
          <div className="audit-empty">No admin actions recorded yet.</div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id || log.id}>
                  <td className="time-cell">
                    <Clock size={14} className="cell-icon" />
                    <span>{fmtDate(log.createdAt || log.created_at)}</span>
                  </td>
                  <td className="admin-cell">
                    <User size={14} className="cell-icon" />
                    <span>{log.admin_email || log.admin_id || 'System'}</span>
                  </td>
                  <td>
                    <span className="action-pill">{log.action}</span>
                  </td>
                  <td className="target-cell">
                    <Target size={14} className="cell-icon" />
                    <span>{log.target_model} / {log.target_id || 'N/A'}</span>
                  </td>
                  <td className="details-cell">
                    <pre className="json-details">{JSON.stringify(log.changes, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
