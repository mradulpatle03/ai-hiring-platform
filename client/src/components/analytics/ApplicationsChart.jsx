import { VictoryChart, VictoryArea, VictoryAxis, VictoryTooltip, VictoryVoronoiContainer } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchOverTime } from '../../api/analytics'
import { chartTheme } from './chartTheme'

export default function ApplicationsChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-time'], queryFn: fetchOverTime })
  const raw = data?.data || []
  const chartData = raw.map((d, i) => ({ x: i, y: d.count, label: `${d.label}: ${d.count} apps` }))

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Applications over time</div>
      <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '0.5rem' }}>Last 30 days</div>
      {isLoading
        ? <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd' }}>Loading...</div>
        : <VictoryChart
            height={200}
            padding={{ top: 10, bottom: 35, left: 40, right: 10 }}
            containerComponent={<VictoryVoronoiContainer/>}
          >
            <VictoryAxis
              tickFormat={(t) => raw[t] && raw.indexOf(raw[t]) % 5 === 0 ? raw[t].label : ''}
              style={chartTheme.axis.style}
            />
            <VictoryAxis dependentAxis style={chartTheme.axis.style}/>
            <VictoryArea
              data={chartData}
              style={{ data: { fill: '#f0effc', stroke: '#7F77DD', strokeWidth: 2 } }}
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