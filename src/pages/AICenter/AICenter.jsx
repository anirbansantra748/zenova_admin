import { useState, useEffect } from 'react';
import { 
  Bot, 
  MessageSquare, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  ChevronRight, 
  Shield, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Edit3 
} from 'lucide-react';
import adminApi from '../../utils/api';
import './AICenter.css';

const fmtDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const SEVERITY_COLOR = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#10b981',
};

const AICenter = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [overview, setOverview] = useState(null);
  const [safetyEvents, setSafetyEvents] = useState([]);
  const [safetyStats, setSafetyStats] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(false);

  // Trainer greetings management state
  const [greetings, setGreetings] = useState([]);
  const [greetingsLoading, setGreetingsLoading] = useState(false);
  const [showGreetingModal, setShowGreetingModal] = useState(false);
  const [editGreetingId, setEditGreetingId] = useState(null);
  const [greetingForm, setGreetingForm] = useState({ agent: '', displayName: '', cardMessage: '', isActive: true });
  const [greetingResult, setGreetingResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ovRes, safetyRes, safetyStatsRes] = await Promise.allSettled([
        adminApi.aiOverview(30),
        adminApi.listSafetyEvents({ limit: 20 }),
        adminApi.safetyStats(30),
      ]);
      if (ovRes.status === 'fulfilled') setOverview(ovRes.value?.data);
      if (safetyRes.status === 'fulfilled') setSafetyEvents(safetyRes.value?.data?.events || []);
      if (safetyStatsRes.status === 'fulfilled') setSafetyStats(safetyStatsRes.value?.data);
    } catch (_) {}
    setLoading(false);
  };

  const fetchGreetings = async () => {
    setGreetingsLoading(true);
    try {
      const res = await adminApi.listTrainerGreetings();
      setGreetings(res?.data?.items || res?.data || []);
    } catch (err) {
      console.error('Failed to fetch trainer greetings', err);
    }
    setGreetingsLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchGreetings();
  }, []);

  const handleRefresh = () => {
    if (activeTab === 'monitoring') {
      fetchData();
    } else {
      fetchGreetings();
    }
  };

  const lookupThreads = async () => {
    if (!selectedUserId.trim()) return;
    setThreadsLoading(true);
    setThreads([]);
    setSelectedThread(null);
    setMessages([]);
    try {
      const res = await adminApi.aiUserThreads(selectedUserId.trim(), 20);
      setThreads(res?.data?.threads || res?.data || []);
    } catch (err) {
      alert(err?.message || 'Failed to fetch threads');
    }
    setThreadsLoading(false);
  };

  const loadMessages = async (thread) => {
    setSelectedThread(thread);
    setMsgsLoading(true);
    setMessages([]);
    try {
      const res = await adminApi.aiThreadMessages(thread._id || thread.id, { limit: 100 });
      setMessages(res?.data?.messages || res?.data || []);
    } catch (err) {
      alert(err?.message || 'Failed to fetch messages');
    }
    setMsgsLoading(false);
  };

  // Trainer card actions
  const openCreateGreeting = () => {
    setEditGreetingId(null);
    setGreetingForm({ agent: '', displayName: '', cardMessage: '', isActive: true });
    setShowGreetingModal(true);
    setGreetingResult(null);
  };

  const openEditGreeting = (g) => {
    setEditGreetingId(g.id || g._id);
    setGreetingForm({
      agent: g.agent || '',
      displayName: g.display_name ?? g.displayName ?? '',
      cardMessage: g.card_message ?? g.cardMessage ?? '',
      isActive: g.is_active ?? g.isActive ?? true
    });
    setShowGreetingModal(true);
    setGreetingResult(null);
  };

  const handleCreateOrUpdateGreeting = async (e) => {
    e.preventDefault();
    try {
      if (editGreetingId) {
        await adminApi.updateTrainerGreeting(editGreetingId, {
          displayName: greetingForm.displayName,
          cardMessage: greetingForm.cardMessage,
        });
        setGreetingResult({ success: true, message: 'Card message updated successfully!' });
      } else {
        await adminApi.createTrainerGreeting({
          agent: greetingForm.agent,
          displayName: greetingForm.displayName,
          cardMessage: greetingForm.cardMessage,
          isActive: true,
        });
        setGreetingResult({ success: true, message: 'Trainer card created successfully!' });
      }
      fetchGreetings();
      setTimeout(() => {
        setShowGreetingModal(false);
        setGreetingResult(null);
      }, 1000);
    } catch (err) {
      setGreetingResult({ success: false, message: err?.message || 'Operation failed' });
    }
  };

  const handleToggleGreeting = async (id, isActive) => {
    try {
      await adminApi.updateTrainerGreeting(id, { isActive: !isActive });
      fetchGreetings();
    } catch (err) {
      alert(err?.message || 'Toggle status failed');
    }
  };

  return (
    <div className="ai-center-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>AI Center</h1>
          <p>Monitor chatbot logs and manage dynamic trainer card greeting messages.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {activeTab === 'greetings' && (
            <button className="primary-btn" onClick={openCreateGreeting}>
              <Plus size={16} />
              <span>New Trainer Card</span>
            </button>
          )}
          <button className="secondary-btn" onClick={handleRefresh}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="ai-tabs glass">
        <button 
          className={`ai-tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          Overview & Monitoring
        </button>
        <button 
          className={`ai-tab-btn ${activeTab === 'greetings' ? 'active' : ''}`}
          onClick={() => setActiveTab('greetings')}
        >
          Trainer Greetings
        </button>
      </div>

      {activeTab === 'monitoring' ? (
        <>
          {/* Overview Stats */}
          {loading ? (
            <div className="ai-loading"><Loader2 size={28} className="spin" style={{ opacity: 0.4 }} /></div>
          ) : (
            <div className="ai-stats-row">
              <div className="ai-stat glass">
                <div className="ai-stat-icon primary"><MessageSquare size={20} /></div>
                <div>
                  <p className="ai-stat-val">{overview?.total_messages?.toLocaleString() ?? '—'}</p>
                  <p className="ai-stat-lbl">Total Messages (30d)</p>
                </div>
              </div>
              <div className="ai-stat glass">
                <div className="ai-stat-icon secondary"><Bot size={20} /></div>
                <div>
                  <p className="ai-stat-val">{overview?.total_threads?.toLocaleString() ?? '—'}</p>
                  <p className="ai-stat-lbl">Threads</p>
                </div>
              </div>
              <div className="ai-stat glass">
                <div className="ai-stat-icon success"><RefreshCw size={20} /></div>
                <div>
                  <p className="ai-stat-val">{overview?.avg_turns_per_thread?.toFixed(1) ?? '—'}</p>
                  <p className="ai-stat-lbl">Avg Turns/Thread</p>
                </div>
              </div>
              <div className="ai-stat glass">
                <div className="ai-stat-icon danger"><AlertTriangle size={20} /></div>
                <div>
                  <p className="ai-stat-val">{safetyStats?.total ?? '—'}</p>
                  <p className="ai-stat-lbl">Safety Events (30d)</p>
                </div>
              </div>
            </div>
          )}

          <div className="ai-main-grid">
            {/* Safety Events */}
            <div className="glass ai-safety-panel">
              <div className="ai-panel-header">
                <Shield size={18} className="panel-icon" />
                <h3>Safety Events</h3>
              </div>
              {safetyEvents.length === 0 ? (
                <div className="ai-empty">No safety events in the last 30 days. 🟢</div>
              ) : (
                <div className="safety-list">
                  {safetyEvents.map((ev, i) => (
                    <div key={ev.id || i} className="safety-row">
                      <div
                        className="severity-dot"
                        style={{ backgroundColor: SEVERITY_COLOR[ev.severity] || '#6b7280' }}
                      />
                      <div className="safety-info">
                        <span className="safety-user">{ev.user_name || ev.user_email || ev.user_id}</span>
                        <span className="safety-cat">{ev.category?.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="safety-meta">
                        <span className="safety-agent">{ev.agent}</span>
                        <span className="safety-date">{fmtDate(ev.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thread Explorer */}
            <div className="glass ai-thread-panel">
              <div className="ai-panel-header">
                <MessageSquare size={18} className="panel-icon" />
                <h3>Thread Explorer</h3>
              </div>
              <div className="thread-lookup">
                <input
                  placeholder="Paste User ID to view their threads..."
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupThreads()}
                />
                <button className="primary-btn" onClick={lookupThreads} disabled={threadsLoading}>
                  {threadsLoading ? <Loader2 size={14} className="spin" /> : <ChevronRight size={14} />}
                </button>
              </div>

              {threads.length > 0 && (
                <div className="thread-list">
                  {threads.map((t, i) => (
                    <div
                      key={t._id || t.id || i}
                      className={`thread-item ${selectedThread?._id === t._id ? 'selected' : ''}`}
                      onClick={() => loadMessages(t)}
                    >
                      <span className="thread-agent">{t.agent}</span>
                      <span className="thread-title">{t.title || `Thread ${i + 1}`}</span>
                      <span className="thread-count">{t.message_count ?? t.messageCount ?? '?'} msgs</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedThread && (
                <div className="messages-panel">
                  <p className="msgs-header">Thread: {selectedThread.title || 'Conversation'}</p>
                  {msgsLoading ? (
                    <div className="ai-loading"><Loader2 size={20} className="spin" style={{ opacity: 0.4 }} /></div>
                  ) : (
                    <div className="msgs-list">
                      {messages.map((m, i) => (
                        <div key={i} className={`msg-bubble ${m.role}`}>
                          <div className="msg-role">{m.role}</div>
                          <div className="msg-content">{m.content}</div>
                          {m.safety_flags?.length > 0 && (
                            <div className="safety-flag">⚠️ {m.safety_flags.join(', ')}</div>
                          )}
                        </div>
                      ))}
                      {messages.length === 0 && <p className="ai-empty">No messages found.</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="greetings-section animate-fade-in">
          {greetingsLoading ? (
            <div className="ai-loading"><Loader2 size={28} className="spin" style={{ opacity: 0.4 }} /></div>
          ) : greetings.length === 0 ? (
            <div className="glass ai-empty-card">
              <p className="ai-empty">No trainer greetings configured. Add a new card above!</p>
            </div>
          ) : (
            <div className="greetings-grid">
              {greetings.map((g) => (
                <div key={g.id || g._id} className="trainer-greeting-card glass">
                  <div className="card-top">
                    <div className="trainer-badge">
                      <Bot size={16} />
                      <span>{g.agent}</span>
                    </div>
                    <button 
                      className="toggle-btn"
                      onClick={() => handleToggleGreeting(g.id || g._id, g.is_active ?? g.isActive)}
                      title="Toggle Active Status"
                    >
                      {(g.is_active ?? g.isActive) ? (
                        <ToggleRight size={24} style={{ color: 'var(--success)' }} />
                      ) : (
                        <ToggleLeft size={24} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </button>
                  </div>
                  <div className="card-body">
                    <h3 className="trainer-name">{g.display_name ?? g.displayName}</h3>
                    <p className="trainer-message">"{g.card_message ?? g.cardMessage}"</p>
                  </div>
                  <div className="card-footer">
                    <button className="edit-btn secondary-btn" onClick={() => openEditGreeting(g)}>
                      <Edit3 size={14} />
                      <span>Edit message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Greeting Modal */}
      {showGreetingModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowGreetingModal(false); setGreetingResult(null); } }}>
          <div className="modal-box glass animate-fade-in">
            <h2>{editGreetingId ? 'Edit Trainer Card' : 'Create Trainer Card'}</h2>
            <form className="send-form" onSubmit={handleCreateOrUpdateGreeting}>
              <div className="send-field">
                <label>Agent Identifier (lowercase, e.g. calia)</label>
                <input 
                  required 
                  placeholder="e.g. calia" 
                  value={greetingForm.agent} 
                  disabled={!!editGreetingId}
                  onChange={e => setGreetingForm(f => ({ ...f, agent: e.target.value }))} 
                />
              </div>
              <div className="send-field">
                <label>Display Name</label>
                <input 
                  required 
                  placeholder="e.g. Calia" 
                  value={greetingForm.displayName} 
                  onChange={e => setGreetingForm(f => ({ ...f, displayName: e.target.value }))} 
                />
              </div>
              <div className="send-field">
                <label>Card Message (Greeting text for frontend selection)</label>
                <textarea 
                  required
                  rows={3} 
                  placeholder="e.g. Ready to train your two day diet plan" 
                  value={greetingForm.cardMessage} 
                  onChange={e => setGreetingForm(f => ({ ...f, cardMessage: e.target.value }))} 
                />
              </div>
              {greetingResult && (
                <div className={`send-result ${greetingResult.success ? 'success' : 'error'}`}>
                  {greetingResult.success ? `✅ ${greetingResult.message}` : `⚠️ ${greetingResult.message}`}
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => { setShowGreetingModal(false); setGreetingResult(null); }}>Cancel</button>
                <button type="submit" className="primary-btn">
                  <span>{editGreetingId ? 'Save Changes' : 'Create Card'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICenter;
