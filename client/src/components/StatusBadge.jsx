const map = {
  pending: { bg: "#f5f5f5", color: "#888" },
  screening: { bg: "#e8f0ff", color: "#3a5bbf" },
  screened: { bg: "#e8f8f0", color: "#1a7a4a" },
  shortlisted: { bg: "#f0effc", color: "#5a52c0" },
  rejected: { bg: "#fdf0f0", color: "#c0392b" },
};

export default function StatusBadge({ status }) {
  const c = map[status] || map.pending;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "500",
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}
