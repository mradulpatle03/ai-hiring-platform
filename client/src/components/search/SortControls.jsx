import { ArrowUpDown, LayoutList, LayoutGrid } from 'lucide-react'

const s = {
  wrap:   { display: 'flex', alignItems: 'center', gap: '10px' },
  select: { padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' },
  btn:    (active) => ({
    padding: '8px', border: '1px solid', borderRadius: '8px', background: active ? '#f0effc' : '#fff',
    borderColor: active ? '#c8c5f5' : '#e0e0e0', cursor: 'pointer', display: 'flex', alignItems: 'center',
    color: active ? '#7F77DD' : '#888',
  }),
  count:  { fontSize: '13px', color: '#888', whiteSpace: 'nowrap' },
}

export default function SortControls({ total, sortBy, sortOrder, view, onSort, onOrder, onView }) {
  return (
    <div style={s.wrap}>
      <span style={s.count}>{total} candidate{total !== 1 ? 's' : ''}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ArrowUpDown size={13} color="#aaa"/>
        <select style={s.select} value={sortBy} onChange={e => onSort(e.target.value)}>
          <option value="score">Sort by score</option>
          <option value="date">Sort by date</option>
          <option value="name">Sort by name</option>
        </select>

        <button style={s.btn(sortOrder === 'asc')} onClick={() => onOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}>
          <span style={{ fontSize: '12px', fontWeight: '500' }}>{sortOrder === 'asc' ? '↑' : '↓'}</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button style={s.btn(view === 'list')} onClick={() => onView('list')} title="List view">
          <LayoutList size={14}/>
        </button>
        <button style={s.btn(view === 'grid')} onClick={() => onView('grid')} title="Grid view">
          <LayoutGrid size={14}/>
        </button>
      </div>
    </div>
  )
}