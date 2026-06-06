import { X } from 'lucide-react'

const s = {
  wrap: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px', background: '#f0effc', border: '1px solid #c8c5f5', fontSize: '12px', color: '#5a52c0', fontWeight: '500' },
  x:    { cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9994dd' },
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
          <span style={s.x} onClick={() => handleRemove(chip)}>
            <X size={11}/>
          </span>
        </span>
      ))}
    </div>
  )
}