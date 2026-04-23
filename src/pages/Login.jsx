import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, Zap } from 'lucide-react';
import adminApi from '../utils/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.login({ email, password });
      // Backend: { success, data: { user, tokens: { accessToken: { token }, refreshToken: { token } } } }
      const token =
        res?.data?.tokens?.accessToken?.token ||
        res?.data?.token ||
        res?.token;
      if (!token) throw new Error('No access token in response. Are you an admin?');
      localStorage.setItem('zenova_admin_token', token);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <div className="login-card glass animate-fade-in">
        <div className="login-logo">
          <div className="logo-icon-lg"><Zap size={28} /></div>
          <h1>ZENOVA</h1>
          <p>Admin Panel</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@zenova.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="pwd-wrapper">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="login-hint">
          Requires <strong>Administrator</strong> or <strong>Moderator</strong> role.
        </p>
      </div>
    </div>
  );
};

export default Login;
