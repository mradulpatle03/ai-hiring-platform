const s = {
  wrap:  { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1.5rem' },
  btn:   (active, disabled) => ({
    padding: '7px 12px', borderRadius: '8px', fontSize: '13px', border: '1px solid',
    cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: active ? '600' : '400',
    background:   active   ? '#7F77DD' : '#fff',
    color:        active   ? '#fff'    : disabled ? '#ddd' : '#555',
    borderColor:  active   ? '#7F77DD' : disabled ? '#f0f0f0' : '#e0e0e0',
    opacity:      disabled ? 0.5 : 1,
  }),
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  // Show max 7 page buttons
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (page >= totalPages - 3) return [1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
    return [1, '...', page-1, page, page+1, '...', totalPages]
  }

  return (
    <div style={s.wrap}>
      <button style={s.btn(false, page === 1)} disabled={page === 1}
        onClick={() => onChange(page - 1)}>← Prev</button>

      {getPages().map((p, i) => (
        <button key={i}
          style={s.btn(p === page, p === '...')}
          disabled={p === '...'}
          onClick={() => p !== '...' && onChange(p)}>
          {p}
        </button>
      ))}

      <button style={s.btn(false, page === totalPages)} disabled={page === totalPages}
        onClick={() => onChange(page + 1)}>Next →</button>
    </div>
  )
}