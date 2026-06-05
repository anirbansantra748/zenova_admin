import { useState, useEffect, useCallback } from 'react';
import {
  ScrollText, Plus, ToggleLeft, ToggleRight, Loader2, RefreshCw,
  Edit3, Trash2, Users, X, ChevronRight, Filter, CheckCircle2,
  XCircle, Trophy, Clock, Zap, Calendar
} from 'lucide-react';
import adminApi from '../../utils/api';
import './Quests.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const CATEGORIES = ['daily', 'weekly', 'monthly', 'milestone', 'special'];
const RESET_PERIODS = ['none', 'daily', 'weekly', 'monthly'];

const CATEGORY_ICONS = {
  daily: <Zap size={13} />,
  weekly: <RefreshCw size={13} />,
  monthly: <Calendar size={13} />,
  milestone: <Trophy size={13} />,
  special: <CheckCircle2 size={13} />,
};

const BLANK_FORM = {
  title: '', description: '', condition: '',
  rewardCoins: '', rewardMedals: '',
  badgeName: '', badgeIcon: '',
  category: 'daily', resetPeriod: 'daily',
  expiresAt: '', isActive: true,
};

const toForm = (q) => ({
  title: q.title || '',
  description: q.description || '',
  condition: q.condition || '',
  rewardCoins: q.reward_coins ?? q.rewardCoins ?? '',
  rewardMedals: q.reward_medals ?? q.rewardMedals ?? '',
  badgeName: q.badge?.name || '',
  badgeIcon: q.badge?.icon || '',
  category: q.category || 'daily',
  resetPeriod: q.reset_period ?? q.resetPeriod ?? 'none',
  expiresAt: q.expires_at ?? q.expiresAt
    ? new Date(q.expires_at ?? q.expiresAt).toISOString().slice(0, 10)
    : '',
  isActive: q.is_active ?? q.isActive ?? true,
});

const toPayload = (f) => ({
  title: f.title,
  description: f.description,
  condition: f.condition,
  rewardCoins: Number(f.rewardCoins) || 0,
  rewardMedals: Number(f.rewardMedals) || 0,
  badge: (f.badgeName || f.badgeIcon) ? { name: f.badgeName, icon: f.badgeIcon } : undefined,
  category: f.category,
  resetPeriod: f.resetPeriod,
  expiresAt: f.expiresAt || undefined,
  isActive: f.isActive,
});

