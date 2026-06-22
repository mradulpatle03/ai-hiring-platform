import { VictoryChart, VictoryBar, VictoryAxis, VictoryTooltip } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchScoreDist } from '../../api/analytics'
import { chartTheme } from './chartTheme'

const getColor = (range) => {
  const start = parseInt(range)
  if (start >= 70) return { bar: '#1D8A4E', tint: 'rgba(29,138,78,0.08)', border: 'rgba(29,138,78,0.20)' }
  if (start >= 50) return { bar: '#4D7CFF', tint: 'rgba(77,124,255,0.08)', border: 'rgba(77,124,255,0.20)' }
  if (start >= 30) return { bar: '#B07A0E', tint: 'rgba(176,122,14,0.08)', border: 'rgba(176,122,14,0.20)' }
  return { bar: '#FF4D2E', tint: 'rgba(255,77,46,0.08)', border: 'rgba(255,77,46,0.20)' }
}

const LEGEND = [
  { label: '70–100', tier: 'Strong', color: '#1D8A4E' },
  { label: '50–69',  tier: 'Fair',   color: '#4D7CFF' },
  { label: '30–49',  tier: 'Weak',   color: '#B07A0E' },
  { label: '0–29',   tier: 'Poor',   color: '#FF4D2E' },
]

export default function ScoreDistChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-dist'], queryFn: fetchScoreDist })
  const raw = data?.data || []
  const chartData = raw.map(d => ({
    x: d.range,
    y: d.count,
    label: `${d.range} · ${d.count} candidate${d.count !== 1 ? 's' : ''}`,
    fill: getColor(d.range).bar,
  }))

  const total = raw.reduce((s, d) => s + d.count, 0)
  const topBucket = raw.reduce((max, d) => d.count > (max?.count ?? -1) ? d : max, null)
  const topPercent = topBucket && total > 0
    ? ((topBucket.count / total) * 100).toFixed(1)
    : 0

  const emptyBox = (
    <div
      style={{
        height: 220,
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
        {isLoading ? 'Loading…' : 'No data yet'}
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
            AI score distribution
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
            Candidates across all jobs
          </div>
        </div>

        {!isLoading && total > 0 && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <div
              style={{
                background: 'rgba(11,14,20,0.04)',
                border: '1px solid rgba(11,14,20,0.10)',
                borderRadius: '2px',
                padding: '6px 12px',
                textAlign: 'right',
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
                Screened
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
                {total}
              </div>
            </div>

            {topBucket && (
              <div
                style={{
                  background: getColor(topBucket.range).tint,
                  border: `1px solid ${getColor(topBucket.range).border}`,
                  borderRadius: '2px',
                  padding: '6px 12px',
                  textAlign: 'right',
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
                  Most common
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: '700',
                    fontSize: '14px',
                    letterSpacing: '-0.01em',
                    color: getColor(topBucket.range).bar,
                    lineHeight: 1,
                  }}
                >
                  {topBucket.range} <span style={{ fontSize: '11px', opacity: 0.7 }}>· {topPercent}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {!isLoading && raw.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '14px',
            flexWrap: 'wrap',
            padding: '8px 10px',
            border: '1px solid rgba(11,14,20,0.08)',
            borderRadius: '2px',
          }}
        >
          {LEGEND.map(({ label, tier, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <div style={{ width: '3px', height: '12px', background: color, flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '9px',
                  fontWeight: '600',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#5C5F6B',
                }}
              >
                {label} <span style={{ color }}>{tier}</span>
              </span>
            </div>
          ))}
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
            height={220}
            domainPadding={{ x: 20 }}
            padding={{ top: 15, bottom: 50, left: 45, right: 15 }}
          >
            <VictoryAxis
              style={{
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
                tickLabels: {
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  fill: '#5C5F6B',
                  angle: -30,
                  textAnchor: 'end',
                  padding: 8,
                },
                grid: { stroke: 'transparent' },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'transparent' },
                ticks: { stroke: 'transparent' },
                tickLabels: {
                  fontSize: 9,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  fill: '#5C5F6B',
                  padding: 6,
                },
                grid: {
                  stroke: 'rgba(11,14,20,0.06)',
                  strokeDasharray: '3,3',
                  strokeWidth: 1,
                },
              }}
              tickCount={4}
            />
            <VictoryBar
              data={chartData}
              labels={({ datum }) => datum.label}
              cornerRadius={{ top: 0 }}
              barWidth={20}
              style={{
                data: {
                  fill: ({ datum }) => datum.fill,
                },
              }}
              labelComponent={
                <VictoryTooltip
                  cornerRadius={2}
                  pointerLength={8}
                  flyoutPadding={chartTheme.tooltip.flyoutPadding}
                  flyoutStyle={chartTheme.tooltip.flyoutStyle}
                  style={chartTheme.tooltip.style}
                />
              }
            />
          </VictoryChart>
        </div>
      )}
    </div>
  )
}