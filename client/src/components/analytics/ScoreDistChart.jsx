import { VictoryChart, VictoryBar, VictoryAxis, VictoryTooltip } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchScoreDist } from '../../api/analytics'
import { chartTheme } from './chartTheme'

const getColor = (range) => {
  const start = parseInt(range)
  if (start >= 70) return '#1D9E75'
  if (start >= 50) return '#7F77DD'
  if (start >= 30) return '#EF9F27'
  return '#E24B4A'
}

export default function ScoreDistChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-dist'], queryFn: fetchScoreDist })
  const raw = data?.data || []
  const chartData = raw.map(d => ({ x: d.range, y: d.count, label: `${d.range}: ${d.count} candidates`, fill: getColor(d.range) }))

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>AI score distribution</div>
      <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '0.5rem' }}>How candidates scored across all jobs</div>
      {isLoading
        ? <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd' }}>Loading...</div>
        : <VictoryChart
            height={200}
            domainPadding={{ x: 12 }}
            padding={{ top: 10, bottom: 45, left: 35, right: 10 }}
          >
            <VictoryAxis
              style={{ ...chartTheme.axis.style, tickLabels: { ...chartTheme.axis.style.tickLabels, angle: -35, fontSize: 10 } }}
            />
            <VictoryAxis dependentAxis style={chartTheme.axis.style}/>
            <VictoryBar
              data={chartData}
              style={{ data: { fill: ({ datum }) => datum.fill, width: 18 } }}
              labelComponent={
                <VictoryTooltip
                  style={chartTheme.tooltip.style}
                  flyoutStyle={chartTheme.tooltip.flyoutStyle}
                  flyoutPadding={chartTheme.tooltip.flyoutPadding}
                />
              }
            />
          </VictoryChart>
      }
    </div>
  )
}