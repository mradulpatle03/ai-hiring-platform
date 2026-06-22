import { useQuery } from "@tanstack/react-query";
import { fetchFunnel } from "../../api/analytics";

export default function FunnelChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-funnel"],
    queryFn: fetchFunnel,
  });
  const funnel = data?.funnel || [];
  const max = funnel[0]?.count || 1;

  const overallConv = funnel.length > 1 && funnel[0].count > 0
    ? Math.round((funnel[funnel.length - 1].count / funnel[0].count) * 100)
    : 0;
  const totalApplied = funnel[0]?.count || 0;
  const totalReachedEnd = funnel[funnel.length - 1]?.count || 0;

  const emptyBox = (
    <div
      style={{
        height: '200px',
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
  );

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
            Hiring funnel
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
            Candidate progression
          </div>
        </div>

        {funnel.length > 0 && !isLoading && (
          <div
            style={{
              background: overallConv >= 50
                ? 'rgba(29,138,78,0.08)'
                : 'rgba(255,77,46,0.08)',
              border: `1px solid ${overallConv >= 50
                ? 'rgba(29,138,78,0.20)'
                : 'rgba(255,77,46,0.20)'}`,
              borderRadius: '2px',
              padding: '8px 14px',
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
              Conversion
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: '700',
                fontSize: '22px',
                letterSpacing: '-0.02em',
                color: overallConv >= 50 ? '#1D8A4E' : '#FF4D2E',
                lineHeight: 1,
              }}
            >
              {overallConv}%
            </div>
          </div>
        )}
      </div>

      {/* Funnel stages */}
      {isLoading || funnel.length === 0 ? emptyBox : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {funnel.map((stage, i) => {
            const pct = Math.round((stage.count / max) * 100);
            const convPct = i > 0 && funnel[i - 1].count > 0
              ? Math.round((stage.count / funnel[i - 1].count) * 100)
              : null;
            const isDrop = i > 0 && stage.count < funnel[i - 1].count;
            const dropCount = i > 0 ? funnel[i - 1].count - stage.count : 0;

            return (
              <div
                key={stage.stage}
                style={{
                  padding: '14px 0',
                  borderBottom: i < funnel.length - 1 ? '1px solid rgba(11,14,20,0.06)' : 'none',
                }}
              >
                {/* Stage label row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Stage index dot */}
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        background: 'rgba(11,14,20,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '9px',
                        fontWeight: '700',
                        color: '#5C5F6B',
                        letterSpacing: '0',
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0B0E14',
                      }}
                    >
                      {stage.stage}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {convPct !== null && (
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '10px',
                          fontWeight: '700',
                          letterSpacing: '0.04em',
                          color: isDrop ? '#FF4D2E' : '#1D8A4E',
                          background: isDrop ? 'rgba(255,77,46,0.08)' : 'rgba(29,138,78,0.08)',
                          border: `1px solid ${isDrop ? 'rgba(255,77,46,0.20)' : 'rgba(29,138,78,0.20)'}`,
                          padding: '3px 7px',
                          borderRadius: '2px',
                        }}
                      >
                        {isDrop ? '▼' : '▲'} {convPct}%
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: '700',
                        fontSize: '20px',
                        letterSpacing: '-0.02em',
                        color: '#0B0E14',
                        minWidth: '36px',
                        textAlign: 'right',
                      }}
                    >
                      {stage.count}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    height: '4px',
                    background: 'rgba(11,14,20,0.06)',
                    borderRadius: '0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: isDrop ? '#FF4D2E' : '#4D7CFF',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>

                {/* Drop indicator */}
                {isDrop && dropCount > 0 && (
                  <div
                    style={{
                      marginTop: '6px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '9px',
                      fontWeight: '600',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#8A8D98',
                    }}
                  >
                    <span style={{ color: '#FF4D2E' }}>↓ </span>
                    {dropCount} dropped
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer summary */}
      {funnel.length > 0 && !isLoading && (
        <div
          style={{
            display: 'flex',
            gap: '0',
            marginTop: '16px',
            border: '1px solid rgba(11,14,20,0.08)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRight: '1px solid rgba(11,14,20,0.08)',
            }}
          >
            <div style={{ width: '3px', height: '16px', background: '#4D7CFF' }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#5C5F6B',
              }}
            >
              Applied
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: '700',
                fontSize: '16px',
                letterSpacing: '-0.02em',
                color: '#0B0E14',
              }}
            >
              {totalApplied}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
            }}
          >
            <div style={{ width: '3px', height: '16px', background: '#1D8A4E' }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '9px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#5C5F6B',
              }}
            >
              Completed
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: '700',
                fontSize: '16px',
                letterSpacing: '-0.02em',
                color: '#0B0E14',
              }}
            >
              {totalReachedEnd}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}