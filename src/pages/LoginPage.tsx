import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminFetch } from '../api/hmac';
import '../styles/login.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Verify by making a real admin request
      const res = await adminFetch('/api/admin/orders?status=PAID', {}, secret.trim());
      if (res.ok || res.status === 200) {
        login(secret.trim());
        navigate('/orders');
      } else if (res.status === 401) {
        setError('Invalid secret key. Please check your ADMIN_SECRET.');
      } else {
        setError(`Unexpected error: ${res.status}`);
      }
    } catch {
      setError('Cannot connect to backend. Make sure it is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1>Ever Age Admin</h1>
        <p className="login-subtitle">Enter your admin secret key to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Admin secret key"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            autoFocus
            disabled={loading}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading || !secret.trim()}>
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
        <p className="login-note">
          Secret is kept in memory only — will be cleared on page refresh.
        </p>
      </div>
    </div>
  );
}
