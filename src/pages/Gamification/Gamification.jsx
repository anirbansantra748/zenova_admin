import { useState, useEffect } from 'react';
import { Trophy, Coins, Plus, ToggleLeft, ToggleRight, Loader2, RefreshCw, CircleDollarSign, Edit3 } from 'lucide-react';
import adminApi from '../../utils/api';
import './Gamification.css';

const Gamification = () => {
  const [economy, setEconomy] = useState(null);
  const [quests, setQuests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [coinForm, setCoinForm] = useState({ userId: '', amount: '', reason: '' });
  const [questForm, setQuestForm] = useState({ title: '', description: '', condition: '', rewardCoins: '', category: 'daily', resetPeriod: 'daily' });
  const [editQuestId, setEditQuestId] = useState(null);
  const [coinResult, setCoinResult] = useState(null);
  const [questResult, setQuestResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ecoRes, questsRes, txRes] = await Promise.allSettled([
        adminApi.economyOverview(30),
        adminApi.listQuests({}),
        adminApi.listTransactions({ limit: 20 }),
      ]);
      if (ecoRes.status === 'fulfilled') setEconomy(ecoRes.value?.data);
      // Backend questAdminService returns { data: [ ...quests ] } directly
      if (questsRes.status === 'fulfilled') {
        const qd = questsRes.value?.data;
        setQuests(Array.isArray(qd) ? qd : (qd?.quests || qd?.items || []));
      }
      // Backend listTransactions returns { data: { items: [...] } }
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

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    try {
      if (editQuestId) {
        await adminApi.updateQuest(editQuestId, { ...questForm, rewardCoins: Number(questForm.rewardCoins) });
        setQuestResult({ success: true, message: 'Quest updated!' });
      } else {
        await adminApi.createQuest({ ...questForm, rewardCoins: Number(questForm.rewardCoins), isActive: true });
        setQuestResult({ success: true, message: 'Quest created!' });
      }
      fetchData();
    } catch (err) {
      setQuestResult({ success: false, message: err?.message });
    }
  };

  const openEditQuest = (q) => {
    setEditQuestId(q._id || q.id);
    setQuestForm({
      title: q.title || '',
      description: q.description || '',
      condition: q.condition || '',
      rewardCoins: q.rewardCoins ?? q.reward_coins ?? '',
      category: q.category || 'daily',
      resetPeriod: q.resetPeriod ?? q.reset_period ?? 'daily'
    });
    setShowQuestModal(true);
    setQuestResult(null);
  };

  return (
    <div className="gamification-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Gamification & Quests</h1>
          <p>Manage NovaCoins economy and player quests.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="primary-btn" onClick={() => {
            setEditQuestId(null);
            setQuestForm({ title: '', description: '', condition: '', rewardCoins: '', category: 'daily', resetPeriod: 'daily' });
            setShowQuestModal(true);
          }}>
            <Plus size={16} /> <span>New Quest</span>
          </button>
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

      {/* Quests Table */}
      <div className="glass quests-table-wrap">
        <div className="section-header-row">
          <h3 className="section-title">Active Quests</h3>
        </div>
        {loading ? (
          <div className="game-loading"><Loader2 size={24} className="spin" style={{ opacity: 0.4 }} /></div>
        ) : quests.length === 0 ? (
          <div className="game-empty">No quests yet. Create one above.</div>
        ) : (
          <table className="game-table">
            <thead>
              <tr>
                <th>Quest</th>
                <th>Category</th>
                <th>Reward</th>
                <th>Reset</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quests.map(q => (
                <tr key={q._id || q.id}>
                  <td>
                    <div className="quest-title">{q.title}</div>
                    <div className="quest-desc">{q.description}</div>
                  </td>
                  {/* Backend fields are camelCase from questModel: category, rewardCoins, resetPeriod, isActive */}
                  <td><span className="notif-category-pill">{q.category}</span></td>
                  <td><span className="reward-val">🪙 {q.rewardCoins ?? q.reward_coins}</span></td>
                  <td className="text-muted">{q.resetPeriod ?? q.reset_period}</td>
                  <td>
                    <span className={`status-pill ${(q.isActive ?? q.is_active) ? 'active' : 'banned'}`}>
                      {(q.isActive ?? q.is_active) ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="toggle-btn" onClick={() => handleToggleQuest(q._id || q.id, q.isActive ?? q.is_active)} title="Toggle Active">
                        {(q.isActive ?? q.is_active) ? <ToggleRight size={22} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={22} style={{ color: 'var(--text-muted)' }} />}
                      </button>
                      <button className="toggle-btn" onClick={() => openEditQuest(q)} title="Edit Quest">
                        <Edit3 size={18} style={{ color: 'var(--primary)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Create Quest Modal */}
      {showQuestModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowQuestModal(false); setQuestResult(null); } }}>
          <div className="modal-box glass animate-fade-in">
            <h2>{editQuestId ? 'Edit Quest' : 'Create Quest'}</h2>
            <form className="send-form" onSubmit={handleCreateQuest}>
              <div className="send-field">
                <label>Title</label>
                <input required placeholder="7-day streak" value={questForm.title} onChange={e => setQuestForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="send-field">
                <label>Description</label>
                <textarea rows={2} placeholder="Log activity 7 days in a row" value={questForm.description} onChange={e => setQuestForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="send-field">
                <label>Condition</label>
                <input required placeholder="Log 7 workouts" value={questForm.condition} onChange={e => setQuestForm(f => ({ ...f, condition: e.target.value }))} />
              </div>
              <div className="send-row">
                <div className="send-field">
                  <label>Reward Coins</label>
                  <input required type="number" placeholder="250" value={questForm.rewardCoins} onChange={e => setQuestForm(f => ({ ...f, rewardCoins: e.target.value }))} />
                </div>
                <div className="send-field">
                  <label>Category</label>
                  <select value={questForm.category} onChange={e => setQuestForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="milestone">Milestone</option>
                    <option value="special">Special</option>
                  </select>
                </div>
                <div className="send-field">
                  <label>Reset Period</label>
                  <select value={questForm.resetPeriod} onChange={e => setQuestForm(f => ({ ...f, resetPeriod: e.target.value }))}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              {questResult && (
                <div className={`send-result ${questResult.success ? 'success' : 'error'}`}>
                  {questResult.success ? `✅ ${questResult.message}` : `⚠️ ${questResult.message}`}
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => { setShowQuestModal(false); setQuestResult(null); }}>Cancel</button>
                <button type="submit" className="primary-btn"><Plus size={16} /><span>{editQuestId ? 'Save' : 'Create'}</span></button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gamification;
