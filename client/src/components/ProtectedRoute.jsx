import { Navigate }  from 'react-router-dom'
import { useAuth }   from '../context/AuthContext'
import PageLoader    from './PageLoader'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader message="Checking session..."/>
  if (!user)   return <Navigate to="/login" replace/>
  if (role && user.role !== role) return <Navigate to="/unauthorized" replace/>

  return children
}

export default ProtectedRoute