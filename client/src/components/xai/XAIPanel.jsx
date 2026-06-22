import { useState } from "react";
import RadarChart from "./RadarChart";
import DimensionBar from "./DimensionBar";
import {
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

const dimOrder = [
  "technicalSkills",
  "experienceDepth",
  "projectImpact",
  "communicationClarity",
  "growthPotential",
];

const recommendationConfig = {
  shortlist: {
    bg: "rgba(29,138,78,0.08)",
    color: "var(--success)",
    border: "rgba(29,138,78,0.25)",
    label: "Shortlist",
    accent: "var(--success)",
  },
  maybe: {
    bg: "rgba(176,122,14,0.08)",
    color: "var(--warning)",
    border: "rgba(176,122,14,0.25)",
    label: "Review",
    accent: "var(--warning)",
  },
  reject: {
    bg: "rgba(255,77,46,0.08)",
    color: "var(--signal)",
    border: "rgba(255,77,46,0.25)",
    label: "Reject",
    accent: "var(--signal)",
  },
};

function ListItem({ text, dotColor }) {
  return (
    <div
      style={{
        fontSize: 13,
        color: "var(--ink)",
        padding: "4px 0 4px 14px",
        position: "relative",
        lineHeight: 1.55,
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 9,
          width: 4,
          height: 4,
          background: dotColor,
        }}
      />
      {text}
    </div>
  );
}

function SectionBox({
  title,
  icon,
  items,
  dotColor,
  titleColor,
  borderColor,
  bgColor,
  emptyText,
}) {
  return (
    <div
      style={{
        background: bgColor || "var(--paper)",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--radius-sm)",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: titleColor,
        }}
      >
        {icon}
        {title}
      </div>
      {items?.length > 0 ? (
        items.map((item, i) => (
          <ListItem key={i} text={item} dotColor={dotColor} />
        ))
      ) : (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--graphite-dim)",
          }}
        >
          {emptyText || "None listed."}
        </div>
      )}
    </div>
  );
}

