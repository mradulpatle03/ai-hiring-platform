import { VictoryChart, VictoryGroup, VictoryBar, VictoryAxis, VictoryTooltip } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchScoreByJob } from '../../api/analytics'
import { chartTheme } from './chartTheme'


export default function ScoreByJobChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-score-job'], queryFn: fetchScoreByJob })
  const raw = data?.data || []
  const avgData = raw.map((d, i) => ({ x: i + 1, y: d.avgScore, label: `Avg: ${d.avgScore} — ${d.jobTitle}` }))
  const maxData = raw.map((d, i) => ({ x: i + 1, y: d.maxScore, label: `Top: ${d.maxScore} — ${d.jobTitle}` }))
  const ticks   = raw.map((d, i) => ({ x: i + 1, label: d.jobTitle.length > 10 ? d.jobTitle.slice(0, 10) + '…' : d.jobTitle }))

  // Calculate stats
  const avgScores = raw.map(d => d.avgScore)
  const overallAvg = avgScores.length > 0 ? (avgScores.reduce((a, b) => a + b, 0) / avgScores.length).toFixed(1) : 0
  const topAvg = avgScores.length > 0 ? Math.max(...avgScores) : 0
  const topJob = raw.find(d => d.avgScore === topAvg)?.jobTitle || 'N/A'


  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
        border: '1px solid #e8e8ed',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06), 0 12px 40px rgba(127, 119, 221, 0.08)'
        e.currentTarget.style.borderColor = '#e0e0e6'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.02)'
        e.currentTarget.style.borderColor = '#e8e8ed'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px', letterSpacing: '-0.5px' }}>
            Score by job
          </div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>
            Average and top AI score per role
          </div>
        </div>
        
        {/* Stats badges */}
        {raw.length > 0 && !isLoading && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #eeedfe 0%, #e7e5f9 100%)',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(90, 82, 192, 0.15)',
              }}
            >
              <div style={{ fontSize: '10px', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Overall avg
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#5a52c0', lineHeight: 1, letterSpacing: '-0.5px' }}>
                {overallAvg}
              </div>
            </div>
            
            <div
              style={{
                background: 'linear-gradient(135deg, #e1f5ee 0%, #d6f0e8 100%)',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(29, 158, 117, 0.15)',
              }}
            >
              <div style={{ fontSize: '10px', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Top role
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#1D9E75', lineHeight: 1, letterSpacing: '-0.3px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
            gap: '14px',
            marginBottom: '1rem',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
            borderRadius: '10px',
            border: '1px solid #e8e8ed',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#7F77DD', boxShadow: '0 1px 3px rgba(127, 119, 221, 0.3)' }} />
            <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Avg score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1D9E75', boxShadow: '0 1px 3px rgba(29, 158, 117, 0.3)' }} />
            <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>Top score</span>
          </div>
        </div>
      )}

      {/* Chart */}
      {isLoading
        ? (
          <div
            style={{
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
              borderRadius: '12px',
              border: '1px solid #e8e8ed',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#999', fontWeight: '500' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#7F77DD', animation: 'pulse 1s ease-in-out infinite' }} />
              Loading...
            </div>
          </div>
        )
        : raw.length === 0
          ? (
            <div
              style={{
                height: '240px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
                borderRadius: '12px',
                border: '1px solid #e8e8ed',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#bbb', fontWeight: '500' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #ddd', borderTop: '2px solid #7F77DD', animation: 'spin 1s linear infinite' }} />
                No screened applications yet
              </div>
            </div>
          )
          : (
            <div
              style={{
                background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
                borderRadius: '12px',
                border: '1px solid #e8e8ed',
                padding: '14px',
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
                      fontSize: 10,
                      fontWeight: 500,
                      fill: '#777',
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
                    tickLabels: {
                      ...chartTheme.axis.style.tickLabels,
                      fontSize: 10,
                      fontWeight: 500,
                      fill: '#777',
                    },
                    grid: {
                      stroke: '#e8e8ed',
                      strokeDasharray: '4,4',
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
                        fill: '#7F77DD',
                        width: 12,
                        borderRadius: '4px 4px 0 0',
                      },
                    }}
                    labelComponent={
                      <VictoryTooltip
                        style={chartTheme.tooltip.style}
                        flyoutStyle={chartTheme.tooltip.flyoutStyle}
                        flyoutPadding={chartTheme.tooltip.flyoutPadding}
                        cornerRadius={8}
                        flyoutStroke={'#fff'}
                      />
                    }
                  />
                  <VictoryBar
                    data={maxData}
                    style={{
                      data: {
                        fill: '#1D9E75',
                        width: 12,
                        borderRadius: '4px 4px 0 0',
                      },
                    }}
                    labelComponent={
                      <VictoryTooltip
                        style={chartTheme.tooltip.style}
                        flyoutStyle={chartTheme.tooltip.flyoutStyle}
                        flyoutPadding={chartTheme.tooltip.flyoutPadding}
                        cornerRadius={8}
                        flyoutStroke={'#fff'}
                      />
                    }
                  />
                </VictoryGroup>
              </VictoryChart>
            </div>
          )
      }
    </div>
  )
}