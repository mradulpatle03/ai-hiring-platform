import { VictoryChart, VictoryArea, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchOverTime } from '../../api/analytics'
import { chartTheme } from './chartTheme'


export default function ApplicationsChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-time'], queryFn: fetchOverTime })
  const raw = data?.data || []
  const chartData = raw.map((d, i) => ({ x: i, y: d.count, label: `${d.label}: ${d.count} apps` }))

  // Calculate stats
  const totalCount = raw.reduce((sum, d) => sum + d.count, 0)
  const maxCount = raw.length > 0 ? Math.max(...raw.map(d => d.count)) : 0
  const minCount = raw.length > 0 ? Math.min(...raw.map(d => d.count)) : 0
  
  // Calculate trend (first half vs second half average)
  const trend = raw.length > 1
    ? ((raw.slice(raw.length / 2).reduce((sum, d) => sum + d.count, 0) / (raw.length / 2)) - 
       (raw.slice(0, raw.length / 2).reduce((sum, d) => sum + d.count, 0) / (raw.length / 2)))
    : 0
  const trendPercent = maxCount > 0 ? (trend / maxCount) * 100 : 0


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
            Applications over time
          </div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>
            Last 30 days
          </div>
        </div>
        
        {/* Stats badges */}
        {raw.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #f0effc 0%, #e8e6f8 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(127, 119, 221, 0.1)',
              }}
            >
              <div style={{ fontSize: '10px', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Total
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#7F77DD' }}>
                {totalCount}
              </div>
            </div>
            
            <div
              style={{
                background: trend > 0 
                  ? 'linear-gradient(135deg, #e1f5ee 0%, #d6f0e8 100%)'
                  : 'linear-gradient(135deg, #fbeaf0 0%, #f9e3eb 100%)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(127, 119, 221, 0.1)',
              }}
            >
              <div style={{ fontSize: '10px', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Trend
              </div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: trend > 0 ? '#1D9E75' : '#D4537E' }}>
                {trend > 0 ? '+' : ''}{Math.abs(trendPercent).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {isLoading
        ? (
          <div
            style={{
              height: '220px',
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
        : (
          <div
            style={{
              background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
              borderRadius: '12px',
              border: '1px solid #e8e8ed',
              padding: '12px',
            }}
          >
            <VictoryChart
              height={220}
              padding={{ top: 15, bottom: 45, left: 50, right: 15 }}
              containerComponent={<VictoryVoronoiContainer />}
            >
              <VictoryAxis
                tickFormat={(t) => raw[t] && raw.indexOf(raw[t]) % 5 === 0 ? raw[t].label : ''}
                style={{
                  ...chartTheme.axis.style,
                  tickLabel: {
                    ...chartTheme.axis.style.tickLabel,
                    fontSize: 11,
                    fontWeight: 500,
                  },
                }}
                tickCount={raw.length > 0 ? Math.min(6, raw.length) : 0}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  ...chartTheme.axis.style,
                  tickLabel: {
                    ...chartTheme.axis.style.tickLabel,
                    fontSize: 11,
                    fontWeight: 500,
                  },
                }}
                tickCount={4}
              />
              <VictoryArea
                data={chartData}
                style={{
                  data: {
                    fill: '#f0effc',
                    stroke: '#7F77DD',
                    strokeWidth: 3,
                    fillOpacity: 0.8,
                  },
                }}
                curve={'basis'}
                labelComponent={
                  <VictoryTooltip
                    style={chartTheme.tooltip.style}
                    flyoutStyle={chartTheme.tooltip.flyoutStyle}
                    flyoutPadding={chartTheme.tooltip.flyoutPadding}
                    cornerRadius={8}
                    flyoutStroke={'#fff'}
                    flyoutWidth={10}
                    flyoutHeight={10}
                  />
                }
              />
            </VictoryChart>
          </div>
        )
      }

      {/* Footer stats */}
      {raw.length > 0 && !isLoading && (
        <div style={{ display: 'flex', gap: '16px', marginTop: '1rem', padding: '10px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #e8e8ed' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#1D9E75' }} />
            <span style={{ fontSize: '11px', color: '#777', fontWeight: '600' }}>Max:</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>{maxCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#D4537E' }} />
            <span style={{ fontSize: '11px', color: '#777', fontWeight: '600' }}>Min:</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>{minCount}</span>
          </div>
        </div>
      )}
    </div>
  )
}