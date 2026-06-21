import { color, font } from "../styles/theme";

const map = {
  pending: { dot: color.graphiteDim, text: color.graphite },
  screening: { dot: color.wire, text: color.wire },
  screened: { dot: "#1D8A4E", text: "#1D8A4E" },
  shortlisted: { dot: color.volt, text: "#5C7A1A" },
  rejected: { dot: color.signal, text: color.signal },
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
        letterSpacing: "0.04em",
        color: c.text,
        border: `1px solid ${color.lineLight}`,
        padding: "4px 9px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: c.dot,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}