import { useState } from 'react'
import ScoreRangeSlider from './ScoreRangeSlider'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { color, font } from '../../styles/theme'

const statusOptions = [
  { value: 'screened',    label: 'Screened'    },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected',    label: 'Rejected'    },
  { value: 'pending',     label: 'Pending'     },
  { value: 'screening',   label: 'Screening'   },
]

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div
      style={{
        marginBottom: '1.25rem',
        paddingBottom: '1.25rem',
        borderBottom: `1px solid ${color.lineLight}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          marginBottom: open ? '10px' : 0,
        }}
        onClick={() => setOpen(p => !p)}
      >
        <span
          style={{
            fontFamily: font.mono,
            fontSize: '10px',
            fontWeight: 700,
            color: color.graphite,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {title}
        </span>
        {open
          ? <ChevronUp size={12} color={color.graphiteDim} />
          : <ChevronDown size={12} color={color.graphiteDim} />
        }
      </div>
      {open && children}
    </div>
  )
}

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
    <div
      style={{
        background: '#fff',
        border: `1px solid ${color.lineLight}`,
        padding: '1.25rem',
        position: 'sticky',
        top: '76px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <span
          style={{
            fontFamily: font.mono,
            fontSize: '11px',
            fontWeight: 700,
            color: color.ink,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          Filters
        </span>
        {hasFilters && (
          <button
            style={{
              fontFamily: font.mono,
              fontSize: '10px',
              fontWeight: 700,
              color: color.signal,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            onClick={onClear}
          >
            Clear all
          </button>
        )}
      </div>

      {/* AI Score */}
      <CollapsibleSection title="AI Score">
        <ScoreRangeSlider
          minValue={filters.minScore || 0}
          maxValue={filters.maxScore || 100}
          onChange={(min, max) => onChange({
            minScore: min > 0   ? min : '',
            maxScore: max < 100 ? max : '',
          })}
        />
        {facets?.scoreRanges?.filter(r => r._id !== 'unscored').map(bucket => {
          const labels = { 0: '0–24', 25: '25–49', 50: '50–74', 75: '75–100' }
          return (
            <div
              key={bucket._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: font.mono,
                fontSize: '11px',
                color: color.graphite,
                padding: '3px 0',
              }}
            >
              <span>{labels[bucket._id] || bucket._id}</span>
              <span style={{ color: color.graphiteDim }}>{bucket.count}</span>
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
            <div
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 0',
                cursor: 'pointer',
              }}
              onClick={() => toggleStatus(opt.value)}
            >
              {/* Square checkbox — Signal style */}
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  border: `1px solid ${checked ? color.ink : color.lineLightStrong}`,
                  background: checked ? color.ink : '#fff',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                {checked && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4L3.5 6L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: '11px',
                  color: checked ? color.ink : color.graphite,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontWeight: checked ? 700 : 500,
                }}
              >
                {opt.label}
              </span>
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: '10px',
                  color: color.graphiteDim,
                  marginLeft: 'auto',
                }}
              >
                {count}
              </span>
            </div>
          )
        })}
      </CollapsibleSection>

      {/* Skills */}
      <CollapsibleSection title="Has skill">
        <input
          style={{
            width: '100%',
            padding: '7px 10px',
            border: `1px solid ${color.lineLightStrong}`,
            fontFamily: font.mono,
            fontSize: '11px',
            outline: 'none',
            marginBottom: '8px',
            boxSizing: 'border-box',
            background: color.paper,
            color: color.ink,
          }}
          placeholder="Search skills..."
          value={skillSearch}
          onChange={e => setSkillSearch(e.target.value)}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {filteredSkills.slice(0, 12).map(skill => {
            const active = selectedSkills.includes(skill._id)
            return (
              <span
                key={skill._id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: font.mono,
                  fontSize: '10px',
                  fontWeight: active ? 700 : 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                  padding: '3px 8px',
                  border: `1px solid ${active ? color.ink : color.lineLight}`,
                  background: active ? color.ink : '#fff',
                  color: active ? '#fff' : color.graphite,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onClick={() => toggleSkill(skill._id)}
              >
                {active && <X size={8} />}
                {skill._id}
                <span style={{ opacity: 0.5, marginLeft: '2px' }}>({skill.count})</span>
              </span>
            )
          })}
          {filteredSkills.length === 0 && (
            <span
              style={{
                fontFamily: font.mono,
                fontSize: '11px',
                color: color.graphiteDim,
              }}
            >
              No skills found
            </span>
          )}
        </div>
      </CollapsibleSection>

      {/* GitHub */}
      <CollapsibleSection title="GitHub" defaultOpen={false}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 0',
          }}
        >
          <span
            style={{
              fontFamily: font.mono,
              fontSize: '11px',
              color: color.graphite,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            GitHub connected only
          </span>
          {/* Signal toggle */}
          <div
            style={{
              width: '34px',
              height: '18px',
              background: filters.hasGitHub === 'true' ? color.ink : color.paper3,
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
            onClick={() =>
              onChange({ hasGitHub: filters.hasGitHub === 'true' ? '' : 'true' })
            }
          >
            <div
              style={{
                position: 'absolute',
                top: '2px',
                left: filters.hasGitHub === 'true' ? '18px' : '2px',
                width: '14px',
                height: '14px',
                background: '#fff',
                transition: 'left 0.2s',
              }}
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}