// ── Main Component ────────────────────────────────────────────────────────────
const Quests = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null); // quest object
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Completions drawer
  const [drawerQuest, setDrawerQuest] = useState(null);
  const [completions, setCompletions] = useState([]);
  const [completionsLoading, setCompletionsLoading] = useState(false);

  // ── Data ────────────────────────────────────────────────────────────────────
  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listQuests({});
      const raw = res?.data;
      setQuests(Array.isArray(raw) ? raw : (raw?.items || raw?.quests || []));
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchQuests(); }, [fetchQuests]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const active = quests.filter(q => q.is_active ?? q.isActive);
  const inactive = quests.filter(q => !(q.is_active ?? q.isActive));

  const filtered = quests.filter(q => {
    if (filterCat !== 'all' && q.category !== filterCat) return false;
    if (filterStatus === 'active' && !(q.is_active ?? q.isActive)) return false;
    if (filterStatus === 'inactive' && (q.is_active ?? q.isActive)) return false;
    return true;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditId(null);
    setForm(BLANK_FORM);
    setFormError(null);
    setShowFormModal(true);
  };

  const openEdit = (q) => {
    setEditId(q._id || q.id);
    setForm(toForm(q));
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload = toPayload(form);
      if (editId) {
        await adminApi.updateQuest(editId, payload);
      } else {
        await adminApi.createQuest(payload);
      }
      setShowFormModal(false);
      fetchQuests();
    } catch (err) {
      setFormError(err?.message || 'Something went wrong');
    }
    setFormLoading(false);
  };

  const handleToggle = async (q) => {
    const current = q.is_active ?? q.isActive;
    try {
      await adminApi.toggleQuest(q._id || q.id, !current);
      fetchQuests();
    } catch (err) {
      alert(err?.message || 'Toggle failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteQuest(deleteTarget._id || deleteTarget.id);
      setDeleteTarget(null);
      fetchQuests();
    } catch (err) {
      alert(err?.message || 'Delete failed');
    }
    setDeleteLoading(false);
  };

  const openCompletions = async (q) => {
    setDrawerQuest(q);
    setCompletions([]);
    setCompletionsLoading(true);
    try {
      const res = await adminApi.getQuestCompletions(q._id || q.id, 100);
      setCompletions(res?.data?.completions || res?.data || []);
    } catch (_) {}
    setCompletionsLoading(false);
  };

  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="quests-page animate-fade-in">

      {/* ── Header ── */}
      <header className="page-header">
        <div>
          <h1>Quests</h1>
          <p>Create and manage in-app quests and player challenges.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="primary-btn" id="quest-new-btn" onClick={openCreate}>
            <Plus size={16} /><span>New Quest</span>
          </button>
          <button className="secondary-btn" onClick={fetchQuests}>
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* ── Stats ── */}
      <div className="quest-stats-row">
        <div className="quest-stat-card glass">
          <div className="qsc-icon primary"><ScrollText size={20} /></div>
          <div>
            <p className="qsc-val">{quests.length}</p>
            <p className="qsc-label">Total Quests</p>
          </div>
        </div>
        <div className="quest-stat-card glass">
          <div className="qsc-icon success"><CheckCircle2 size={20} /></div>
          <div>
            <p className="qsc-val">{active.length}</p>
            <p className="qsc-label">Active</p>
          </div>
        </div>
        <div className="quest-stat-card glass">
          <div className="qsc-icon danger"><XCircle size={20} /></div>
          <div>
            <p className="qsc-val">{inactive.length}</p>
            <p className="qsc-label">Inactive</p>
          </div>
        </div>
        <div className="quest-stat-card glass">
          <div className="qsc-icon warning"><Trophy size={20} /></div>
          <div>
            <p className="qsc-val">{CATEGORIES.length}</p>
            <p className="qsc-label">Categories</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="quest-filters glass">
        <div className="qf-group">
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <span className="qf-label">Category</span>
          <div className="qf-pills">
            {['all', ...CATEGORIES].map(c => (
              <button
                key={c}
                id={`filter-cat-${c}`}
                className={`qf-pill ${filterCat === c ? 'active' : ''}`}
                onClick={() => setFilterCat(c)}
              >
                {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="qf-group">
          <span className="qf-label">Status</span>
          <div className="qf-pills">
            {[['all', 'All'], ['active', 'Active'], ['inactive', 'Inactive']].map(([v, l]) => (
              <button
                key={v}
                id={`filter-status-${v}`}
                className={`qf-pill ${filterStatus === v ? 'active' : ''}`}
                onClick={() => setFilterStatus(v)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="glass quest-table-wrap">
        {loading ? (
          <div className="qt-state"><Loader2 size={24} className="spin" style={{ opacity: 0.4 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="qt-state">
            <ScrollText size={36} style={{ opacity: 0.2 }} />
            <p style={{ marginTop: 10, color: 'var(--text-muted)' }}>No quests match your filters.</p>
            <button className="primary-btn" style={{ marginTop: 16 }} onClick={openCreate}><Plus size={15} /><span>Create First Quest</span></button>
          </div>
        ) : (
          <table className="qt">
            <thead>
              <tr>
                <th>Quest</th>
                <th>Category</th>
                <th>Coins</th>
                <th>Reset</th>
                <th>Status</th>
                <th style={{ width: 140 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => {
                const id = q._id || q.id;
                const isActive = q.is_active ?? q.isActive;
                const coins = q.reward_coins ?? q.rewardCoins ?? 0;
                const reset = q.reset_period ?? q.resetPeriod ?? 'none';
                return (
                  <tr key={id} className="qt-row">
                    <td>
                      <div className="qt-title">{q.title}</div>
                      <div className="qt-desc">{q.description}</div>
                      {q.badge?.name && <div className="qt-badge">🏅 {q.badge.name}</div>}
                    </td>
                    <td>
                      <span className={`cat-pill cat-${q.category}`}>
                        {CATEGORY_ICONS[q.category]} {q.category}
                      </span>
                    </td>
                    <td><span className="coins-val">🪙 {coins.toLocaleString()}</span></td>
                    <td>
                      <span className="reset-chip">
                        <Clock size={12} /> {reset}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${isActive ? 'active' : 'banned'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="qt-actions">
                        <button
                          id={`toggle-quest-${id}`}
                          className="qt-btn"
                          title={isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => handleToggle(q)}
                        >
                          {isActive
                            ? <ToggleRight size={20} style={{ color: 'var(--success)' }} />
                            : <ToggleLeft size={20} style={{ color: 'var(--text-muted)' }} />}
                        </button>
                        <button
                          id={`completions-quest-${id}`}
                          className="qt-btn"
                          title="View Completions"
                          onClick={() => openCompletions(q)}
                        >
                          <Users size={16} style={{ color: 'var(--secondary)' }} />
                        </button>
                        <button
                          id={`edit-quest-${id}`}
                          className="qt-btn"
                          title="Edit"
                          onClick={() => openEdit(q)}
                        >
                          <Edit3 size={16} style={{ color: 'var(--primary)' }} />
                        </button>
                        <button
                          id={`delete-quest-${id}`}
                          className="qt-btn"
                          title="Delete"
                          onClick={() => setDeleteTarget(q)}
                        >
                          <Trash2 size={16} style={{ color: 'var(--danger)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showFormModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowFormModal(false); }}>
          <div className="modal-box glass animate-fade-in quest-form-modal">
            <div className="modal-header">
              <h2>{editId ? 'Edit Quest' : 'Create Quest'}</h2>
              <button className="modal-close" onClick={() => setShowFormModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mf-section">
                <p className="mf-section-label">Basic Info</p>
                <div className="send-field">
                  <label>Title <span className="req">*</span></label>
                  <input required placeholder="7-day streak champion" value={form.title} onChange={field('title')} />
                </div>
                <div className="send-field">
                  <label>Description <span className="req">*</span></label>
                  <textarea rows={2} required placeholder="Log activity 7 days in a row" value={form.description} onChange={field('description')} />
                </div>
                <div className="send-field">
                  <label>Condition <span className="req">*</span></label>
                  <input required placeholder="e.g. Log 7 workouts in 7 days" value={form.condition} onChange={field('condition')} />
                </div>
              </div>

              <div className="mf-section">
                <p className="mf-section-label">Rewards</p>
                <div className="send-row">
                  <div className="send-field">
                    <label>NovaCoins</label>
                    <input type="number" min="0" placeholder="250" value={form.rewardCoins} onChange={field('rewardCoins')} />
                  </div>
                  <div className="send-field">
                    <label>Medals</label>
                    <input type="number" min="0" placeholder="0" value={form.rewardMedals} onChange={field('rewardMedals')} />
                  </div>
                </div>
              </div>

              <div className="mf-section">
                <p className="mf-section-label">Badge (optional)</p>
                <div className="send-row">
                  <div className="send-field">
                    <label>Badge Name</label>
                    <input placeholder="Streak Master" value={form.badgeName} onChange={field('badgeName')} />
                  </div>
                  <div className="send-field">
                    <label>Badge Icon URL</label>
                    <input placeholder="https://..." value={form.badgeIcon} onChange={field('badgeIcon')} />
                  </div>
                </div>
              </div>

              <div className="mf-section">
                <p className="mf-section-label">Settings</p>
                <div className="send-row">
                  <div className="send-field">
                    <label>Category</label>
                    <select value={form.category} onChange={field('category')}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="send-field">
                    <label>Reset Period</label>
                    <select value={form.resetPeriod} onChange={field('resetPeriod')}>
                      {RESET_PERIODS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="send-row">
                  <div className="send-field">
                    <label>Expires At</label>
                    <input type="date" value={form.expiresAt} onChange={field('expiresAt')} />
                  </div>
                  <div className="send-field" style={{ justifyContent: 'flex-end' }}>
                    <label>Active</label>
                    <div className="toggle-switch-row">
                      <button
                        type="button"
                        className={`toggle-switch ${form.isActive ? 'on' : 'off'}`}
                        onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                      >
                        <span className="toggle-knob" />
                      </button>
                      <span className="toggle-label">{form.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="send-result error">⚠️ {formError}</div>
              )}

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowFormModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={formLoading}>
                  {formLoading ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                  <span>{editId ? 'Save Changes' : 'Create Quest'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="modal-box glass animate-fade-in delete-modal">
            <div className="delete-icon-wrap">
              <Trash2 size={28} />
            </div>
            <h2>Delete Quest?</h2>
            <p className="delete-desc">
              <strong>"{deleteTarget.title}"</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancel</button>
              <button className="danger-btn" onClick={handleDelete} disabled={deleteLoading} id="confirm-delete-quest">
                {deleteLoading ? <Loader2 size={16} className="spin" /> : <Trash2 size={16} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Completions Drawer ── */}
      {drawerQuest && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerQuest(null)} />
          <div className="completions-drawer glass animate-slide-in">
            <div className="drawer-header">
              <div>
                <h3>Completions</h3>
                <p className="drawer-sub">{drawerQuest.title}</p>
              </div>
              <button className="modal-close" onClick={() => setDrawerQuest(null)}><X size={20} /></button>
            </div>

            {completionsLoading ? (
              <div className="drawer-state"><Loader2 size={24} className="spin" style={{ opacity: 0.4 }} /></div>
            ) : completions.length === 0 ? (
              <div className="drawer-state">
                <Users size={36} style={{ opacity: 0.2 }} />
                <p style={{ marginTop: 10, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No completions yet.</p>
              </div>
            ) : (
              <div className="completions-list">
                <div className="completions-count">{completions.length} user{completions.length !== 1 ? 's' : ''} completed this quest</div>
                {completions.map((c, i) => (
                  <div key={c.user_id || i} className="completion-row">
                    <div className="completion-avatar">{(c.full_name || 'U').charAt(0).toUpperCase()}</div>
                    <div className="completion-info">
                      <span className="completion-name">{c.full_name || '—'}</span>
                      <span className="completion-email">{c.email}</span>
                    </div>
                    {c.completed_at && (
                      <span className="completion-date">
                        {new Date(c.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Quests;
