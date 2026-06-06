import { useState } from 'react'
import ScoreRangeSlider from './ScoreRangeSlider'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

const s = {
  sidebar:  { background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem', position: 'sticky', top: '76px' },
  header:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title:    { fontSize: '14px', fontWeight: '600' },
  clearBtn: { fontSize: '12px', color: '#7F77DD', background: 'none', border: 'none', cursor: 'pointer', padding: '0' },
  section:  { marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f5f5f5' },
  secHead:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' },
  secLabel: { fontSize: '12px', fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: '0.04em' },
  optRow:   { display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', cursor: 'pointer' },
  checkbox: (checked) => ({
    width: '15px', height: '15px', borderRadius: '4px', border: `2px solid ${checked ? '#7F77DD' : '#ddd'}`,
    background: checked ? '#7F77DD' : '#fff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  check:    { color: '#fff', fontSize: '10px', fontWeight: '700' },
  optLabel: { fontSize: '13px', color: '#444' },
  optCount: { fontSize: '11px', color: '#aaa', marginLeft: 'auto' },
  skillPill:{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '999px', fontSize: '11px', border: '1px solid #eee', background: '#f5f5f5', color: '#555', marginRight: '4px', marginBottom: '4px', cursor: 'pointer' },
  skillActive: { background: '#f0effc', borderColor: '#c8c5f5', color: '#5a52c0' },
  searchInp:{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: '7px', fontSize: '12px', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' },
  toggle:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' },
  switch:   (on) => ({
    width: '36px', height: '20px', borderRadius: '10px', background: on ? '#7F77DD' : '#ddd',
    position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
  }),
  knob:     (on) => ({
    position: 'absolute', top: '2px', left: on ? '18px' : '2px', width: '16px', height: '16px',
    borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
  }),
}

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={s.section}>
      <div style={s.secHead} onClick={() => setOpen(p => !p)}>
        <span style={s.secLabel}>{title}</span>
        {open ? <ChevronUp size={13} color="#aaa"/> : <ChevronDown size={13} color="#aaa"/>}
      </div>
      {open && children}
    </div>
  )
}

const statusOptions = [
  { value: 'screened',    label: 'Screened'    },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected',    label: 'Rejected'    },
  { value: 'pending',     label: 'Pending'     },
  { value: 'screening',   label: 'Screening'   },
]

export default function FilterSidebar({ filters, facets, onChange, onClear }) {
  const [skillSearch, setSkillSearch] = useState('')

  const topSkills = facets?.topMissingSkills || []
  const filteredSkills = topSkills.filter(s =>
    s._id.toLowerCase().includes(skillSearch.toLowerCase())
  )

  const selectedSkills = filters.skills
    ? filters.skills.split(',').filter(Boolean)
    : []

  const toggleSkill = (skill) => {
    const current = selectedSkills
    const next = current.includes(skill)
      ? current.filter(s => s !== skill)
      : [...current, skill]
    onChange({ skills: next.join(',') || '' })
  }

  const toggleStatus = (val) => {
    onChange({ status: filters.status === val ? '' : val })
  }

  const hasFilters = filters.minScore || filters.maxScore || filters.skills ||
                     filters.status   || filters.hasGitHub

  return (
    <div style={s.sidebar}>
      <div style={s.header}>
        <span style={s.title}>Filters</span>
        {hasFilters && (
          <button style={s.clearBtn} onClick={onClear}>Clear all</button>
        )}
      </div>

      {/* Score range */}
      <CollapsibleSection title="AI Score">
        <ScoreRangeSlider
          minValue={filters.minScore || 0}
          maxValue={filters.maxScore || 100}
          onChange={(min, max) => onChange({
            minScore: min > 0   ? min : '',
            maxScore: max < 100 ? max : '',
          })}
        />
        {/* Score buckets from facets */}
        {facets?.scoreRanges?.filter(r => r._id !== 'unscored').map(bucket => {
          const labels = { 0: '0–24', 25: '25–49', 50: '50–74', 75: '75–100' }
          return (
            <div key={bucket._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', padding: '2px 0' }}>
              <span>{labels[bucket._id] || bucket._id}</span>
              <span style={{ color: '#aaa' }}>{bucket.count}</span>
            </div>
          )
        })}
      </CollapsibleSection>

      {/* Status */}
      <CollapsibleSection title="Status">
        {statusOptions.map(opt => {
          const count   = facets?.statusCounts?.find(s => s._id === opt.value)?.count || 0
          const checked = filters.status === opt.value
          return (
            <div key={opt.value} style={s.optRow} onClick={() => toggleStatus(opt.value)}>
              <div style={s.checkbox(checked)}>
                {checked && <span style={s.check}>✓</span>}
              </div>
              <span style={s.optLabel}>{opt.label}</span>
              <span style={s.optCount}>{count}</span>
            </div>
          )
        })}
      </CollapsibleSection>

      {/* Skills */}
      <CollapsibleSection title="Has skill">
        <input
          style={s.searchInp}
          placeholder="Search skills..."
          value={skillSearch}
          onChange={e => setSkillSearch(e.target.value)}
        />
        <div>
          {filteredSkills.slice(0, 12).map(skill => {
            const active = selectedSkills.includes(skill._id)
            return (
              <span key={skill._id}
                style={{ ...s.skillPill, ...(active ? s.skillActive : {}) }}
                onClick={() => toggleSkill(skill._id)}>
                {active && <X size={9}/>}
                {skill._id}
                <span style={{ color: '#bbb', marginLeft: '2px' }}>({skill.count})</span>
              </span>
            )
          })}
          {filteredSkills.length === 0 && (
            <span style={{ fontSize: '12px', color: '#bbb' }}>No skills found</span>
          )}
        </div>
      </CollapsibleSection>

      {/* GitHub */}
      <CollapsibleSection title="GitHub" defaultOpen={false}>
        <div style={s.toggle}>
          <span style={{ fontSize: '13px', color: '#444' }}>GitHub connected only</span>
          <div style={s.switch(filters.hasGitHub === 'true')}
            onClick={() => onChange({ hasGitHub: filters.hasGitHub === 'true' ? '' : 'true' })}>
            <div style={s.knob(filters.hasGitHub === 'true')}/>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}