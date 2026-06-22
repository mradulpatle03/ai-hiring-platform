import { color, font } from "../styles/theme";

const map = {
  pending: { dot: color.graphiteDim, text: color.graphite, label: "Pending" },
  screening: { dot: "#4D7CFF", text: "#4D7CFF", label: "Screening" },
  screened: { dot: "#1D8A4E", text: "#1D8A4E", label: "Screened" },
  shortlisted: { dot: "#B07A0E", text: "#B07A0E", label: "Shortlisted" },
  rejected: { dot: color.signal, text: color.signal, label: "Rejected" },
  open: { dot: "#6eff4d", text: "#6eff4d", label: "Opened" },
  closed: { dot: "#ff4d2e", text: "#ff4d2e", label: "Closed" },
};

export default function StatusBadge({ status }) {
  const c = map[status] || map.pending;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: font.mono,
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: c.text,
        border: `1px solid ${color.lineLight}`,
        padding: "4px 9px",
        whiteSpace: "nowrap",
        background: "#fff",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {c.label}
    </span>
  );
}
