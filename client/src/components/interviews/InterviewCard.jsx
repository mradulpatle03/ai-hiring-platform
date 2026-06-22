import { format, isPast } from "date-fns";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const statusConfig = {
  pending_selection: {
    icon: <AlertCircle size={12} color="#B07A0E" />,
    label: "Awaiting slot",
    color: "#B07A0E",
    bg: "rgba(176,122,14,0.10)",
  },
  scheduled: {
    icon: <CheckCircle size={12} color="#1D8A4E" />,
    label: "Scheduled",
    color: "#1D8A4E",
    bg: "rgba(29,138,78,0.10)",
  },
  cancelled: {
    icon: <XCircle size={12} color="#FF4D2E" />,
    label: "Cancelled",
    color: "#FF4D2E",
    bg: "rgba(255,77,46,0.10)",
  },
  completed: {
    icon: <CheckCircle size={12} color="#4D7CFF" />,
    label: "Completed",
    color: "#4D7CFF",
    bg: "rgba(77,124,255,0.10)",
  },
};

const s = {
  card: {
    background: "#fff",
    border: "1px solid rgba(11,14,20,0.10)",
    borderRadius: "4px",
    padding: "18px 20px",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  jobTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontWeight: "600",
    fontSize: "15px",
    letterSpacing: "-0.02em",
    color: "#0B0E14",
    marginBottom: "2px",
  },
  company: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#5C5F6B",
  },
  badge: (bg, color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 9px",
    background: bg,
    color,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  }),
  divider: {
    borderTop: "1px solid rgba(11,14,20,0.08)",
    margin: "12px 0",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "13px",
    color: "#5C5F6B",
    marginBottom: "6px",
    fontFamily: "'Inter', sans-serif",
  },
  rowMono: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: "600",
    color: "#0B0E14",
    marginBottom: "6px",
  },
  actions: {
    display: "flex",
    gap: "6px",
    marginTop: "14px",
  },
  btn: (variant) => ({
    padding: "7px 12px",
    borderRadius: "2px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    border:
      variant === "primary"
        ? "none"
        : variant === "danger"
          ? "1px solid rgba(255,77,46,0.25)"
          : "1px solid rgba(11,14,20,0.10)",
    background:
      variant === "primary"
        ? "#0B0E14"
        : variant === "danger"
          ? "rgba(255,77,46,0.08)"
          : "#fff",
    color:
      variant === "primary"
        ? "#fff"
        : variant === "danger"
          ? "#FF4D2E"
          : "#5C5F6B",
  }),
  meetLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: "600",
    color: "#4D7CFF",
    textDecoration: "none",
    marginTop: "6px",
    letterSpacing: "0.04em",
  },
};

export default function InterviewCard({
  interview,
  userRole,
  onCancel,
  onComplete,
  onSelectSlot,
}) {
  const cfg = statusConfig[interview.status] || statusConfig.pending_selection;
  const other =
    userRole === "recruiter" ? interview.candidate : interview.recruiter;
  const isScheduled = interview.status === "scheduled";
  const isPastSlot = isScheduled && isPast(new Date(interview.confirmedSlot));

  return (
    <div style={s.card}>
      <div style={s.top}>
        <div>
          <div style={s.jobTitle}>{interview.job?.title}</div>
          <div style={s.company}>{interview.job?.company}</div>
        </div>
        <span style={s.badge(cfg.bg, cfg.color)}>
          {cfg.icon} {cfg.label}
        </span>
      </div>

      <div style={s.row}>
        <Calendar size={12} color="#8A8D98" />
        <span style={{ fontSize: "12px", color: "#8A8D98" }}>
          {userRole === "recruiter"
            ? `Candidate: ${other?.name}`
            : `Recruiter: ${other?.name}`}
        </span>
      </div>

      {isScheduled && interview.confirmedSlot && (
        <>
          <div style={s.divider} />
          <div style={s.rowMono}>
            <Calendar size={12} color="#1D8A4E" />
            {format(new Date(interview.confirmedSlot), "EEE, MMM d yyyy")}
          </div>
          <div style={s.rowMono}>
            <Clock size={12} color="#1D8A4E" />
            {format(new Date(interview.confirmedSlot), "h:mm a")}
          </div>
        </>
      )}

      {interview.status === "pending_selection" && (
        <div style={s.row}>
          <Clock size={12} color="#8A8D98" />
          <span style={{ fontSize: "12px", color: "#8A8D98" }}>
            {interview.slots?.filter((s) => s.available).length} slot(s) proposed
          </span>
        </div>
      )}

      {interview.meetLink && isScheduled && (
        <a
          href={interview.meetLink}
          target="_blank"
          rel="noreferrer"
          style={s.meetLink}
        >
          <Video size={12} /> Join meeting →
        </a>
      )}

      <div style={s.actions}>
        {userRole === "candidate" &&
          interview.status === "pending_selection" && (
            <button style={s.btn("primary")} onClick={onSelectSlot}>
              Select a time →
            </button>
          )}
        {userRole === "recruiter" && isScheduled && isPastSlot && (
          <button style={s.btn("primary")} onClick={onComplete}>
            Mark complete
          </button>
        )}
        {["pending_selection", "scheduled"].includes(interview.status) && (
          <button style={s.btn("danger")} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}