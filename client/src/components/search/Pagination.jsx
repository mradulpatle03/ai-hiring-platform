const s = {
  wrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '1.5rem' },
  btn: (active, disabled) => ({
    padding: '6px 11px',
    borderRadius: '2px',
    fontSize: '12px',
    border: '1px solid',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: '600',
    letterSpacing: '0.04em',
    background: active ? '#0B0E14' : '#fff',
    color:      active ? '#C8FF4D' : disabled ? '#8A8D98' : '#5C5F6B',
    borderColor: active ? '#0B0E14' : disabled ? 'rgba(11,14,20,0.10)' : 'rgba(11,14,20,0.20)',
    opacity: disabled ? 0.5 : 1,
    transition: 'border-color 0.15s, color 0.15s',
  }),
}

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
    if (page >= totalPages - 3) return [1, '...', totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages]
    return [1, '...', page-1, page, page+1, '...', totalPages]
  }

  return (
    <div style={s.wrap}>
      <button
        style={s.btn(false, page === 1)}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        onMouseEnter={e => { if (page !== 1) e.currentTarget.style.borderColor = '#0B0E14'; e.currentTarget.style.color = '#0B0E14' }}
        onMouseLeave={e => { if (page !== 1) e.currentTarget.style.borderColor = 'rgba(11,14,20,0.20)'; e.currentTarget.style.color = '#5C5F6B' }}
      >
        ← Prev
      </button>

      {getPages().map((p, i) => (
        <button
          key={i}
          style={s.btn(p === page, p === '...')}
          disabled={p === '...'}
          onClick={() => p !== '...' && onChange(p)}
          onMouseEnter={e => { if (p !== page && p !== '...') { e.currentTarget.style.borderColor = '#0B0E14'; e.currentTarget.style.color = '#0B0E14' }}}
          onMouseLeave={e => { if (p !== page && p !== '...') { e.currentTarget.style.borderColor = 'rgba(11,14,20,0.20)'; e.currentTarget.style.color = '#5C5F6B' }}}
        >
          {p}
        </button>
      ))}

      <button
        style={s.btn(false, page === totalPages)}
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.borderColor = '#0B0E14'; e.currentTarget.style.color = '#0B0E14' }}
        onMouseLeave={e => { if (page !== totalPages) e.currentTarget.style.borderColor = 'rgba(11,14,20,0.20)'; e.currentTarget.style.color = '#5C5F6B' }}
      >
        Next →
      </button>
    </div>
  )
}