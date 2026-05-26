import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity } from "../../api/analytics";
import StatusBadge from "../StatusBadge";
import ScoreBadge from "../ScoreBadge";
import { formatDistanceToNow } from "date-fns";

const s = {
  wrap: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  title: { fontSize: "14px", fontWeight: "600", marginBottom: "4px" },
  sub: { fontSize: "12px", color: "#aaa", marginBottom: "1rem" },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  dot: (color) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: color,
    flexShrink: 0,
  }),
  info: { flex: 1, minWidth: 0 },
  name: {
    fontSize: "13px",
    fontWeight: "500",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  job: {
    fontSize: "11px",
    color: "#aaa",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  right: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "3px",
    flexShrink: 0,
  },
  time: { fontSize: "11px", color: "#bbb" },
};

const dotColor = {
  shortlisted: "#1D9E75",
  screened: "#7F77DD",
  rejected: "#E24B4A",
  screening: "#378ADD",
  pending: "#bbb",
};

export default function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-recent"],
    queryFn: fetchRecentActivity,
    refetchInterval: 15000,
  });
  const activity = data?.activity || [];

  return (
    <div style={s.wrap}>
      <div style={s.title}>Recent activity</div>
      <div style={s.sub}>Latest candidate updates</div>
      {isLoading ? (
        <div style={{ color: "#ddd", fontSize: "13px" }}>Loading...</div>
      ) : activity.length === 0 ? (
        <div style={{ color: "#ddd", fontSize: "13px", padding: "1rem 0" }}>
          No activity yet
        </div>
      ) : (
        activity.map((a, i) => (
          <div
            key={i}
            style={{
              ...s.item,
              ...(i === activity.length - 1 ? { borderBottom: "none" } : {}),
            }}
          >
            <div style={s.dot(dotColor[a.status] || "#bbb")} />
            <div style={s.info}>
              <div style={s.name}>{a.candidateName}</div>
              <div style={s.job}>{a.jobTitle}</div>
            </div>
            <div style={s.right}>
              <StatusBadge status={a.status} />
              {a.aiScore != null && <ScoreBadge score={a.aiScore} />}
              <span style={s.time}>
                {formatDistanceToNow(new Date(a.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
