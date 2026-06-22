const s = {
  card: {
    background: "#fff",
    border: "1px solid rgba(11,14,20,0.10)",
    borderRadius: "4px",
    padding: "18px 20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  accent: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: "3px",
    width: "100%",
    background: "rgba(11,14,20,0.06)",
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#5C5F6B",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  value: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "34px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "#0B0E14",
    lineHeight: 1,
    marginBottom: "6px",
  },
  sub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    color: "#8A8D98",
    marginTop: "4px",
  },
  trend: (up) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.04em",
    color: up ? "#1D8A4E" : "#FF4D2E",
    display: "inline-block",
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
          {trendUp ? "▲" : "▼"} {trend}
        </span>
      )}
      {sub && <div style={s.sub}>{sub}</div>}
      <div style={{ ...s.accent, background: trend ? (trendUp ? 'rgba(29,138,78,0.5)' : 'rgba(255,77,46,0.5)') : 'rgba(11,14,20,0.06)' }} />
    </div>
  );
}