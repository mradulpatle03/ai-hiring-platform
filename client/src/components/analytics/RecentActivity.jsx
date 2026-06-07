import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity } from "../../api/analytics";
import StatusBadge from "../StatusBadge";
import ScoreBadge from "../ScoreBadge";
import { formatDistanceToNow } from "date-fns";
import { Clock, TrendingUp, CheckCircle, XCircle, Eye } from "lucide-react";


const dotColor = {
  shortlisted: "#1D9E75",
  screened: "#7F77DD",
  rejected: "#E24B4A",
  screening: "#378ADD",
  pending: "#bbb",
};

const statusIcon = {
  shortlisted: CheckCircle,
  screened: Eye,
  rejected: XCircle,
  screening: TrendingUp,
  pending: Clock,
};


export default function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-recent"],
    queryFn: fetchRecentActivity,
    refetchInterval: 15000,
  });
  const activity = data?.activity || [];

  // Calculate activity stats
  const totalActivity = activity.length
  const shortlistedCount = activity.filter(a => a.status === 'shortlisted').length
  const avgScore = activity.length > 0 
    ? Math.round(activity.filter(a => a.aiScore != null).reduce((sum, a) => sum + (a.aiScore || 0), 0) / activity.filter(a => a.aiScore != null).length)
    : 0


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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px', letterSpacing: '-0.5px' }}>
            Recent activity
          </div>
          <div style={{ fontSize: '12px', color: '#888', fontWeight: '500' }}>
            Latest candidate updates
          </div>
        </div>
        
        {/* Stats */}
        {activity.length > 0 && !isLoading && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #eeedfe 0%, #e7e5f9 100%)',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(90, 82, 192, 0.15)',
              }}
            >
              <div style={{ fontSize: '10px', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                Updates
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#5a52c0', lineHeight: 1 }}>
                {totalActivity}
              </div>
            </div>
            
            {shortlistedCount > 0 && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #e1f5ee 0%, #d6f0e8 100%)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(29, 158, 117, 0.15)',
                }}
              >
                <div style={{ fontSize: '10px', color: '#777', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                  Shortlisted
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#1D9E75', lineHeight: 1 }}>
                  {shortlistedCount}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity list */}
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
      ) : activity.length === 0 ? (
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
            <Clock size={16} color="#ccc" />
            No activity yet
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {activity.map((a, i) => {
            const Icon = statusIcon[a.status] || Clock
            const isLast = i === activity.length - 1

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 0',
                  borderBottom: isLast ? 'none' : '1px solid #f0f0f5',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)'
                  e.currentTarget.style.marginLeft = '-12px'
                  e.currentTarget.style.marginRight = '-12px'
                  e.currentTarget.style.paddingLeft = '12px'
                  e.currentTarget.style.paddingRight = '12px'
                  e.currentTarget.style.borderRadius = '8px'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.marginLeft = '0'
                  e.currentTarget.style.marginRight = '0'
                  e.currentTarget.style.paddingLeft = '0'
                  e.currentTarget.style.paddingRight = '0'
                  e.currentTarget.style.borderRadius = '0'
                }}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: dotColor[a.status] || '#bbb',
                    flexShrink: 0,
                    boxShadow: `0 0 0 3px ${dotColor[a.status] ? `${dotColor[a.status]}20` : '#f0f0f5'}`,
                  }}
                />

                {/* Candidate info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '3px',
                    }}
                  >
                    {a.candidateName}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#888',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {a.jobTitle}
                  </div>
                </div>

                {/* Right side badges */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexShrink: 0,
                  }}
                >
                  <StatusBadge status={a.status} />
                  {a.aiScore != null && <ScoreBadge score={a.aiScore} />}
                </div>

                {/* Time */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#999',
                    fontWeight: '500',
                    flexShrink: 0,
                    marginLeft: '8px',
                  }}
                >
                  <Clock size={10} color="#ccc" />
                  {formatDistanceToNow(new Date(a.updatedAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer - auto-refresh indicator */}
      {!isLoading && activity.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '1.25rem',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)',
            borderRadius: '8px',
            border: '1px solid #e8e8ed',
          }}
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7F77DD', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: '10px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Auto-refreshes every 15s
          </span>
        </div>
      )}
    </div>
  );
}