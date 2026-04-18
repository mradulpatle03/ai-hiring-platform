const getColor = (score) => {
  if (score >= 75)
    return { bg: "#e8f8f0", color: "#1a7a4a", border: "#a8dfc0" };
  if (score >= 50)
    return { bg: "#fff8e6", color: "#8a6000", border: "#f0d080" };
  return { bg: "#fdf0f0", color: "#c0392b", border: "#f5bcbc" };
};

export default function ScoreBadge({ score }) {
  if (score == null)
    return <span style={{ fontSize: "12px", color: "#aaa" }}>Pending...</span>;
  const c = getColor(score);
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {score}/100
    </span>
  );
}
