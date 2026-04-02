import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'candidate', company: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      navigate(user.role === 'recruiter' ? '/recruiter' : '/candidate')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.sub}>Join the AI Hiring Platform</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role toggle */}
          <div style={styles.roleToggle}>
            {['candidate', 'recruiter'].map(r => (
              <button
                key={r} type="button"
                onClick={() => setForm(p => ({ ...p, role: r }))}
                style={{ ...styles.roleBtn, ...(form.role === r ? styles.roleBtnActive : {}) }}
              >
                {r === 'candidate' ? 'Job Seeker' : 'Recruiter'}
              </button>
            ))}
          </div>

          <input
            style={styles.input} name="name" placeholder="Full name"
            value={form.name} onChange={handleChange} required
          />
          <input
            style={styles.input} name="email" type="email" placeholder="Email"
            value={form.email} onChange={handleChange} required
          />
          <input
            style={styles.input} name="password" type="password" placeholder="Password (min 6 chars)"
            value={form.password} onChange={handleChange} required minLength={6}
          />
          {form.role === 'recruiter' && (
            <input
              style={styles.input} name="company" placeholder="Company name"
              value={form.company} onChange={handleChange} required
            />
          )}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page:        { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card:        { background: '#fff', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  title:       { fontSize: '22px', fontWeight: '500', margin: '0 0 4px' },
  sub:         { color: '#888', fontSize: '14px', margin: '0 0 1.5rem' },
  error:       { background: '#fff0f0', color: '#c0392b', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem' },
  roleToggle:  { display: 'flex', gap: '8px', marginBottom: '1rem' },
  roleBtn:     { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer', fontSize: '13px' },
  roleBtnActive: { background: '#7F77DD', color: '#fff', borderColor: '#7F77DD' },
  input:       { width: '100%', padding: '10px 12px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  btn:         { width: '100%', padding: '11px', background: '#7F77DD', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: '500' },
  footer:      { textAlign: 'center', fontSize: '13px', marginTop: '1rem', color: '#666' },
}