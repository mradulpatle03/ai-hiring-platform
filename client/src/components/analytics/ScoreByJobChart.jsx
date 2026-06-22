import { VictoryChart, VictoryGroup, VictoryBar, VictoryAxis, VictoryTooltip } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchScoreByJob } from '../../api/analytics'
import { chartTheme } from './chartTheme'

export default function ScoreByJobChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-score-job'], queryFn: fetchScoreByJob })
  const raw = data?.data || []
  const avgData = raw.map((d, i) => ({ x: i + 1, y: d.avgScore, label: `Avg: ${d.avgScore} — ${d.jobTitle}` }))
  const maxData = raw.map((d, i) => ({ x: i + 1, y: d.maxScore, label: `Top: ${d.maxScore} — ${d.jobTitle}` }))
  const ticks = raw.map((d, i) => ({ x: i + 1, label: d.jobTitle.length > 10 ? d.jobTitle.slice(0, 10) + '…' : d.jobTitle }))

  const avgScores = raw.map(d => d.avgScore)
  const overallAvg = avgScores.length > 0 ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1) : 0
  const topAvg = avgScores.length > 0 ? Math.max(...avgScores) : 0
  const topJob = raw.find(d => d.avgScore === topAvg)?.jobTitle || 'N/A'

  const emptyBox = (
    <div
      style={{
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(11,14,20,0.02)',
        border: '1px solid rgba(11,14,20,0.06)',
        borderRadius: '2px',
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#8A8D98',
        }}
      >
        {isLoading ? 'Loading…' : 'No screened applications yet'}
      </span>
    </div>
  )

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(11,14,20,0.10)',
        borderRadius: '4px',
        padding: '22px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: '700',
              fontSize: '16px',
              letterSpacing: '-0.02em',
              color: '#0B0E14',
              marginBottom: '4px',
            }}
          >
            Score by job
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#5C5F6B',
            }}
          >
            Avg and top AI score per role
          </div>
        </div>

        {raw.length > 0 && !isLoading && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <div
              style={{
                background: 'rgba(11,14,20,0.04)',
                border: '1px solid rgba(11,14,20,0.10)',
                borderRadius: '2px',
                padding: '6px 12px',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5C5F6B',
                  marginBottom: '2px',
                }}
              >
                Overall avg
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: '700',
                  fontSize: '18px',
                  letterSpacing: '-0.02em',
                  color: '#0B0E14',
                  lineHeight: 1,
                }}
              >
                {overallAvg}
              </div>
            </div>

            <div
              style={{
                background: 'rgba(29,138,78,0.08)',
                border: '1px solid rgba(29,138,78,0.20)',
                borderRadius: '2px',
                padding: '6px 12px',
                maxWidth: '140px',
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5C5F6B',
                  marginBottom: '2px',
                }}
              >
                Top role
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: '700',
                  fontSize: '13px',
                  letterSpacing: '-0.01em',
                  color: '#1D8A4E',
                  lineHeight: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {topJob}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {raw.length > 0 && !isLoading && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '14px',
            padding: '8px 12px',
            border: '1px solid rgba(11,14,20,0.08)',
            borderRadius: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '3px', background: '#4D7CFF' }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#5C5F6B',
              }}
            >
              Avg score
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '3px', background: '#1D8A4E' }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                fontWeight: '600',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#5C5F6B',
              }}
            >
              Top score
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      {isLoading || raw.length === 0 ? emptyBox : (
        <div
          style={{
            background: 'rgba(11,14,20,0.02)',
            border: '1px solid rgba(11,14,20,0.06)',
            borderRadius: '2px',
            padding: '14px 14px 4px',
          }}
        >
          <VictoryChart
            height={240}
            domainPadding={{ x: 24 }}
            domain={{ y: [0, 100] }}
            padding={{ top: 15, bottom: 55, left: 45, right: 15 }}
          >
            <VictoryAxis
              tickValues={ticks.map(t => t.x)}
              tickFormat={ticks.map(t => t.label)}
              style={{
                ...chartTheme.axis.style,
                tickLabels: {
                  ...chartTheme.axis.style.tickLabels,
                  angle: -30,
                  fontSize: 9,
                  textAnchor: 'end',
                  padding: 8,
                },
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                ...chartTheme.axis.style,
                grid: {
                  stroke: 'rgba(11,14,20,0.06)',
                  strokeDasharray: '3,3',
                  strokeWidth: 1,
                },
              }}
              tickCount={5}
            />
            <VictoryGroup offset={12}>
              <VictoryBar
                data={avgData}
                style={{
                  data: {
                    fill: '#4D7CFF',
                    width: 10,
                  },
                }}
                labelComponent={
                  <VictoryTooltip
                    style={chartTheme.tooltip.style}
                    flyoutStyle={chartTheme.tooltip.flyoutStyle}
                    flyoutPadding={chartTheme.tooltip.flyoutPadding}
                    cornerRadius={2}
                    flyoutStroke="rgba(11,14,20,0.12)"
                  />
                }
              />
              <VictoryBar
                data={maxData}
                style={{
                  data: {
                    fill: '#1D8A4E',
                    width: 10,
                  },
                }}
                labelComponent={
                  <VictoryTooltip
                    style={chartTheme.tooltip.style}
                    flyoutStyle={chartTheme.tooltip.flyoutStyle}
                    flyoutPadding={chartTheme.tooltip.flyoutPadding}
                    cornerRadius={2}
                    flyoutStroke="rgba(11,14,20,0.12)"
                  />
                }
              />
            </VictoryGroup>
          </VictoryChart>
        </div>
      )}
    </div>
  )
}