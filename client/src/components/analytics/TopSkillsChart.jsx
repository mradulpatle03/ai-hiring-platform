import { useQuery } from '@tanstack/react-query'
import { fetchTopSkills } from '../../api/analytics'


const BAR_COLOR = '#E24B4A'
const BAR_BG = '#fcebeb'


export default function TopSkillsChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-skills'], queryFn: fetchTopSkills })
  const raw = data?.data || []
  const max = Math.max(...raw.map(d => d.count), 1)

  // Calculate total skill gaps
  const totalGaps = raw.reduce((sum, d) => sum + d.count, 0)
  // Calculate opacity for first item (for the footer summary dot)
  const firstItemOpacity = raw.length > 0 ? 1 : 1


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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px', letterSpacing: '-0.5px' }}>
            Most missing skills
          </div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>
            Skills candidates lack across all jobs
          </div>
        </div>
        {!isLoading && raw.length > 0 && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fcebeb 0%, #f9e3eb 100%)',
              borderRadius: '10px',
              padding: '10px 14px',
              textAlign: 'center',
              border: '1px solid rgba(226, 75, 74, 0.15)',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: '800', color: BAR_COLOR, lineHeight: 1, letterSpacing: '-0.5px' }}>
              {raw.length}
            </div>
            <div style={{ fontSize: '10px', color: '#e07070', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              skill gaps
            </div>
          </div>
        )}
      </div>


      {/* Content */}
      {isLoading ? (
        <div
          style={{
            height: 240,
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
            height: 240,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {raw.map((d, i) => {
            const pct = Math.round((d.count / max) * 100)
            const opacity = 1 - i * (0.55 / Math.max(raw.length - 1, 1))

            // Determine if this is top 3 (highlighted)
            const isTop3 = i < 3

            return (
              <div
                key={d.skill}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: isTop3 ? '10px 12px' : '8px 12px',
                  background: isTop3 ? 'linear-gradient(135deg, #fceebb 0%, #fcebeb 100%)' : 'transparent',
                  borderRadius: isTop3 ? '10px' : '0',
                  border: isTop3 ? `1px solid rgba(226, 75, 74, 0.15)` : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isTop3) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isTop3) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: '24px',
                    flexShrink: 0,
                    fontSize: isTop3 ? '12px' : '11px',
                    fontWeight: isTop3 ? '700' : '600',
                    color: isTop3 ? BAR_COLOR : '#bbb',
                    textAlign: 'right',
                    letterSpacing: isTop3 ? '-0.3px' : '0',
                  }}
                >
                  {isTop3 && '•'} {i + 1}
                </div>


                {/* Skill name */}
                <div
                  style={{
                    width: '120px',
                    flexShrink: 0,
                    fontSize: '14px',
                    color: isTop3 ? '#333' : '#555',
                    fontWeight: isTop3 ? '600' : '500',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.skill}
                </div>


                {/* Bar track */}
                <div
                  style={{
                    flex: 1,
                    height: '10px',
                    background: '#f0f0f5',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: BAR_COLOR,
                      opacity,
                      borderRadius: '6px',
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                      boxShadow: isTop3 ? `0 2px 6px ${BAR_COLOR}40` : 'none',
                    }}
                  />
                </div>


                {/* Count */}
                <div
                  style={{
                    width: '32px',
                    flexShrink: 0,
                    fontSize: isTop3 ? '16px' : '13px',
                    fontWeight: isTop3 ? '800' : '700',
                    color: isTop3 ? BAR_COLOR : '#bbb',
                    textAlign: 'right',
                    letterSpacing: isTop3 ? '-0.5px' : '0',
                  }}
                >
                  {d.count}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Footer summary */}
      {raw.length > 0 && !isLoading && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '1.5rem',
            padding: '12px 14px',
            background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
            borderRadius: '10px',
            border: '1px solid #e8e8ed',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: BAR_COLOR }} />
            <span style={{ fontSize: '11px', color: '#777', fontWeight: '600', textTransform: 'uppercase' }}>Total gaps:</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{totalGaps}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: BAR_COLOR, opacity: firstItemOpacity }} />
            <span style={{ fontSize: '11px', color: '#777', fontWeight: '600', textTransform: 'uppercase' }}>Top skill:</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{raw[0]?.skill}</span>
          </div>
        </div>
      )}
    </div>
  )
}