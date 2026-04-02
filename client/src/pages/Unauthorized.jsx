import { Link } from 'react-router-dom'
export default function Unauthorized() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <Link to="/login">Go back to login</Link>
    </div>
  )
}