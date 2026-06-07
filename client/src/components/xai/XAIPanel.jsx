import RadarChart    from './RadarChart'
import DimensionBar  from './DimensionBar'
import { Zap, Target, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react'

const dimOrder = [
  'technicalSkills',
  'experienceDepth',
  'projectImpact',
  'communicationClarity',
  'growthPotential',
]

const recommendationConfig = {
  shortlist: { bg: '#E1F5EE', color: '#085041', border: '#5DCAA5', label: 'Recommended — Shortlist',  icon: '✅' },
  maybe:     { bg: '#FAEEDA', color: '#633806', border: '#EF9F27', label: 'On the fence — Review',    icon: '🤔' },
  reject:    { bg: '#FCEBEB', color: '#791F1F', border: '#F09595', label: 'Not recommended — Reject', icon: '❌' },
}

const s = {
  wrap:      { background: '#fff', border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' },
  topRow:    { display: 'flex', gap: 0, borderBottom: '1px solid #eee' },
  radarSide: { padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #eee', background: '#fafafa', flexShrink: 0 },
  infoSide:  { padding: '1.5rem', flex: 1, minWidth: 0 },
  recBadge:  (c) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '600',
    background: c.bg, color: c.color, border: `1px solid ${c.border}`, marginBottom: '1rem',
  }),
  summary:   { fontSize: '14px', color: '#444', lineHeight: 1.7, marginBottom: '1rem' },
  twoCol:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' },
  box:       (border) => ({
    background: '#fafafa', border: `1px solid ${border}`, borderRadius: '10px', padding: '12px',
  }),
  boxTitle:  { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' },
  listItem:  { fontSize: '12px', color: '#444', padding: '3px 0 3px 12px', position: 'relative', lineHeight: 1.5 },
  itemDot:   (c) => ({ position: 'absolute', left: 0, top: '8px', width: '5px', height: '5px', borderRadius: '50%', background: c }),
  dimSection:{ padding: '1.25rem', borderTop: '1px solid #eee' },
  dimTitle:  { fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' },
  focusBox:  { background: '#f9f8ff', border: '1px solid #e8e5fc', borderRadius: '8px', padding: '10px 12px', marginTop: '12px' },
  focusTitle:{ fontSize: '11px', fontWeight: '600', color: '#5a52c0', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' },
  focusItem: { fontSize: '12px', color: '#444', padding: '3px 0 3px 12px', position: 'relative', lineHeight: 1.5 },
  noXAI:     { padding: '2rem', textAlign: 'center', color: '#aaa', fontSize: '13px' },
}

export default function XAIPanel({ xai, overallScore, candidateName }) {
  if (!xai?.dimensions) {
    return (
      <div style={s.wrap}>
        <div style={s.noXAI}>
          <Zap size={24} color="#ddd" style={{ marginBottom: '8px' }}/>
          <div>XAI analysis not available yet.</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Applied before XAI was enabled, or still screening.</div>
        </div>
      </div>
    )
  }

  const rec     = xai.recommendation || 'maybe'
  const recConf = recommendationConfig[rec] || recommendationConfig.maybe

  // Compute avg score from dimensions
  const dimScores = dimOrder.map(k => xai.dimensions[k]?.score || 0)
  const avgDim    = Math.round(dimScores.reduce((a, b) => a + b, 0) / dimScores.length * 10)

  return (
    <div style={s.wrap}>
      {/* Top: radar + summary */}
      <div style={s.topRow}>
        {/* Radar chart */}
        <div style={s.radarSide}>
          <RadarChart dimensions={xai.dimensions} size={220} overallScore={overallScore}/>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px', textAlign: 'center' }}>
            5-dimension analysis
          </div>
        </div>

        {/* Summary info */}
        <div style={s.infoSide}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#aaa' }}>AI Explainability Report</span>
            {candidateName && <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', marginLeft: '8px' }}>{candidateName}</span>}
          </div>

          <div style={s.recBadge(recConf)}>
            {recConf.icon} {recConf.label}
          </div>

          <p style={s.summary}>{xai.summary}</p>

          <div style={s.twoCol}>
            {/* Top strengths */}
            <div style={s.box('#a8dfc0')}>
              <div style={{ ...s.boxTitle, color: '#1a7a4a' }}>
                <TrendingUp size={12}/> Top strengths
              </div>
              {(xai.topStrengths || []).map((str, i) => (
                <div key={i} style={s.listItem}>
                  <span style={s.itemDot('#1D9E75')}/>
                  {str}
                </div>
              ))}
            </div>

            {/* Critical gaps */}
            <div style={s.box('#f5bcbc')}>
              <div style={{ ...s.boxTitle, color: '#c0392b' }}>
                <AlertTriangle size={12}/> Critical gaps
              </div>
              {(xai.criticalGaps || []).map((gap, i) => (
                <div key={i} style={s.listItem}>
                  <span style={s.itemDot('#E24B4A')}/>
                  {gap}
                </div>
              ))}
            </div>
          </div>

          {/* Interview focus areas */}
          {xai.interviewFocus?.length > 0 && (
            <div style={s.focusBox}>
              <div style={s.focusTitle}>
                <HelpCircle size={11}/> Interview focus areas
              </div>
              {xai.interviewFocus.map((area, i) => (
                <div key={i} style={s.focusItem}>
                  <span style={s.itemDot('#7F77DD')}/>
                  {area}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div style={s.dimSection}>
        <div style={s.dimTitle}>
          <Target size={14} color="#7F77DD"/>
          Dimension breakdown — click any to expand
        </div>
        {dimOrder.map((key, i) => (
          <DimensionBar
            key={key}
            dimKey={key}
            data={xai.dimensions[key]}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  )
}