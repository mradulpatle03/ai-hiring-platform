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

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Score by job</div>
      <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '0.5rem' }}>Average and top AI score per role</div>
      {isLoading
        ? <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd' }}>Loading...</div>
        : raw.length === 0
          ? <div style={{ color: '#ddd', fontSize: '13px', textAlign: 'center', padding: '2rem' }}>No screened applications yet</div>
          : <>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#7F77DD', display: 'inline-block' }}/> Avg score
                </span>
                <span style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1D9E75', display: 'inline-block' }}/> Top score
                </span>
              </div>
              <VictoryChart
                height={200}
                domainPadding={{ x: 20 }}
                domain={{ y: [0, 100] }}
                padding={{ top: 10, bottom: 50, left: 35, right: 10 }}
              >
                <VictoryAxis
                  tickValues={ticks.map(t => t.x)}
                  tickFormat={ticks.map(t => t.label)}
                  style={{ ...chartTheme.axis.style, tickLabels: { ...chartTheme.axis.style.tickLabels, angle: -30, fontSize: 10 } }}
                />
                <VictoryAxis dependentAxis style={chartTheme.axis.style}/>
                <VictoryGroup offset={12}>
                  <VictoryBar data={avgData} style={{ data: { fill: '#7F77DD', width: 10 } }}
                    labelComponent={<VictoryTooltip style={chartTheme.tooltip.style} flyoutStyle={chartTheme.tooltip.flyoutStyle} flyoutPadding={chartTheme.tooltip.flyoutPadding}/>}/>
                  <VictoryBar data={maxData} style={{ data: { fill: '#1D9E75', width: 10 } }}
                    labelComponent={<VictoryTooltip style={chartTheme.tooltip.style} flyoutStyle={chartTheme.tooltip.flyoutStyle} flyoutPadding={chartTheme.tooltip.flyoutPadding}/>}/>
                </VictoryGroup>
              </VictoryChart>
            </>
      }
    </div>
  )
}