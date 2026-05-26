import { VictoryChart, VictoryBar, VictoryAxis, VictoryTooltip } from 'victory'
import { useQuery } from '@tanstack/react-query'
import { fetchTopSkills } from '../../api/analytics'
import { chartTheme } from './chartTheme'

export default function TopSkillsChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-skills'], queryFn: fetchTopSkills })
  const raw = data?.data || []
  const chartData = raw.map((d, i) => ({
    x: d.skill.length > 10 ? d.skill.slice(0, 10) + '…' : d.skill,
    y: d.count,
    label: `${d.skill}: missing in ${d.count} resumes`,
  }))

  return (
    <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Most missing skills</div>
      <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '0.5rem' }}>Skills candidates lack most</div>
      {isLoading
        ? <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ddd' }}>Loading...</div>
        : raw.length === 0
          ? <div style={{ color: '#ddd', fontSize: '13px', textAlign: 'center', padding: '2rem' }}>No data yet</div>
          : <VictoryChart
              height={220}
              domainPadding={{ x: 15 }}
              padding={{ top: 10, bottom: 55, left: 35, right: 10 }}
            >
              <VictoryAxis
                style={{ ...chartTheme.axis.style, tickLabels: { ...chartTheme.axis.style.tickLabels, angle: -35, fontSize: 10 } }}
              />
              <VictoryAxis dependentAxis style={chartTheme.axis.style}/>
              <VictoryBar
                data={chartData}
                style={{ data: { fill: '#E24B4A', width: 14 } }}
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