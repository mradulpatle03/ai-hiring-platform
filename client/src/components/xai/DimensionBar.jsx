import { useState, useEffect, useRef } from "react";

const getColor = (score) => {
  if (score >= 8) return { bar: "#1D9E75", bg: "#E1F5EE", text: "#085041", label: "Strong" };
  if (score >= 6) return { bar: "#7F77DD", bg: "#EEEDFE", text: "#3C3489", label: "Good" };
  if (score >= 4) return { bar: "#EF9F27", bg: "#FAEEDA", text: "#633806", label: "Fair" };
  return { bar: "#E24B4A", bg: "#FCEBEB", text: "#791F1F", label: "Weak" };
};

const labels = {
  technicalSkills: "Technical Skills",
  experienceDepth: "Experience Depth",
  projectImpact: "Project Impact",
  communicationClarity: "Communication Clarity",
  growthPotential: "Growth Potential",
};

const CIRCUMFERENCE = 2 * Math.PI * 14;

function ScoreRing({ score, color }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const dashoffset = animated
    ? CIRCUMFERENCE * (1 - (score * 10) / 100)
    : CIRCUMFERENCE;

  return (
    <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="18" cy="18" r="14"
          fill="none"
          stroke="#f0f0f0"
          strokeWidth="2.5"
        />
        <circle
          cx="18" cy="18" r="14"
          fill="none"
          stroke={color.bar}
          strokeWidth="2.5"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 600, color: "#1a1a1a",
      }}>
        {score}
      </span>
    </div>
  );
}

function AnimatedBar({ score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score * 10), 150);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div style={{
      height: 6, background: "#f5f5f5",
      borderRadius: 3, overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        width: `${width}%`,
        background: color.bar,
        borderRadius: 3,
        transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

export default function DimensionBar({ dimKey, data, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const detailRef = useRef(null);
  const [detailHeight, setDetailHeight] = useState(0);

  const score = data?.score || 0;
  const c = getColor(score);

  useEffect(() => {
    if (detailRef.current) {
      setDetailHeight(open ? detailRef.current.scrollHeight : 0);
    }
  }, [open, data]);

  return (
    <div style={{
      marginBottom: 10,
      border: "1px solid #eee",
      borderRadius: 12,
      overflow: "hidden",
      background: "#fff",
      transition: "border-color 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#ddd";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#eee";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          userSelect: "none",
        }}
        onClick={() => setOpen((p) => !p)}
      >
        <ScoreRing score={score} color={c} />

        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
          {labels[dimKey]}
        </span>

        <span style={{
          padding: "2px 10px",
          borderRadius: 999,
          background: c.bg,
          color: c.text,
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}>
          {c.label}
        </span>

        <span style={{
          padding: "2px 8px",
          borderRadius: 999,
          background: "#f5f5f5",
          color: "#555",
          fontSize: 11,
          fontWeight: 600,
          flexShrink: 0,
        }}>
          {score}/10
        </span>

        {/* Chevron */}
        <svg
          width="14" height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            flexShrink: 0,
            color: "#aaa",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Bar */}
      <div style={{ padding: "0 14px 12px" }}>
        <AnimatedBar score={score} color={c} />
      </div>

      {/* Collapsible Detail */}
      <div
        ref={detailRef}
        style={{
          maxHeight: detailHeight,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(.4,0,.2,1), opacity 0.3s",
          opacity: open ? 1 : 0,
        }}
      >
        {data && (
          <div style={{ padding: "0 14px 14px", borderTop: "1px solid #f5f5f5" }}>
            <p style={{
              fontSize: 13, color: "#444",
              lineHeight: 1.65, margin: "12px 0 14px",
            }}>
              {data.reasoning}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {data.highlights?.length > 0 && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: "#1a7a4a", textTransform: "uppercase",
                    letterSpacing: "0.05em", marginBottom: 6,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.25" stroke="#1a7a4a" strokeWidth="1.2" />
                      <path d="M3.5 6l1.7 1.7L8.5 4.5" stroke="#1a7a4a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Strengths
                  </div>
                  {data.highlights.map((h, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: "#444",
                      padding: "3px 0 3px 14px",
                      position: "relative", lineHeight: 1.5,
                    }}>
                      <span style={{
                        position: "absolute", left: 0, top: 8,
                        width: 5, height: 5,
                        borderRadius: "50%", background: "#1D9E75",
                      }} />
                      {h}
                    </div>
                  ))}
                </div>
              )}
              {data.gaps?.length > 0 && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 600,
                    color: "#c0392b", textTransform: "uppercase",
                    letterSpacing: "0.05em", marginBottom: 6,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.25" stroke="#c0392b" strokeWidth="1.2" />
                      <path d="M4 4l4 4M8 4l-4 4" stroke="#c0392b" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    Gaps
                  </div>
                  {data.gaps.map((g, i) => (
                    <div key={i} style={{
                      fontSize: 12, color: "#444",
                      padding: "3px 0 3px 14px",
                      position: "relative", lineHeight: 1.5,
                    }}>
                      <span style={{
                        position: "absolute", left: 0, top: 8,
                        width: 5, height: 5,
                        borderRadius: "50%", background: "#E24B4A",
                      }} />
                      {g}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}