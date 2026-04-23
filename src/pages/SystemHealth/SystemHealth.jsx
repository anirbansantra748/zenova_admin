import { useState, useEffect } from 'react';
import { Server, Database, Cpu, Wifi, Clock, RefreshCw, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import adminApi from '../../utils/api';
import './SystemHealth.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const StatusBadge = ({ ok, label }) => (
  <span className={`sys-status-badge ${ok ? 'up' : 'down'}`}>
    {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
    {label}
  </span>
);

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [healthRes, auditRes] = await Promise.allSettled([
        adminApi.systemHealth(),
        adminApi.listAuditLogs({ limit: 20 }),
      ]);
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value?.data);
      // Backend audit service returns { data: { items: [...] } }
      if (auditRes.status === 'fulfilled') {
        setAuditLogs(auditRes.value?.data?.items || auditRes.value?.data?.logs || []);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="system-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>System Health</h1>
          <p>Monitor server uptime, database connections, and admin audit trail.</p>
        </div>
        <button className="secondary-btn" onClick={fetchData}>
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </header>

      {loading ? (
        <div className="sys-loading"><Loader2 size={28} className="spin" style={{ opacity: 0.4 }} /></div>
      ) : (
        <>
          {/* Health Cards */}
          <div className="sys-grid">
            <div className="sys-card glass">
              <div className="sys-card-header">
                <div className="sys-icon primary"><Server size={20} /></div>
                <div>
                  <h3>Server</h3>
                  <StatusBadge ok={true} label="Online" />
                </div>
              </div>
              <div className="sys-metrics">
                <div className="sys-metric">
                  <span className="metric-label">Uptime</span>
                  {/* Backend field: uptime_seconds */}
                  <span className="metric-val">{health?.uptime_seconds != null ? `${Math.floor(health.uptime_seconds / 3600)}h ${Math.floor((health.uptime_seconds % 3600) / 60)}m` : '—'}</span>
                </div>
                <div className="sys-metric">
                  <span className="metric-label">Node Env</span>
                  {/* Backend field: node_env */}
                  <span className="metric-val">{health?.node_env || '—'}</span>
                </div>
                <div className="sys-metric">
                  <span className="metric-label">Platform</span>
                  {/* Backend field: host.platform */}
                  <span className="metric-val">{health?.host?.platform || '—'}</span>
                </div>
              </div>
            </div>

            <div className="sys-card glass">
              <div className="sys-card-header">
                <div className="sys-icon secondary"><Cpu size={20} /></div>
                <div>
                  <h3>Memory</h3>
                  <span className="sys-small-label">Heap usage</span>
                </div>
              </div>
              <div className="sys-metrics">
                <div className="sys-metric">
                  <span className="metric-label">Heap Used</span>
                  {/* Backend field: memory.heap_used_mb */}
                  <span className="metric-val">{health?.memory?.heap_used_mb != null ? `${health.memory.heap_used_mb} MB` : '—'}</span>
                </div>
                <div className="sys-metric">
                  <span className="metric-label">Heap Total</span>
                  {/* Backend field: memory.heap_total_mb */}
                  <span className="metric-val">{health?.memory?.heap_total_mb != null ? `${health.memory.heap_total_mb} MB` : '—'}</span>
                </div>
                <div className="sys-metric">
                  <span className="metric-label">RSS</span>
                  <span className="metric-val">{health?.memory?.rss_mb != null ? `${health.memory.rss_mb} MB` : '—'}</span>
                </div>
              </div>
            </div>

            <div className="sys-card glass">
              <div className="sys-card-header">
                <div className="sys-icon success"><Database size={20} /></div>
                <div>
                  <h3>MongoDB</h3>
                  <StatusBadge
                    ok={health?.mongo?.state === 'connected' || health?.db?.state === 'connected'}
                    label={health?.mongo?.state || health?.db?.state || 'unknown'}
                  />
                </div>
              </div>
              <div className="sys-metrics">
                <div className="sys-metric">
                  <span className="metric-label">State</span>
                  <span className="metric-val">{health?.mongo?.state || health?.db?.state || '—'}</span>
                </div>
              </div>
            </div>

            <div className="sys-card glass">
              <div className="sys-card-header">
                <div className="sys-icon warning"><Wifi size={20} /></div>
                <div>
                  <h3>Redis</h3>
                  <StatusBadge
                    ok={health?.redis?.ok || health?.redis?.ping === 'PONG'}
                    label={health?.redis?.ok ? 'Connected' : health?.redis?.ping || 'Unknown'}
                  />
                </div>
              </div>
              <div className="sys-metrics">
                <div className="sys-metric">
                  <span className="metric-label">Ping</span>
                  <span className="metric-val">{health?.redis?.ping || (health?.redis?.ok ? 'PONG' : '—')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raw health JSON */}
          {health && (
            <div className="glass sys-raw">
              <p className="sys-raw-title">Raw Health Data</p>
              <pre>{JSON.stringify(health, null, 2)}</pre>
            </div>
          )}
        </>
      )}

      {/* Audit Logs */}
      <div className="glass audit-panel">
        <div className="audit-header">
          <Clock size={18} className="panel-icon" />
          <h3>Audit Log</h3>
        </div>
        {auditLogs.length === 0 ? (
          <div className="sys-empty">No admin actions recorded yet.</div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Admin</th>
                <th>Method</th>
                <th>Route</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr key={log.id || i}>
                  <td><span className="audit-action">{log.action}</span></td>
                  {/* Backend fields: admin_email, method, route, status, created_at */}
                  <td className="audit-admin">{log.admin_email || '—'}</td>
                  <td><span className={`method-badge ${log.method?.toLowerCase()}`}>{log.method || '—'}</span></td>
                  <td className="audit-route">{log.route || '—'}</td>
                  <td>
                    <span className={`status-pill ${log.status < 300 ? 'active' : 'banned'}`}>
                      {log.status || '—'}
                    </span>
                  </td>
                  <td className="audit-time">{fmtDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;
