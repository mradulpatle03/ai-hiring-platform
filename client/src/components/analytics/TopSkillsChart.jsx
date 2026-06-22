import { useQuery } from '@tanstack/react-query'
import { fetchTopSkills } from '../../api/analytics'

const BAR_COLOR = '#FF4D2E'   // --signal
const BAR_BG = 'rgba(255,77,46,0.10)'

export default function TopSkillsChart() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics-skills'], queryFn: fetchTopSkills })
  const raw = data?.data || []
  const max = Math.max(...raw.map(d => d.count), 1)

  const totalGaps = raw.reduce((sum, d) => sum + d.count, 0)
  const firstItemOpacity = raw.length > 0 ? 1 : 1

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid rgba(11,14,20,0.10)',
        borderRadius: '4px',
        padding: '1.75rem',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(11,14,20,0.20)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(11,14,20,0.10)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '16px',
              fontWeight: '700',
              color: '#0B0E14',
              marginBottom: '4px',
              letterSpacing: '-0.02em',
            }}
          >
            Most missing skills
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#5C5F6B',
            }}
          >
            Skills candidates lack across all jobs
          </div>
        </div>
        {!isLoading && raw.length > 0 && (
          <div
            style={{
              background: 'rgba(255,77,46,0.08)',
              padding: '10px 14px',
              textAlign: 'center',
              border: '1px solid rgba(255,77,46,0.20)',
              borderRadius: '2px',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: '700',
                color: BAR_COLOR,
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {raw.length}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                color: BAR_COLOR,
                marginTop: '4px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
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
            background: '#F7F5EF',
            border: '1px solid rgba(11,14,20,0.10)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#5C5F6B',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                background: '#FF4D2E',
                animation: 'pulse 1s ease-in-out infinite',
              }}
            />
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
            background: '#F7F5EF',
            border: '1px solid rgba(11,14,20,0.10)',
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#8A8D98',
            }}
          >
            No data yet
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {raw.map((d, i) => {
            const pct = Math.round((d.count / max) * 100)
            const opacity = 1 - i * (0.55 / Math.max(raw.length - 1, 1))
            const isTop3 = i < 3

            return (
              <div
                key={d.skill}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: isTop3 ? 'rgba(255,77,46,0.05)' : 'transparent',
                  borderLeft: isTop3 ? `2px solid ${BAR_COLOR}` : '2px solid transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isTop3) e.currentTarget.style.background = '#F7F5EF'
                }}
                onMouseLeave={(e) => {
                  if (!isTop3) e.currentTarget.style.background = 'transparent'
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    width: '20px',
                    flexShrink: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '10px',
                    fontWeight: '600',
                    color: isTop3 ? BAR_COLOR : '#8A8D98',
                    textAlign: 'right',
                    letterSpacing: '0.04em',
                  }}
                >
                  {i + 1}
                </div>

                {/* Skill name */}
                <div
                  style={{
                    width: '120px',
                    flexShrink: 0,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px',
                    color: isTop3 ? '#0B0E14' : '#5C5F6B',
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
                    height: '4px',
                    background: '#E5E1D4',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${pct}%`,
                      background: BAR_COLOR,
                      opacity,
                      transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
                    }}
                  />
                </div>

                {/* Count */}
                <div
                  style={{
                    width: '32px',
                    flexShrink: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: isTop3 ? '14px' : '12px',
                    fontWeight: '700',
                    color: isTop3 ? BAR_COLOR : '#8A8D98',
                    textAlign: 'right',
                    letterSpacing: '-0.02em',
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
            gap: '20px',
            marginTop: '1.5rem',
            paddingTop: '14px',
            borderTop: '1px solid rgba(11,14,20,0.10)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', background: BAR_COLOR }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: '#5C5F6B',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Total gaps:
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: '700',
                color: '#0B0E14',
                letterSpacing: '-0.02em',
              }}
            >
              {totalGaps}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '6px', height: '6px', background: BAR_COLOR, opacity: firstItemOpacity }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: '#5C5F6B',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Top skill:
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: '700',
                color: '#0B0E14',
                letterSpacing: '-0.02em',
              }}
            >
              {raw[0]?.skill}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}