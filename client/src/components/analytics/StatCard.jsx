const s = {
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "500",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 1,
    marginBottom: "4px",
  },
  sub: { fontSize: "12px", color: "#aaa" },
  trend: (up) => ({
    fontSize: "12px",
    fontWeight: "500",
    color: up ? "#1D9E75" : "#e74c3c",
  }),
};

export default function StatCard({ label, value, icon, sub, trend, trendUp }) {
  return (
    <div style={s.card}>
      <div style={s.label}>
        {icon} {label}
      </div>
      <div style={s.value}>{value ?? "—"}</div>
      {trend && (
        <span style={s.trend(trendUp)}>
          {trendUp ? "↑" : "↓"} {trend}
        </span>
      )}
      {sub && <div style={s.sub}>{sub}</div>}
    </div>
  );
}
