import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Coins, ToggleLeft, ToggleRight, Loader2, RefreshCw, CircleDollarSign, ScrollText, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import adminApi from '../../utils/api';
import './Gamification.css';

const Gamification = () => {
  const navigate = useNavigate();
  const [economy, setEconomy] = useState(null);
  const [quests, setQuests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinForm, setCoinForm] = useState({ userId: '', amount: '', reason: '' });
  const [coinResult, setCoinResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ecoRes, questsRes, txRes] = await Promise.allSettled([
        adminApi.economyOverview(30),
        adminApi.listQuests({}),
        adminApi.listTransactions({ limit: 20 }),
      ]);
      if (ecoRes.status === 'fulfilled') setEconomy(ecoRes.value?.data);
      if (questsRes.status === 'fulfilled') {
        const qd = questsRes.value?.data;
        setQuests(Array.isArray(qd) ? qd : (qd?.quests || qd?.items || []));
      }
      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value?.data?.items || txRes.value?.data?.transactions || []);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleQuest = async (questId, isActive) => {
    try {
      await adminApi.toggleQuest(questId, !isActive);
      fetchData();
    } catch (err) {
      alert(err?.message || 'Toggle failed');
    }
  };

  const handleAdjustCoins = async (e) => {
    e.preventDefault();
    try {
      await adminApi.adjustCoins({ userId: coinForm.userId, amount: Number(coinForm.amount), reason: coinForm.reason });
      setCoinResult({ success: true });
      fetchData();
    } catch (err) {
      setCoinResult({ success: false, message: err?.message });
    }
  };

  return (
    <div className="gamification-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Gamification &amp; Economy</h1>
          <p>Monitor NovaCoin economy, top earners, and quest activity.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="secondary-btn" onClick={() => setShowCoinModal(true)}>
            <Coins size={16} /> <span>Adjust Coins</span>
          </button>
          <button className="secondary-btn" onClick={fetchData}>
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      {/* Economy Overview */}
      {economy && (
        <div className="eco-grid">
          <div className="eco-card glass">
            <div className="eco-icon primary"><CircleDollarSign size={22} /></div>
            <p className="eco-val">{economy.in_circulation?.toLocaleString() ?? '—'}</p>
            <p className="eco-label">In Circulation</p>
          </div>
          <div className="eco-card glass">
            <div className="eco-icon success"><Trophy size={22} /></div>
            <p className="eco-val">{economy.earned_in_window?.toLocaleString() ?? '—'}</p>
            <p className="eco-label">Earned (30d)</p>
          </div>
          <div className="eco-card glass">
            <div className="eco-icon warning"><Coins size={22} /></div>
            <p className="eco-val">{economy.spent_in_window?.toLocaleString() ?? '—'}</p>
            <p className="eco-label">Spent (30d)</p>
          </div>
          <div className="eco-card glass">
            <div className="eco-icon secondary"><RefreshCw size={22} /></div>
            <p className="eco-val">{economy.transactions_in_window?.toLocaleString() ?? '—'}</p>
            <p className="eco-label">Transactions (30d)</p>
          </div>
        </div>
      )}

      {/* Top Earners */}
      {economy?.top_earners?.length > 0 && (
        <div className="glass rounded-xl p-6">
          <h3 className="section-title">Top Earners</h3>
          <div className="earners-list">
            {economy.top_earners.map((u, i) => (
              <div key={u.user_id || i} className="earner-row">
                <div className="earner-rank">#{i + 1}</div>
                <div className="earner-info">
                  <span className="earner-name">{u.full_name}</span>
                  <span className="earner-rank-title">{u.rank} · Lv.{u.level}</span>
                </div>
                <span className="earner-coins">🪙 {u.nova_coins?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quests Summary (read-only) */}
      <div className="glass quests-summary-wrap">
        <div className="section-header-row">
          <h3 className="section-title">Quests Overview</h3>
          <button className="quests-manage-link" onClick={() => navigate('/quests')}>
            <ScrollText size={15} />
            <span>Manage Quests</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {loading ? (
          <div className="game-loading"><Loader2 size={24} className="spin" style={{ opacity: 0.4 }} /></div>
        ) : quests.length === 0 ? (
          <div className="game-empty">
            No quests yet.{' '}
            <button className="link-btn" onClick={() => navigate('/quests')}>Create one →</button>
          </div>
        ) : (
          <>
            <div className="quests-summary-grid">
              <div className="qs-stat">
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                <span className="qs-count">{quests.filter(q => q.is_active ?? q.isActive).length}</span>
                <span className="qs-label">Active</span>
              </div>
              <div className="qs-stat">
                <XCircle size={18} style={{ color: 'var(--text-muted)' }} />
                <span className="qs-count">{quests.filter(q => !(q.is_active ?? q.isActive)).length}</span>
                <span className="qs-label">Inactive</span>
              </div>
              <div className="qs-stat">
                <Trophy size={18} style={{ color: 'var(--warning)' }} />
                <span className="qs-count">{quests.length}</span>
                <span className="qs-label">Total</span>
              </div>
            </div>

            <div className="qs-preview-list">
              {quests.slice(0, 5).map(q => (
                <div key={q._id || q.id} className="qs-preview-row">
                  <div className="qs-preview-info">
                    <span className="qs-preview-title">{q.title}</span>
                    <span className="qs-preview-cat">{q.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="reward-val">🪙 {q.reward_coins ?? q.rewardCoins ?? 0}</span>
                    <span className={`status-pill ${(q.is_active ?? q.isActive) ? 'active' : 'banned'}`}>
                      {(q.is_active ?? q.isActive) ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      className="toggle-btn"
                      onClick={() => handleToggleQuest(q._id || q.id, q.is_active ?? q.isActive)}
                      title="Toggle Active"
                    >
                      {(q.is_active ?? q.isActive)
                        ? <ToggleRight size={22} style={{ color: 'var(--success)' }} />
                        : <ToggleLeft size={22} style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  </div>
                </div>
              ))}
              {quests.length > 5 && (
                <button className="qs-more-btn" onClick={() => navigate('/quests')}>
                  +{quests.length - 5} more quests — View all
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Coin Adjust Modal */}
      {showCoinModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowCoinModal(false); setCoinResult(null); } }}>
          <div className="modal-box glass animate-fade-in">
            <h2>Adjust NovaCoins</h2>
            <form className="send-form" onSubmit={handleAdjustCoins}>
              <div className="send-field">
                <label>User ID</label>
                <input required placeholder="MongoDB ObjectId" value={coinForm.userId} onChange={e => setCoinForm(f => ({ ...f, userId: e.target.value }))} />
              </div>
              <div className="send-row">
                <div className="send-field">
                  <label>Amount (negative to deduct)</label>
                  <input required type="number" placeholder="+500 or -200" value={coinForm.amount} onChange={e => setCoinForm(f => ({ ...f, amount: e.target.value }))} />
                </div>
              </div>
              <div className="send-field">
                <label>Reason</label>
                <input required placeholder="Goodwill gesture..." value={coinForm.reason} onChange={e => setCoinForm(f => ({ ...f, reason: e.target.value }))} />
              </div>
              {coinResult && (
                <div className={`send-result ${coinResult.success ? 'success' : 'error'}`}>
                  {coinResult.success ? '✅ Coins adjusted successfully!' : `⚠️ ${coinResult.message}`}
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => { setShowCoinModal(false); setCoinResult(null); }}>Cancel</button>
                <button type="submit" className="primary-btn"><Coins size={16} /><span>Apply</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gamification;
