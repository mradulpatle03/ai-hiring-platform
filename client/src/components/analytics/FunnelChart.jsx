import { useQuery } from "@tanstack/react-query";
import { fetchFunnel } from "../../api/analytics";


export default function FunnelChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-funnel"],
    queryFn: fetchFunnel,
  });
  const funnel = data?.funnel || [];
  const max = funnel[0]?.count || 1;

  // Calculate overall conversion rate
  const overallConv = funnel.length > 1 && funnel[0].count > 0
    ? Math.round((funnel[funnel.length - 1].count / funnel[0].count) * 100)
    : 0
  const totalApplied = funnel[0]?.count || 0
  const totalReachedEnd = funnel[funnel.length - 1]?.count || 0


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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px', letterSpacing: '-0.5px' }}>
            Hiring funnel
          </div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>
            Candidate progression through stages
          </div>
        </div>
        
        {/* Overall stats */}
        {funnel.length > 0 && !isLoading && (
          <div
            style={{
              background: 'linear-gradient(135deg, #fbeaf0 0%, #f9e3eb 100%)',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(212, 83, 126, 0.15)',
            }}
          >
            <div style={{ fontSize: '10px', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              Overall conversion
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#D4537E', lineHeight: 1, letterSpacing: '-0.5px' }}>
              {overallConv}%
            </div>
          </div>
        )}
      </div>


      {/* Funnel stages */}
      {isLoading ? (
        <div
          style={{
            height: '200px',
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
      ) : funnel.length === 0 ? (
        <div
          style={{
            height: '200px',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {funnel.map((stage, i) => {
            const pct = Math.round((stage.count / max) * 100);
            const convPct =
              i > 0 && funnel[i - 1].count > 0
                ? Math.round((stage.count / funnel[i - 1].count) * 100)
                : null;

            // Determine if this is a drop stage (show negative indicator)
            const isDrop = i > 0 && stage.count < funnel[i - 1].count
            const dropCount = i > 0 ? funnel[i - 1].count - stage.count : 0

            return (
              <div
                key={stage.stage}
                style={{
                  position: 'relative',
                  padding: i > 0 ? '12px 0' : '0 0 12px 0',
                }}
              >
                {/* Connector arrow for stages after first */}
                {i > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '8px',
                      width: '12px',
                      height: '12px',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <path
                        d="M6 0L6 10M6 10L3 6M6 10L9 6"
                        stroke="#ccc"
                        strokeWidth="1.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        background: `${stage.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stage.color }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                      {stage.stage}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {convPct !== null && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          background: isDrop ? '#faeeda' : '#e1f5ee',
                          borderRadius: '6px',
                          border: `1px solid ${isDrop ? '#EF9F2720' : '#1D9E7520'}`,
                        }}
                      >
                        <span style={{ fontSize: '10px', fontWeight: '600', color: isDrop ? '#EF9F27' : '#1D9E75' }}>
                          {isDrop ? '-' : '+'}{convPct}%
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: '800',
                          color: stage.color,
                          letterSpacing: '-0.5px',
                        }}
                      >
                        {stage.count}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    marginTop: '10px',
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
                      background: stage.color,
                      borderRadius: '6px',
                      transition: 'width 0.6s ease',
                      boxShadow: `0 2px 6px ${stage.color}40`,
                    }}
                  />
                </div>

                {/* Drop indicator */}
                {isDrop && dropCount > 0 && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#999', fontWeight: '500' }}>
                    <span style={{ color: '#EF9F27' }}>↓</span> {dropCount} candidates dropped
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
            gap: '16px',
            marginTop: '1.5rem',
            padding: '12px 14px',
            background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
            borderRadius: '10px',
            border: '1px solid #e8e8ed',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: funnel[0]?.color || '#7F77DD' }} />
            <span style={{ fontSize: '11px', color: '#777', fontWeight: '600', textTransform: 'uppercase' }}>Applied:</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{totalApplied}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: funnel[funnel.length - 1]?.color || '#D4537E' }} />
            <span style={{ fontSize: '11px', color: '#777', fontWeight: '600', textTransform: 'uppercase' }}>Completed:</span>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a' }}>{totalReachedEnd}</span>
          </div>
        </div>
      )}
    </div>
  );
}