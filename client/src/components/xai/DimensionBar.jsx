import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const getColor = (score) => {
  if (score >= 8) return { bar: "#1D9E75", bg: "#E1F5EE", text: "#085041" };
  if (score >= 6) return { bar: "#7F77DD", bg: "#EEEDFE", text: "#3C3489" };
  if (score >= 4) return { bar: "#EF9F27", bg: "#FAEEDA", text: "#633806" };
  return { bar: "#E24B4A", bg: "#FCEBEB", text: "#791F1F" };
};

const icons = {
  technicalSkills: "⚡",
  experienceDepth: "📋",
  projectImpact: "🚀",
  communicationClarity: "💬",
  growthPotential: "📈",
};

const labels = {
  technicalSkills: "Technical Skills",
  experienceDepth: "Experience Depth",
  projectImpact: "Project Impact",
  communicationClarity: "Communication Clarity",
  growthPotential: "Growth Potential",
};

const s = {
  wrap: {
    marginBottom: "10px",
    border: "1px solid #eee",
    borderRadius: "10px",
    overflow: "hidden",
  },
  header: {
    padding: "12px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  icon: { fontSize: "16px", flexShrink: 0 },
  label: { flex: 1, fontSize: "13px", fontWeight: "500", color: "#1a1a1a" },
  scorePill: (c) => ({
    padding: "2px 10px",
    borderRadius: "999px",
    background: c.bg,
    color: c.text,
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
  }),
  barWrap: { padding: "0 14px 12px" },
  barTrack: {
    height: "5px",
    background: "#f5f5f5",
    borderRadius: "3px",
    overflow: "hidden",
  },
  barFill: (w, c) => ({
    height: "100%",
    width: `${w}%`,
    background: c.bar,
    borderRadius: "3px",
    transition: "width 0.6s ease",
  }),
  detail: { padding: "0 14px 12px", borderTop: "1px solid #f5f5f5" },
  reason: {
    fontSize: "13px",
    color: "#444",
    lineHeight: 1.6,
    margin: "10px 0",
  },
  row: { display: "flex", gap: "12px", flexWrap: "wrap" },
  col: { flex: 1, minWidth: "140px" },
  colTitle: (green) => ({
    fontSize: "11px",
    fontWeight: "600",
    color: green ? "#1a7a4a" : "#c0392b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "5px",
  }),
  listItem: (green) => ({
    fontSize: "12px",
    color: "#444",
    padding: "3px 0 3px 14px",
    position: "relative",
    lineHeight: 1.5,
  }),
  dot: (green) => ({
    position: "absolute",
    left: 0,
    top: "7px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: green ? "#1D9E75" : "#E24B4A",
  }),
};

export default function DimensionBar({ dimKey, data, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const score = data?.score || 0;
  const c = getColor(score);

  return (
    <div style={s.wrap}>
      <div style={s.header} onClick={() => setOpen((p) => !p)}>
        <span style={s.icon}>{icons[dimKey]}</span>
        <span style={s.label}>{labels[dimKey]}</span>
        <span style={s.scorePill(c)}>{score}/10</span>
        {open ? (
          <ChevronUp size={13} color="#aaa" />
        ) : (
          <ChevronDown size={13} color="#aaa" />
        )}
      </div>

      <div style={s.barWrap}>
        <div style={s.barTrack}>
          <div style={s.barFill(score * 10, c)} />
        </div>
      </div>

      {open && data && (
        <div style={s.detail}>
          <p style={s.reason}>{data.reasoning}</p>
          <div style={s.row}>
            {data.highlights?.length > 0 && (
              <div style={s.col}>
                <div style={s.colTitle(true)}>✓ Strengths</div>
                {data.highlights.map((h, i) => (
                  <div key={i} style={s.listItem(true)}>
                    <span style={s.dot(true)} />
                    {h}
                  </div>
                ))}
              </div>
            )}
            {data.gaps?.length > 0 && (
              <div style={s.col}>
                <div style={s.colTitle(false)}>✗ Gaps</div>
                {data.gaps.map((g, i) => (
                  <div key={i} style={s.listItem(false)}>
                    <span style={s.dot(false)} />
                    {g}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
