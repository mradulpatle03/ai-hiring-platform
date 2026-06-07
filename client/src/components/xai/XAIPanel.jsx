import { useState } from "react";
import RadarChart from "./RadarChart";
import DimensionBar from "./DimensionBar";
import { Zap, Target, TrendingUp, AlertTriangle, HelpCircle, ChevronDown } from "lucide-react";

const dimOrder = [
  "technicalSkills",
  "experienceDepth",
  "projectImpact",
  "communicationClarity",
  "growthPotential",
];

const recommendationConfig = {
  shortlist: {
    bg: "#E1F5EE", color: "#085041", border: "#5DCAA5",
    label: "Recommended — Shortlist", icon: "✅", accent: "#1D9E75",
  },
  maybe: {
    bg: "#FAEEDA", color: "#633806", border: "#EF9F27",
    label: "On the fence — Review", icon: "🤔", accent: "#EF9F27",
  },
  reject: {
    bg: "#FCEBEB", color: "#791F1F", border: "#F09595",
    label: "Not recommended — Reject", icon: "❌", accent: "#E24B4A",
  },
};

function ListItem({ text, dotColor }) {
  return (
    <div style={{
      fontSize: 13, color: "#444", padding: "4px 0 4px 14px",
      position: "relative", lineHeight: 1.55,
    }}>
      <span style={{
        position: "absolute", left: 0, top: 9,
        width: 5, height: 5, borderRadius: "50%", background: dotColor,
      }} />
      {text}
    </div>
  );
}

function SectionBox({ title, icon, items, dotColor, titleColor, borderColor, bgColor, emptyText }) {
  return (
    <div style={{
      background: bgColor || "#fafafa",
      border: `1px solid ${borderColor}`,
      borderRadius: 10,
      padding: "12px 14px",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 600, textTransform: "uppercase",
        letterSpacing: "0.05em", marginBottom: 8,
        display: "flex", alignItems: "center", gap: 5, color: titleColor,
      }}>
        {icon}
        {title}
      </div>
      {items?.length > 0
        ? items.map((item, i) => <ListItem key={i} text={item} dotColor={dotColor} />)
        : <div style={{ fontSize: 12, color: "#bbb" }}>{emptyText || "None listed."}</div>
      }
    </div>
  );
}

function ScoreChip({ label, value, color }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "#fafafa", border: "1px solid #eee",
      borderRadius: 10, padding: "10px 14px", minWidth: 70,
    }}>
      <span style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 10, color: "#aaa", marginTop: 3, textAlign: "center" }}>{label}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #eee", borderRadius: 12,
      padding: "3rem 2rem", textAlign: "center",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%",
        background: "#f5f5f5", display: "flex", alignItems: "center",
        justifyContent: "center", margin: "0 auto 12px",
      }}>
        <Zap size={22} color="#ccc" />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "#999", marginBottom: 4 }}>
        XAI analysis not available yet
      </div>
      <div style={{ fontSize: 12, color: "#bbb" }}>
        Applied before XAI was enabled, or still screening.
      </div>
    </div>
  );
}

