import { MapPin, Clock, Building } from 'lucide-react'

const s = {
  card:    { background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', transition: 'border-color 0.15s', cursor: 'pointer' },
  title:   { fontWeight: '600', fontSize: '15px', marginBottom: '4px' },
  company: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#555', marginBottom: '10px' },
  meta:    { display: 'flex', gap: '12px', fontSize: '12px', color: '#888', marginBottom: '10px' },
  skills:  { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  skill:   { background: '#f0effc', color: '#5a52c0', fontSize: '11px', padding: '3px 9px', borderRadius: '999px' },
}

export default function JobCard({ job, onClick, action }) {
  return (
    <div style={s.card} onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#7F77DD'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
    >
      <div style={s.title}>{job.title}</div>
      <div style={s.company}><Building size={12}/>{job.company}</div>
      <div style={s.meta}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11}/>{job.location}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11}/>{job.experienceYears}+ yrs
        </span>
        {job.salary && <span>${job.salary}</span>}
      </div>
      {job.skillsRequired?.length > 0 && (
        <div style={s.skills}>
          {job.skillsRequired.slice(0, 4).map(sk => (
            <span key={sk} style={s.skill}>{sk}</span>
          ))}
          {job.skillsRequired.length > 4 &&
            <span style={{ ...s.skill, background: '#f5f5f5', color: '#888' }}>
              +{job.skillsRequired.length - 4}
            </span>}
        </div>
      )}
      {action && <div style={{ marginTop: '12px' }}>{action}</div>}
    </div>
  )
}