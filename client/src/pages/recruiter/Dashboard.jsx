import { useAuth } from '../../context/AuthContext'

export default function RecruiterDashboard() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Welcome, {user?.name} </h2>
      <p style={{ color: '#888' }}>Recruiter dashboard — coming in Phase 4</p>
      <button onClick={logout} style={{ marginTop: '1rem', padding: '8px 16px', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  )
}