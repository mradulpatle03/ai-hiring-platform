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
    icon: <AlertCircle size={14} color="#EF9F27" />,
    label: "Awaiting slot selection",
    color: "#EF9F27",
    bg: "#FAEEDA",
  },
  scheduled: {
    icon: <CheckCircle size={14} color="#1D9E75" />,
    label: "Scheduled",
    color: "#1D9E75",
    bg: "#E1F5EE",
  },
  cancelled: {
    icon: <XCircle size={14} color="#E24B4A" />,
    label: "Cancelled",
    color: "#E24B4A",
    bg: "#FCEBEB",
  },
  completed: {
    icon: <CheckCircle size={14} color="#7F77DD" />,
    label: "Completed",
    color: "#7F77DD",
    bg: "#EEEDFE",
  },
};

const s = {
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "10px",
  },
  jobTitle: { fontWeight: "600", fontSize: "14px", marginBottom: "2px" },
  company: { fontSize: "12px", color: "#888" },
  badge: (bg, color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "999px",
    background: bg,
    color,
    fontSize: "12px",
    fontWeight: "500",
  }),
  row: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#555",
    marginBottom: "5px",
  },
  actions: { display: "flex", gap: "8px", marginTop: "12px" },
  btn: (variant) => ({
    padding: "7px 14px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    background:
      variant === "primary"
        ? "#7F77DD"
        : variant === "danger"
          ? "#fdf0f0"
          : "#f5f5f5",
    color:
      variant === "primary"
        ? "#fff"
        : variant === "danger"
          ? "#c0392b"
          : "#555",
  }),
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
        <Calendar size={13} color="#aaa" />
        <span style={{ fontSize: "12px", color: "#888" }}>
          {userRole === "recruiter"
            ? `Candidate: ${other?.name}`
            : `Recruiter: ${other?.name}`}
        </span>
      </div>

      {isScheduled && interview.confirmedSlot && (
        <>
          <div style={s.row}>
            <Calendar size={13} color="#1D9E75" />
            <span>
              {format(new Date(interview.confirmedSlot), "EEEE, MMMM d yyyy")}
            </span>
          </div>
          <div style={s.row}>
            <Clock size={13} color="#1D9E75" />
            <span>{format(new Date(interview.confirmedSlot), "h:mm a")}</span>
          </div>
        </>
      )}

      {interview.status === "pending_selection" && (
        <div style={s.row}>
          <Clock size={13} color="#aaa" />
          <span style={{ fontSize: "12px", color: "#888" }}>
            {interview.slots?.filter((s) => s.available).length} slot(s)
            proposed
          </span>
        </div>
      )}

      {interview.meetLink && isScheduled && (
        <a
          href={interview.meetLink}
          target="_blank"
          rel="noreferrer"
          style={{
            ...s.row,
            color: "#7F77DD",
            textDecoration: "none",
            marginTop: "6px",
          }}
        >
          <Video size={13} /> Join meeting
        </a>
      )}

      <div style={s.actions}>
        {/* Candidate: select slot */}
        {userRole === "candidate" &&
          interview.status === "pending_selection" && (
            <button style={s.btn("primary")} onClick={onSelectSlot}>
              Select a time →
            </button>
          )}
        {/* Recruiter: mark complete */}
        {userRole === "recruiter" && isScheduled && isPastSlot && (
          <button style={s.btn("primary")} onClick={onComplete}>
            Mark as completed
          </button>
        )}
        {/* Cancel button */}
        {["pending_selection", "scheduled"].includes(interview.status) && (
          <button style={s.btn("danger")} onClick={onCancel}>
            Cancel interview
          </button>
        )}
      </div>
    </div>
  );
}
