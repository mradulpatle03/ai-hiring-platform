import { X } from 'lucide-react'

const s = {
  wrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' },
  chip: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 10px',
    background: '#EFECE3', border: '1px solid rgba(11,14,20,0.20)',
    borderRadius: '2px',
    fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
    fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase',
    color: '#5C5F6B',
  },
  x: { cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#8A8D98' },
}

export default function ActiveFilters({ filters, onRemove }) {
  const chips = []

  if (filters.search)
    chips.push({ key: 'search', label: `"${filters.search}"` })

  if (filters.minScore || filters.maxScore)
    chips.push({ key: 'score', label: `Score: ${filters.minScore || 0}–${filters.maxScore || 100}` })

  if (filters.status)
    chips.push({ key: 'status', label: `Status: ${filters.status}` })

  if (filters.hasGitHub === 'true')
    chips.push({ key: 'hasGitHub', label: 'GitHub connected' })

  if (filters.skills) {
    filters.skills.split(',').filter(Boolean).forEach(sk => {
      chips.push({ key: `skill_${sk}`, label: `Has: ${sk}`, skillToRemove: sk })
    })
  }

  if (chips.length === 0) return null

  const handleRemove = (chip) => {
    if (chip.skillToRemove) {
      const remaining = filters.skills.split(',').filter(s => s !== chip.skillToRemove).join(',')
      onRemove({ skills: remaining })
    } else {
      onRemove({ [chip.key]: '' })
    }
  }

  return (
    <div style={s.wrap}>
      {chips.map(chip => (
        <span key={chip.key} style={s.chip}>
          {chip.label}
          <span
            style={s.x}
            onClick={() => handleRemove(chip)}
            onMouseEnter={e => e.currentTarget.style.color = '#FF4D2E'}
            onMouseLeave={e => e.currentTarget.style.color = '#8A8D98'}
          >
            <X size={10} />
          </span>
        </span>
      ))}
    </div>
  )
}