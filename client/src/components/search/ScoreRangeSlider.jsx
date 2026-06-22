import { useState, useEffect } from 'react'

const s = {
  wrap:  { marginBottom: '1rem' },
  label: {
    fontSize: '10px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase',
    fontFamily: "'JetBrains Mono', monospace", color: '#5C5F6B',
    marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  track: { position: 'relative', height: '4px', background: '#E5E1D4', margin: '10px 0' },
  fill:  (left, right) => ({
    position: 'absolute', height: '100%', background: '#0B0E14',
    left: `${left}%`, right: `${100 - right}%`,
  }),
  thumb: {
    position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
    width: '14px', height: '14px',
    background: '#0B0E14', border: '2px solid #F7F5EF',
    boxShadow: '0 1px 4px rgba(0,0,0,0.25)', cursor: 'pointer',
    borderRadius: '0',
  },
  inputs: { display: 'flex', gap: '8px', marginTop: '8px' },
  inp: {
    flex: 1, padding: '6px 8px',
    border: '1px solid rgba(11,14,20,0.20)', borderRadius: '2px',
    fontSize: '12px', textAlign: 'center',
    fontFamily: "'JetBrains Mono', monospace", fontWeight: '600',
    color: '#0B0E14', background: '#fff',
  },
  range: { position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', top: 0, left: 0 },
}

export default function ScoreRangeSlider({ minValue, maxValue, onChange }) {
  const [min, setMin] = useState(Number(minValue) || 0)
  const [max, setMax] = useState(Number(maxValue) || 100)

  useEffect(() => {
    setMin(Number(minValue) || 0)
    setMax(Number(maxValue) || 100)
  }, [minValue, maxValue])

  const handleMin = (val) => {
    const v = Math.min(Number(val), max - 5)
    setMin(v)
    onChange(v, max)
  }

  const handleMax = (val) => {
    const v = Math.max(Number(val), min + 5)
    setMax(v)
    onChange(min, v)
  }

  return (
    <div style={s.wrap}>
      <div style={s.label}>
        <span>AI Score range</span>
        <span style={{ color: '#FF4D2E' }}>{min} – {max}</span>
      </div>
      <div style={s.track}>
        <div style={s.fill(min, max)} />
        <div style={{ ...s.thumb, left: `${min}%` }} />
        <div style={{ ...s.thumb, left: `${max}%` }} />
        <input type="range" min={0} max={100} value={min} style={s.range}
          onChange={e => handleMin(e.target.value)} />
        <input type="range" min={0} max={100} value={max} style={s.range}
          onChange={e => handleMax(e.target.value)} />
      </div>
      <div style={s.inputs}>
        <input style={s.inp} type="number" min={0} max={100} value={min}
          onChange={e => handleMin(e.target.value)} placeholder="Min" />
        <input style={s.inp} type="number" min={0} max={100} value={max}
          onChange={e => handleMax(e.target.value)} placeholder="Max" />
      </div>
    </div>
  )
}