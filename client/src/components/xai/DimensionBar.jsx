import { useState, useEffect, useRef } from "react";

const getColor = (score) => {
  if (score >= 8)
    return {
      bar: "#1D8A4E",
      bg: "rgba(29,138,78,0.08)",
      text: "#1D8A4E",
      border: "rgba(29,138,78,0.2)",
      label: "Strong",
    };
  if (score >= 6)
    return {
      bar: "#4D7CFF",
      bg: "rgba(77,124,255,0.08)",
      text: "#4D7CFF",
      border: "rgba(77,124,255,0.2)",
      label: "Good",
    };
  if (score >= 4)
    return {
      bar: "#B07A0E",
      bg: "rgba(176,122,14,0.08)",
      text: "#B07A0E",
      border: "rgba(176,122,14,0.2)",
      label: "Fair",
    };
  return {
    bar: "#FF4D2E",
    bg: "rgba(255,77,46,0.08)",
    text: "#FF4D2E",
    border: "rgba(255,77,46,0.2)",
    label: "Weak",
  };
};

const labels = {
  technicalSkills: "Technical Skills",
  experienceDepth: "Experience Depth",
  projectImpact: "Project Impact",
  communicationClarity: "Communication Clarity",
  growthPotential: "Growth Potential",
};

function ScoreSquare({ score, color }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        flexShrink: 0,
        background: "#0B0E14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: color.bar,
          letterSpacing: "-0.02em",
        }}
      >
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
    <div
      style={{
        height: 3,
        background: "var(--paper-2)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: color.bar,
          transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
        }}
      />
    </div>
  );
}

function BulletItem({ text, color }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: "var(--ink)",
        padding: "3px 0 3px 13px",
        position: "relative",
        lineHeight: 1.5,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 8,
          width: 4,
          height: 4,
          background: color,
        }}
      />
      {text}
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
    <div
      style={{
        marginBottom: 6,
        border: "1px solid var(--line-light)",
        borderTop: "none",
        background: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "11px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          userSelect: "none",
        }}
        onClick={() => setOpen((p) => !p)}
      >
        <ScoreSquare score={score} color={c} />

        <span
          style={{
            flex: 1,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          {labels[dimKey]}
        </span>

        <span
          style={{
            padding: "3px 9px",
            background: c.bg,
            color: c.text,
            border: `1px solid ${c.border}`,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {c.label}
        </span>

        <span
          style={{
            padding: "3px 8px",
            background: "var(--paper)",
            border: "1px solid var(--line-light)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            color: "var(--graphite)",
            flexShrink: 0,
          }}
        >
          {score}/10
        </span>

        <svg
          width="12"
          height="12"
          viewBox="0 0 14 14"
          fill="none"
          style={{
            flexShrink: 0,
            color: "var(--graphite)",
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

      {/* Progress bar */}
      <AnimatedBar score={score} color={c} />

      {/* Collapsible detail */}
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
          <div
            style={{
              padding: "12px 14px 14px",
              borderTop: "1px solid var(--line-light)",
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: "var(--ink)",
                lineHeight: 1.65,
                margin: "0 0 12px",
              }}
            >
              {data.reasoning}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {data.highlights?.length > 0 && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#1D8A4E",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <rect
                        x="0.6"
                        y="0.6"
                        width="10.8"
                        height="10.8"
                        stroke="#1D8A4E"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M3.5 6l1.7 1.7L8.5 4.5"
                        stroke="#1D8A4E"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Strengths
                  </div>
                  {data.highlights.map((h, i) => (
                    <BulletItem key={i} text={h} color="#1D8A4E" />
                  ))}
                </div>
              )}
              {data.gaps?.length > 0 && (
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#FF4D2E",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <rect
                        x="0.6"
                        y="0.6"
                        width="10.8"
                        height="10.8"
                        stroke="#FF4D2E"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M4 4l4 4M8 4l-4 4"
                        stroke="#FF4D2E"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Gaps
                  </div>
                  {data.gaps.map((g, i) => (
                    <BulletItem key={i} text={g} color="#FF4D2E" />
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
