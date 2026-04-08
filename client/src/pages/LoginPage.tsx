import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import { ToastContainer, useToast } from '../components/ui/Toast'
import '../styles/auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { messages: toasts, toast, remove: removeToast } = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success && result.role) {
      navigate(`/${result.role}`)
    } else {
      setError(result.message || 'Invalid email or password.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card login-card-wrap">
        <header className="auth-topbar">
          <div className="auth-brand">
            <span className="auth-brand-main">INTERN DESK</span>
          </div>
          <nav className="auth-header-nav">
            <Link to="/" className="auth-nav-link">Home</Link>
          </nav>
        </header>

        <div className="auth-container">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your Intern Desk account</p>
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="auth-form-options">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="auth-forgot-link" onClick={(e) => { e.preventDefault(); setForgotOpen(true); setResetEmail(email); }}>Forgot password?</a>
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="auth-switch">
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>

          <div className="auth-demo-hint">
            <span>💡</span>
            <div>
              <strong>Demo credentials:</strong><br />
              intern@demo.com / mentor@demo.com / manager@demo.com<br />
              Password: <code>demo123</code>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer messages={toasts} onRemove={removeToast} />

      <Modal open={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset Password"
        footer={<><button className="auth-submit-btn" style={{ padding: '0.4rem 1rem', background: '#e2e8f0', color: '#333' }} onClick={() => setForgotOpen(false)}>Cancel</button><button className="auth-submit-btn" style={{ padding: '0.4rem 1rem' }} onClick={() => { setForgotOpen(false); toast(`Password reset link sent to ${resetEmail || email || 'your email'}.`, 'success'); }}>Send Link</button></>}
      >
        <div className="auth-form-group">
          <label htmlFor="reset-email">Email Address</label>
          <input type="email" id="reset-email" placeholder="Enter your email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>We'll send you an email with instructions to reset your password.</p>
        </div>
      </Modal>

    </div>
  )
}
