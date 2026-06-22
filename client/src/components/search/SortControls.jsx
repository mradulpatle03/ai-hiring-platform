import { ArrowUpDown, LayoutList, LayoutGrid } from 'lucide-react'

const s = {
  wrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  select: {
    padding: '7px 10px',
    border: '1px solid rgba(11,14,20,0.20)',
    borderRadius: '2px',
    fontSize: '12px',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: '600',
    letterSpacing: '0.04em',
    background: '#fff',
    color: '#0B0E14',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  btn: (active) => ({
    padding: '7px 9px',
    border: '1px solid',
    borderRadius: '2px',
    background: active ? '#0B0E14' : '#fff',
    borderColor: active ? '#0B0E14' : 'rgba(11,14,20,0.20)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: active ? '#C8FF4D' : '#5C5F6B',
    transition: 'all 0.15s',
  }),
  count: {
    fontSize: '11px',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: '600',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: '#5C5F6B',
    whiteSpace: 'nowrap',
  },
}

export default function SortControls({ total, sortBy, sortOrder, view, onSort, onOrder, onView }) {
  return (
    <div style={s.wrap}>
      <span style={s.count}>{total} candidate{total !== 1 ? 's' : ''}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ArrowUpDown size={12} color="#8A8D98" />
        <select
          style={s.select}
          value={sortBy}
          onChange={e => onSort(e.target.value)}
          onFocus={e => e.target.style.borderColor = '#0B0E14'}
          onBlur={e => e.target.style.borderColor = 'rgba(11,14,20,0.20)'}
        >
          <option value="score">Sort: score</option>
          <option value="date">Sort: date</option>
          <option value="name">Sort: name</option>
        </select>

        <button
          style={s.btn(sortOrder === 'asc')}
          onClick={() => onOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          onMouseEnter={e => { if (sortOrder !== 'asc') { e.currentTarget.style.borderColor = '#0B0E14'; e.currentTarget.style.color = '#0B0E14' }}}
          onMouseLeave={e => { if (sortOrder !== 'asc') { e.currentTarget.style.borderColor = 'rgba(11,14,20,0.20)'; e.currentTarget.style.color = '#5C5F6B' }}}
        >
          <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", fontWeight: '700' }}>
            {sortOrder === 'asc' ? '↑' : '↓'}
          </span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          style={s.btn(view === 'list')}
          onClick={() => onView('list')}
          title="List view"
          onMouseEnter={e => { if (view !== 'list') { e.currentTarget.style.borderColor = '#0B0E14'; e.currentTarget.style.color = '#0B0E14' }}}
          onMouseLeave={e => { if (view !== 'list') { e.currentTarget.style.borderColor = 'rgba(11,14,20,0.20)'; e.currentTarget.style.color = '#5C5F6B' }}}
        >
          <LayoutList size={13} />
        </button>
        <button
          style={s.btn(view === 'grid')}
          onClick={() => onView('grid')}
          title="Grid view"
          onMouseEnter={e => { if (view !== 'grid') { e.currentTarget.style.borderColor = '#0B0E14'; e.currentTarget.style.color = '#0B0E14' }}}
          onMouseLeave={e => { if (view !== 'grid') { e.currentTarget.style.borderColor = 'rgba(11,14,20,0.20)'; e.currentTarget.style.color = '#5C5F6B' }}}
        >
          <LayoutGrid size={13} />
        </button>
      </div>
    </div>
  )
}