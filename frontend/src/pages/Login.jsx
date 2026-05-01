import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logo}>TeamFlow</div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.sub}>Sign in to continue to your workspace</p>

        {error && <div className="error-msg" style={{marginBottom:16}}>{error}</div>}

        <form onSubmit={handle} style={styles.form}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password:e.target.value})} required />
          </div>
          <button className="btn btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account? <Link to="/signup" style={{color:'var(--accent)'}}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  root: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    background:'radial-gradient(ellipse at 50% 0%, rgba(124,106,247,0.15) 0%, transparent 60%)' },
  card: { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, padding:'40px 36px',
    width:'100%', maxWidth:420, boxShadow:'var(--shadow), var(--shadow-accent)' },
  logo: { fontFamily:'var(--font-head)', fontSize:26, fontWeight:800,
    background:'linear-gradient(135deg,var(--accent),var(--accent2))',
    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', marginBottom:24 },
  title: { fontFamily:'var(--font-head)', fontSize:28, fontWeight:800, marginBottom:6 },
  sub: { color:'var(--text2)', fontSize:14, marginBottom:28 },
  form: { display:'flex', flexDirection:'column', gap:16 },
  footer: { marginTop:24, textAlign:'center', fontSize:14, color:'var(--text2)' }
};
