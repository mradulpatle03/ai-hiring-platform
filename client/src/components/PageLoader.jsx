const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--paper)",
    gap: "16px",
  },
  mark: {
    width: "36px",
    height: "36px",
    background: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
    animation: "hf-pulse 1.2s ease-in-out infinite",
  },
  markText: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--volt)",
    letterSpacing: "-0.02em",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--graphite)",
  },
};

export default function PageLoader({ message = "Loading..." }) {
  return (
    <div style={s.page}>
      <style>{`
        @keyframes hf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.9); }
        }
      `}</style>
      <div style={s.mark}>
        <span style={s.markText}>HF</span>
      </div>
      <div style={s.label}>{message}</div>
    </div>
  );
}