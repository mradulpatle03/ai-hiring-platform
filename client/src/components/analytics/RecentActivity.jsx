import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity } from "../../api/analytics";
import StatusBadge from "../StatusBadge";
import ScoreBadge from "../ScoreBadge";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";

const dotColor = {
  shortlisted: "#1D8A4E",
  screened: "#4D7CFF",
  rejected: "#FF4D2E",
  screening: "#4D7CFF",
  pending: "#8A8D98",
};

export default function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-recent"],
    queryFn: fetchRecentActivity,
    refetchInterval: 15000,
  });
  const activity = data?.activity || [];

  const totalActivity = activity.length;
  const shortlistedCount = activity.filter(a => a.status === 'shortlisted').length;

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
        {isLoading ? 'Loading…' : 'No activity yet'}
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
            Recent activity
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
            Latest candidate updates
          </div>
        </div>

        {activity.length > 0 && !isLoading && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <div
              style={{
                background: 'rgba(11,14,20,0.04)',
                border: '1px solid rgba(11,14,20,0.10)',
                borderRadius: '2px',
                padding: '6px 12px',
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
                Updates
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: '700',
                  fontSize: '18px',
                  letterSpacing: '-0.02em',
                  color: '#0B0E14',
                  lineHeight: 1,
                }}
              >
                {totalActivity}
              </div>
            </div>

            {shortlistedCount > 0 && (
              <div
                style={{
                  background: 'rgba(29,138,78,0.08)',
                  border: '1px solid rgba(29,138,78,0.20)',
                  borderRadius: '2px',
                  padding: '6px 12px',
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
                  Shortlisted
                </div>
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: '700',
                    fontSize: '18px',
                    letterSpacing: '-0.02em',
                    color: '#1D8A4E',
                    lineHeight: 1,
                  }}
                >
                  {shortlistedCount}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity list */}
      {isLoading || activity.length === 0 ? emptyBox : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {activity.map((a, i) => {
            const isLast = i === activity.length - 1;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: isLast ? 'none' : '1px solid rgba(11,14,20,0.06)',
                }}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dotColor[a.status] || '#8A8D98',
                    flexShrink: 0,
                  }}
                />

                {/* Candidate info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#0B0E14',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '2px',
                    }}
                  >
                    {a.candidateName}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      fontWeight: '600',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#8A8D98',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.jobTitle}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <StatusBadge status={a.status} />
                  {a.aiScore != null && <ScoreBadge score={a.aiScore} />}
                </div>

                {/* Time */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '9px',
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    color: '#8A8D98',
                    flexShrink: 0,
                  }}
                >
                  <Clock size={9} color="#8A8D98" />
                  {formatDistanceToNow(new Date(a.updatedAt), { addSuffix: true })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer — auto-refresh indicator */}
      {!isLoading && activity.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            marginTop: '16px',
            padding: '8px 12px',
            border: '1px solid rgba(11,14,20,0.08)',
            borderRadius: '2px',
          }}
        >
          <div
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#1D8A4E',
            }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8A8D98',
            }}
          >
            Auto-refreshes every 15s
          </span>
        </div>
      )}
    </div>
  );
}