export default function XAIPanel({ xai, overallScore, candidateName }) {
  const [focusOpen, setFocusOpen] = useState(false);

  if (!xai?.dimensions) return <EmptyState />;

  const rec = xai.recommendation || "maybe";
  const recConf = recommendationConfig[rec] || recommendationConfig.maybe;

  const dimScores = dimOrder.map((k) => xai.dimensions[k]?.score || 0);
  const avgDim = (dimScores.reduce((a, b) => a + b, 0) / dimScores.length).toFixed(1);
  const topDim = dimOrder.reduce((best, k) =>
    (xai.dimensions[k]?.score || 0) > (xai.dimensions[best]?.score || 0) ? k : best
  );
  const bottomDim = dimOrder.reduce((worst, k) =>
    (xai.dimensions[k]?.score || 0) < (xai.dimensions[worst]?.score || 0) ? k : worst
  );

  const dimLabels = {
    technicalSkills: "Technical",
    experienceDepth: "Experience",
    projectImpact: "Projects",
    communicationClarity: "Comms",
    growthPotential: "Growth",
  };

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8e8e8",
      borderRadius: 14,
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Header bar */}
      <div style={{
        padding: "12px 18px",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#fafafa",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: "#f0effe", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={13} color="#7F77DD" />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#555", letterSpacing: "0.02em" }}>
            AI Explainability Report
          </span>
          {candidateName && (
            <>
              <span style={{ color: "#ddd", fontSize: 12 }}>·</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{candidateName}</span>
            </>
          )}
        </div>

        {/* Rec badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600,
          background: recConf.bg, color: recConf.color, border: `1px solid ${recConf.border}`,
        }}>
          {recConf.icon} {recConf.label}
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", gap: 0 }}>

        {/* Left: radar */}
        <div style={{
          padding: "1.5rem 1rem 1.5rem 1.5rem",
          display: "flex", flexDirection: "column", alignItems: "center",
          borderRight: "1px solid #f0f0f0",
          background: "#fcfcfd",
          flexShrink: 0,
        }}>
          <RadarChart dimensions={xai.dimensions} size={210} overallScore={overallScore} />
          <div style={{ fontSize: 11, color: "#bbb", marginTop: 4, textAlign: "center" }}>
            5-dimension analysis
          </div>

          {/* Mini stat chips */}
          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            <ScoreChip label="avg" value={avgDim} color="#7F77DD" />
            <ScoreChip label={`best: ${dimLabels[topDim]}`} value={xai.dimensions[topDim]?.score} color="#1D9E75" />
            <ScoreChip label={`low: ${dimLabels[bottomDim]}`} value={xai.dimensions[bottomDim]?.score} color="#E24B4A" />
          </div>
        </div>

        {/* Right: summary + strengths/gaps */}
        <div style={{ padding: "1.25rem 1.5rem", flex: 1, minWidth: 0 }}>

          {/* Summary */}
          <p style={{
            fontSize: 13, color: "#444", lineHeight: 1.75,
            margin: "0 0 1rem",
            paddingLeft: 10,
            borderLeft: `3px solid ${recConf.accent}`,
          }}>
            {xai.summary}
          </p>

          {/* Strengths + Gaps grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <SectionBox
              title="Top strengths"
              icon={<TrendingUp size={11} />}
              items={xai.topStrengths}
              dotColor="#1D9E75"
              titleColor="#1a7a4a"
              borderColor="#b8e8d0"
              bgColor="#f5fdf8"
            />
            <SectionBox
              title="Critical gaps"
              icon={<AlertTriangle size={11} />}
              items={xai.criticalGaps}
              dotColor="#E24B4A"
              titleColor="#c0392b"
              borderColor="#f5bcbc"
              bgColor="#fff8f8"
            />
          </div>

          {/* Interview focus — collapsible */}
          {xai.interviewFocus?.length > 0 && (
            <div style={{
              border: "1px solid #e8e5fc",
              borderRadius: 8,
              overflow: "hidden",
            }}>
              <button
                onClick={() => setFocusOpen((p) => !p)}
                style={{
                  width: "100%", padding: "9px 12px",
                  background: focusOpen ? "#f0effe" : "#f9f8ff",
                  border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "background 0.2s",
                }}
              >
                <div style={{
                  fontSize: 11, fontWeight: 600, color: "#5a52c0",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  <HelpCircle size={11} color="#7F77DD" />
                  Interview focus areas
                  <span style={{
                    background: "#e8e5fc", color: "#5a52c0",
                    borderRadius: 999, fontSize: 10, fontWeight: 700,
                    padding: "1px 7px", marginLeft: 4,
                  }}>
                    {xai.interviewFocus.length}
                  </span>
                </div>
                <ChevronDown
                  size={13} color="#aaa"
                  style={{ transform: focusOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}
                />
              </button>

              <div style={{
                maxHeight: focusOpen ? 300 : 0,
                overflow: "hidden",
                opacity: focusOpen ? 1 : 0,
                transition: "max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.25s",
              }}>
                <div style={{ padding: "8px 12px 10px" }}>
                  {xai.interviewFocus.map((area, i) => (
                    <ListItem key={i} text={area} dotColor="#7F77DD" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid #f0f0f0" }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: "#888",
          marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: 6,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          <Target size={13} color="#7F77DD" />
          Dimension breakdown
          <span style={{ fontSize: 11, fontWeight: 400, color: "#bbb", textTransform: "none", letterSpacing: 0, marginLeft: 2 }}>
            — click any to expand
          </span>
        </div>
        {dimOrder.map((key, i) => (
          <DimensionBar
            key={key}
            dimKey={key}
            data={xai.dimensions[key]}
            defaultOpen={i === 0}
          />
        ))}
      </div>
    </div>
  );
}