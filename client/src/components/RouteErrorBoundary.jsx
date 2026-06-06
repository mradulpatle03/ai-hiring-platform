import { Component } from 'react'
import { Link }      from 'react-router-dom'
import { useAuth }   from '../context/AuthContext'

const s = {
  wrap:  { padding: '3rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card:  { background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' },
  icon:  { fontSize: '36px', marginBottom: '12px' },
  title: { fontSize: '16px', fontWeight: '600', marginBottom: '6px' },
  sub:   { fontSize: '13px', color: '#888', marginBottom: '1.5rem', lineHeight: 1.6 },
  btn:   { display: 'inline-block', padding: '9px 20px', background: '#7F77DD', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '500', textDecoration: 'none' },
}

class RouteErrorBoundaryInner extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Route error:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const homeLink = this.props.role === 'recruiter'
      ? '/recruiter' : this.props.role === 'candidate'
      ? '/candidate' : '/'

    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.icon}>🔧</div>
          <div style={s.title}>This page ran into a problem</div>
          <div style={s.sub}>
            Don't worry — the rest of the app is fine.
            Head back to your dashboard.
          </div>
          <Link to={homeLink} style={s.btn}
            onClick={() => this.setState({ hasError: false })}>
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }
}

// Wrapper to access auth context (class components can't use hooks directly)
export default function RouteErrorBoundary({ children }) {
  const { user } = useAuth()
  return (
    <RouteErrorBoundaryInner role={user?.role}>
      {children}
    </RouteErrorBoundaryInner>
  )
}