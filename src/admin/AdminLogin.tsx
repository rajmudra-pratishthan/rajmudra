import { useState, type FormEvent } from 'react';
import { LogIn, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase!.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    setLoading(false);
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <ShieldCheck size={28} color="#3b82f6" />
          <span>Rajmudra Pratishthan · Admin</span>
        </div>
        <h1>Sign in</h1>
        <p>Access the admin dashboard</p>
        <form onSubmit={handleSubmit} className="a-form">
          <div className="a-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" autoComplete="email" />
          </div>
          <div className="a-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" autoComplete="current-password" />
          </div>
          {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            <LogIn size={15} />{loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
