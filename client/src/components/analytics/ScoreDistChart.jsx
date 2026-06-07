import { VictoryChart, VictoryBar, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchScoreDist } from '../../api/analytics'


const getColor = (range) => {
  const start = parseInt(range)
  if (start >= 70) return { bar: '#1D9E75', bg: '#e1f5ee', text: '#085041' }
  if (start >= 50) return { bar: '#7F77DD', bg: '#eeedfe', text: '#3C3489' }
  if (start >= 30) return { bar: '#EF9F27', bg: '#faeeda', text: '#633806' }
  return { bar: '#E24B4A', bg: '#fcebeb', text: '#791F1F' }
}


export default function ScoreDistChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-dist'], queryFn: fetchScoreDist })
  const raw = data?.data || []
  const chartData = raw.map(d => ({
    x: d.range,
    y: d.count,
    label: `${d.range}\n${d.count} candidates`,
    fill: getColor(d.range).bar,
  }))

  const total = raw.reduce((s, d) => s + d.count, 0)
  const topBucket = raw.reduce((max, d) => d.count > (max?.count ?? -1) ? d : max, null)
  
  // Calculate percentage for top bucket
  const topPercent = topBucket && total > 0 
    ? ((topBucket.count / total) * 100).toFixed(1) 
    : 0


  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
        border: '1px solid #e8e8ed',
        borderRadius: '16px',
        padding: '1.75rem 1.75rem',
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
            AI score distribution
          </div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>
            Candidates across all jobs
          </div>
        </div>
        {!isLoading && total > 0 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #eeedfe 0%, #e7e5f9 100%)',
                borderRadius: '10px',
                padding: '8px 14px',
                textAlign: 'center',
                border: '1px solid rgba(90, 82, 192, 0.1)',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#5a52c0', lineHeight: 1, letterSpacing: '-0.5px' }}>
                {total}
              </div>
              <div style={{ fontSize: '10px', color: '#777', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                screened
              </div>
            </div>
            {topBucket && (
              <div
                style={{
                  background: `${getColor(topBucket.range).bg}dd`,
                  borderRadius: '10px',
                  padding: '8px 14px',
                  textAlign: 'center',
                  border: `1px solid rgba(${getColor(topBucket.range).bar.replace('#', '')}, 0.2)`,
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: '800', color: getColor(topBucket.range).bar, lineHeight: 1, letterSpacing: '-0.5px' }}>
                  {topBucket.range}
                </div>
                <div style={{ fontSize: '10px', color: getColor(topBucket.range).text, marginTop: '4px', fontWeight: '600' }}>
                  {topPercent}% most common
                </div>
              </div>
            )}
          </div>
        )}
      </div>


      {/* Color legend */}
      {!isLoading && raw.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            padding: '10px 12px',
            background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
            borderRadius: '10px',
            border: '1px solid #e8e8ed',
          }}
        >
          {[
            { label: '70–100  Strong', color: '#1D9E75', bg: '#e1f5ee' },
            { label: '50–69  Good', color: '#7F77DD', bg: '#eeedfe' },
            { label: '30–49  Fair', color: '#EF9F27', bg: '#faeeda' },
            { label: '0–29  Weak', color: '#E24B4A', bg: '#fcebeb' },
          ].map(({ label, color, bg }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: bg,
                borderRadius: '6px',
                border: `1px solid rgba(${color.replace('#', '')}, 0.15)`,
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, boxShadow: `0 1px 3px rgba(${color.replace('#', '')}, 0.3)` }} />
              <span style={{ fontSize: '11px', color: '#666', fontWeight: '600' }}>{label}</span>
            </div>
          ))}
        </div>
      )}


      {/* Chart */}
      {isLoading ? (
        <div
          style={{
            height: 220,
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
      ) : raw.length === 0 ? (
        <div
          style={{
            height: 220,
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
            No data yet
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
            borderRadius: '12px',
            border: '1px solid #e8e8ed',
            padding: '14px',
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
                  fontSize: 10,
                  fill: '#777',
                  fontFamily: 'inherit',
                  angle: -30,
                  textAnchor: 'end',
                  padding: 8,
                  fontWeight: 500,
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
                  fontSize: 10,
                  fill: '#777',
                  fontFamily: 'inherit',
                  padding: 6,
                  fontWeight: 500,
                },
                grid: {
                  stroke: '#e8e8ed',
                  strokeDasharray: '4,4',
                  strokeWidth: 1,
                },
              }}
              tickCount={4}
            />

            <VictoryBar
              data={chartData}
              labels={({ datum }) => `${datum.x}\n${datum.y} candidate${datum.y !== 1 ? 's' : ''}`}
              cornerRadius={{ top: 6 }}
              barWidth={22}
              style={{
                data: {
                  fill: ({ datum }) => datum.fill,
                },
              }}
              labelComponent={
                <VictoryTooltip
                  cornerRadius={8}
                  pointerLength={10}
                  flyoutPadding={{ top: 8, bottom: 8, left: 12, right: 12 }}
                  flyoutStyle={{
                    fill: '#fff',
                    stroke: '#e8e8ed',
                    strokeWidth: 1,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  }}
                  style={{
                    fontSize: 11,
                    fontFamily: 'inherit',
                    fill: '#333',
                    fontWeight: 500,
                  }}
                />
              }
            />
          </VictoryChart>
        </div>
      )}
    </div>
  )
}