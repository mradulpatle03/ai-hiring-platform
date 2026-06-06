const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f8f8",
    gap: "16px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #f0effc",
    borderTop: "3px solid #7F77DD",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  label: { fontSize: "14px", color: "#aaa" },
};

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={s.spinner} />
      <div style={s.label}>{message}</div>
    </div>
  );
}
