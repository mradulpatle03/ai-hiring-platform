import { useEffect }  from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth }    from '../../context/AuthContext'
import Layout         from '../../components/Layout'
import GitHubCard     from '../../components/github/GitHubCard'
import toast          from 'react-hot-toast'
import { User, Mail, Building } from 'lucide-react'

const s = {
  grid:    { display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' },
  card:    { background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem' },
  h2:      { fontSize: '16px', fontWeight: '600', marginBottom: '1.25rem' },
  row:     { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #f5f5f5' },
  label:   { fontSize: '12px', color: '#888', width: '80px', flexShrink: 0 },
  value:   { fontSize: '14px', color: '#1a1a1a', fontWeight: '500' },
  avatar:  { width: '64px', height: '64px', borderRadius: '50%', background: '#f0effc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' },
  name:    { fontSize: '20px', fontWeight: '600', marginBottom: '4px' },
  role:    { fontSize: '13px', color: '#888', marginBottom: '1.25rem' },
  boostBox:{ background: '#f0effc', border: '1px solid #c8c5f5', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.25rem' },
  boostTxt:{ fontSize: '13px', color: '#3C3489', lineHeight: 1.5 },
  h1:      { fontSize: '20px', fontWeight: '600', marginBottom: '4px' },
  sub:     { fontSize: '13px', color: '#888', marginBottom: '1.5rem' },
}

export default function CandidateProfile() {
  const { user }          = useAuth()
  const [params, setParams] = useSearchParams()

  // Handle GitHub OAuth redirect
  useEffect(() => {
    const status = params.get('github')
    if (status === 'connected') {
      toast.success('GitHub connected! Your next applications will include GitHub data.')
      setParams({})
    } else if (status === 'error') {
      toast.error('GitHub connection failed. Please try again.')
      setParams({})
    }
  }, [params, setParams])

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <Layout>
      <div style={s.h1}>My Profile</div>
      <div style={s.sub}>Manage your profile and connected accounts</div>

      <div style={s.grid}>
        {/* Left — profile info */}
        <div>
          <div style={s.card}>
            <div style={s.avatar}>
              <span style={{ fontSize: '22px', fontWeight: '600', color: '#7F77DD' }}>{initials}</span>
            </div>
            <div style={s.name}>{user?.name}</div>
            <div style={s.role}>Job Seeker · HireAI</div>

            <div style={s.boostBox}>
              <div style={s.boostTxt}>
                <strong>💡 Tip:</strong> Connecting your GitHub can boost your AI match score by up to 30 points. Recruiters love seeing real code activity.
              </div>
            </div>

            <div style={s.h2}>Account details</div>

            {[
              { icon: <User  size={14} color="#7F77DD"/>, label: 'Name',  value: user?.name  },
              { icon: <Mail  size={14} color="#7F77DD"/>, label: 'Email', value: user?.email },
              { icon: <Building size={14} color="#7F77DD"/>, label: 'Role', value: 'Candidate' },
            ].map(({ icon, label, value }) => (
              <div key={label} style={s.row}>
                {icon}
                <span style={s.label}>{label}</span>
                <span style={s.value}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — GitHub card */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px' }}>
            GitHub Integration
          </div>
          <GitHubCard/>
        </div>
      </div>
    </Layout>
  )
}