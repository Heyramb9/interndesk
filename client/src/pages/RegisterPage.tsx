import { useState, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Role } from '../types'
import '../styles/auth.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = (searchParams.get('role') as Role) || 'intern'

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    role: defaultRole as Role,
    agreed: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!form.agreed) {
      setError('Please agree to the Terms & Privacy Policy.')
      return
    }
    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.success && result.role) {
      navigate(`/${result.role}`)
    } else {
      setError(result.message || 'Registration failed.')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card-wrap">
        <header className="auth-topbar">
          <div className="auth-brand">
            <span className="auth-brand-main">INTERN DESK</span>
          </div>
          <nav className="auth-header-nav">
            <Link to="/" className="auth-nav-link">Home</Link>
          </nav>
          <div className="auth-header-roles">
            <span className="role-item">Intern</span>
            <span className="role-item">Mentor</span>
            <span className="role-item">Manager</span>
          </div>
        </header>

        <div className="register-container">
          <div className="auth-form-header" style={{ textAlign: 'left' }}>
            <h2>Create your account</h2>
            <p>Join Intern Desk — it's free and takes less than a minute.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="register-form-row">
              <div className="auth-form-group">
                <label>First Name</label>
                <input type="text" placeholder="Jane" required value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div className="auth-form-group">
                <label>Last Name</label>
                <input type="text" placeholder="Smith" required value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" required value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div className="register-form-row">
              <div className="auth-form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div className="auth-form-group">
                <label>Confirm Password</label>
                <input type="password" placeholder="••••••••" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              </div>
            </div>

            <div className="auth-form-group">
              <label>Company / Institution <span style={{ color: '#7c8ba5', fontSize: '0.85rem', fontWeight: 400 }}>(optional)</span></label>
              <input type="text" placeholder="e.g., Google, MIT, TCS" value={form.company} onChange={e => set('company', e.target.value)} />
            </div>

            <div className="role-group">
              <label className="auth-form-group" style={{ marginBottom: 0 }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1e3857' }}>I am joining as a</span>
              </label>
              <div className="role-options">
                {(['intern', 'mentor', 'manager'] as Role[]).map(r => (
                  <label key={r} className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={form.role === r}
                      onChange={() => set('role', r)}
                    />
                    <span className="role-label">{r.charAt(0).toUpperCase() + r.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="terms-group">
              <label className="auth-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={e => set('agreed', e.target.checked)}
                />
                <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