function ScoreChip({ label, value, color }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "var(--paper)",
        border: "1px solid var(--line-light)",
        borderRadius: "var(--radius-sm)",
        padding: "10px 14px",
        minWidth: 68,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--graphite)",
          marginTop: 4,
          textAlign: "center",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line-light)",
        borderRadius: "var(--radius-md)",
        padding: "3rem 2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: "var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 12px",
        }}
      >
        <Zap size={18} color="var(--graphite)" />
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--ink)",
          letterSpacing: "-0.01em",
          marginBottom: 5,
        }}
      >
        XAI analysis not available
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--graphite)",
          letterSpacing: "0.02em",
        }}
      >
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
  const avgDim = (
    dimScores.reduce((a, b) => a + b, 0) / dimScores.length
  ).toFixed(1);
  const topDim = dimOrder.reduce((best, k) =>
    (xai.dimensions[k]?.score || 0) > (xai.dimensions[best]?.score || 0)
      ? k
      : best,
  );
  const bottomDim = dimOrder.reduce((worst, k) =>
    (xai.dimensions[k]?.score || 0) < (xai.dimensions[worst]?.score || 0)
      ? k
      : worst,
  );

  const dimLabels = {
    technicalSkills: "Technical",
    experienceDepth: "Experience",
    projectImpact: "Projects",
    communicationClarity: "Comms",
    growthPotential: "Growth",
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line-light)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "11px 18px",
          borderBottom: "1px solid var(--line-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--ink)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Zap size={13} color="var(--volt)" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            AI Explainability Report
          </span>
          {candidateName && (
            <>
              <span style={{ color: "var(--line)", fontSize: 12 }}>·</span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fff",
                  letterSpacing: "-0.01em",
                }}
              >
                {candidateName}
              </span>
            </>
          )}
        </div>

        {/* Rec badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            background: recConf.bg,
            color: recConf.color,
            border: `1px solid ${recConf.border}`,
            borderRadius: "var(--radius-sm)",
          }}
        >
          {recConf.label}
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* Left: radar */}
        <div
          style={{
            padding: "1.5rem 1rem 1.5rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRight: "1px solid var(--line-light)",
            background: "var(--paper)",
            flexShrink: 0,
          }}
        >
          <RadarChart
            dimensions={xai.dimensions}
            size={210}
            overallScore={overallScore}
          />
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--graphite)",
              marginTop: 6,
              textAlign: "center",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            5-dimension analysis
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            <ScoreChip label="avg" value={avgDim} color="var(--wire)" />
            <ScoreChip
              label={`best: ${dimLabels[topDim]}`}
              value={xai.dimensions[topDim]?.score}
              color="var(--success)"
            />
            <ScoreChip
              label={`low: ${dimLabels[bottomDim]}`}
              value={xai.dimensions[bottomDim]?.score}
              color="var(--signal)"
            />
          </div>
        </div>

        {/* Right: summary + strengths/gaps */}
        <div style={{ padding: "1.25rem 1.5rem", flex: 1, minWidth: 0 }}>
          {/* Summary */}
          <p
            style={{
              fontSize: 13,
              color: "var(--ink)",
              lineHeight: 1.75,
              margin: "0 0 1rem",
              paddingLeft: 12,
              borderLeft: `3px solid ${recConf.accent}`,
            }}
          >
            {xai.summary}
          </p>

          {/* Strengths + Gaps grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <SectionBox
              title="Top strengths"
              icon={<TrendingUp size={10} />}
              items={xai.topStrengths}
              dotColor="var(--success)"
              titleColor="var(--success)"
              borderColor="rgba(29,138,78,0.2)"
              bgColor="rgba(29,138,78,0.04)"
            />
            <SectionBox
              title="Critical gaps"
              icon={<AlertTriangle size={10} />}
              items={xai.criticalGaps}
              dotColor="var(--signal)"
              titleColor="var(--signal)"
              borderColor="rgba(255,77,46,0.2)"
              bgColor="rgba(255,77,46,0.04)"
            />
          </div>

          {/* Interview focus — collapsible */}
          {xai.interviewFocus?.length > 0 && (
            <div
              style={{
                border: "1px solid var(--line-light)",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setFocusOpen((p) => !p)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  background: focusOpen ? "var(--paper)" : "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--graphite)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <HelpCircle size={11} color="var(--graphite)" />
                  Interview focus areas
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: "var(--ink)",
                      color: "var(--volt)",
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "1px 6px",
                      marginLeft: 2,
                    }}
                  >
                    {xai.interviewFocus.length}
                  </span>
                </div>
                <ChevronDown
                  size={13}
                  color="var(--graphite)"
                  style={{
                    transform: focusOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.25s",
                  }}
                />
              </button>

              <div
                style={{
                  maxHeight: focusOpen ? 300 : 0,
                  overflow: "hidden",
                  opacity: focusOpen ? 1 : 0,
                  transition:
                    "max-height 0.3s cubic-bezier(.4,0,.2,1), opacity 0.25s",
                }}
              >
                <div
                  style={{
                    padding: "8px 12px 10px",
                    borderTop: "1px solid var(--line-light)",
                  }}
                >
                  {xai.interviewFocus.map((area, i) => (
                    <ListItem key={i} text={area} dotColor="var(--wire)" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dimension breakdown */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderTop: "1px solid var(--line-light)",
          background: "var(--paper)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            color: "var(--graphite)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 6,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          <Target size={12} color="var(--graphite)" />
          Dimension breakdown
          <span
            style={{
              fontSize: 10,
              fontWeight: 400,
              color: "var(--graphite-dim)",
              textTransform: "none",
              letterSpacing: 0,
              marginLeft: 2,
            }}
          >
            — click any to expand
          </span>
        </div>
        {dimOrder.map((key, i) => (
          <DimensionBar
            key={key}
            dimKey={key}
            data={xai.dimensions[key]}
            defaultOpen={false}
          />
        ))}
      </div>
    </div>
  );
}
