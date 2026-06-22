import ScoreBadge from "../ScoreBadge";
import StatusBadge from "../StatusBadge";
import { GitFork as Github, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import XAIPanel from "../xai/XAIPanel";
import { color, font } from "../../styles/theme";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function CandidateCard({
  app,
  onShortlist,
  onReject,
  onOpenChat,
  onSchedule,
}) {
  const [expanded, setExpanded] = useState(false);
  const gh = app.candidate?.github;

  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${color.lineLight}`,
        borderLeft: `3px solid ${color.paper3}`,
        padding: "1.25rem",
        transition: "border-left-color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderLeftColor = color.signal)}
      onMouseLeave={(e) => (e.currentTarget.style.borderLeftColor = color.paper3)}
    >
      {/* Candidate header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            background: color.paper2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: font.mono,
              fontSize: "11px",
              fontWeight: 700,
              color: color.graphite,
              letterSpacing: "0.02em",
            }}
          >
            {getInitials(app.candidate?.name)}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: font.display,
              fontWeight: 600,
              fontSize: "14px",
              color: color.ink,
              letterSpacing: "-0.01em",
              marginBottom: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {app.candidate?.name}
          </div>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: "11px",
              color: color.graphiteDim,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {app.candidate?.email}
          </div>
        </div>
      </div>

      {/* Score + Status */}
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "10px" }}>
        <ScoreBadge score={app.aiScore} />
        <StatusBadge status={app.status} />
      </div>

      {/* Job title */}
      <div
        style={{
          fontFamily: font.mono,
          fontSize: "11px",
          color: color.graphiteDim,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "10px",
        }}
      >
        {app.job?.title}
      </div>

      {/* GitHub */}
      {gh?.connected && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "10px",
            fontFamily: font.mono,
            fontSize: "11px",
            color: color.graphite,
          }}
        >
          <Github size={11} />
          <span>@{gh.username}</span>
          {gh.topLanguages?.slice(0, 2).map((l) => (
            <span
              key={l}
              style={{
                background: color.paper2,
                color: color.graphite,
                border: `1px solid ${color.lineLight}`,
                padding: "1px 7px",
                fontSize: "10px",
                fontFamily: font.mono,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {l}
            </span>
          ))}
          {gh.totalStars > 0 && (
            <span style={{ color: color.graphiteDim }}>⭐ {gh.totalStars}</span>
          )}
        </div>
      )}

      {/* Missing skills */}
      {app.aiMissingSkills?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
          <span
            style={{
              fontFamily: font.mono,
              fontSize: "10px",
              color: color.graphiteDim,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              alignSelf: "center",
              marginRight: "2px",
            }}
          >
            Missing:
          </span>
          {app.aiMissingSkills.slice(0, 3).map((sk) => (
            <span
              key={sk}
              style={{
                fontFamily: font.mono,
                fontSize: "10px",
                color: color.signal,
                border: `1px solid ${color.signal}`,
                padding: "2px 7px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              {sk}
            </span>
          ))}
          {app.aiMissingSkills.length > 3 && (
            <span
              style={{
                fontFamily: font.mono,
                fontSize: "10px",
                color: color.graphiteDim,
                border: `1px solid ${color.lineLight}`,
                padding: "2px 7px",
              }}
            >
              +{app.aiMissingSkills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Expand toggle */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontFamily: font.mono,
          fontSize: "10px",
          fontWeight: 700,
          color: color.graphite,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
          marginBottom: expanded ? "12px" : 0,
        }}
        onClick={() => setExpanded((p) => !p)}
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? "Hide details" : "AI details"}
      </button>

      {/* Expanded AI details */}
      {expanded && (
        <div
          style={{
            paddingTop: "12px",
            borderTop: `1px solid ${color.lineLight}`,
            marginBottom: "12px",
          }}
        >
          {app.aiReasoning && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontFamily: font.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: color.graphite,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "6px",
                }}
              >
                AI reasoning
              </div>
              <p style={{ fontSize: "13px", color: color.ink, lineHeight: 1.65, margin: 0 }}>
                {app.aiReasoning}
              </p>
            </div>
          )}
          {app.githubInsights && (
            <div style={{ marginBottom: "12px" }}>
              <div
                style={{
                  fontFamily: font.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: color.graphite,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "6px",
                }}
              >
                GitHub insights
              </div>
              <p style={{ fontSize: "13px", color: color.ink, lineHeight: 1.65, margin: 0 }}>
                {app.githubInsights}
              </p>
            </div>
          )}
          {app.xai?.dimensions && (
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  fontFamily: font.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: color.graphite,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                XAI breakdown
              </div>
              <XAIPanel
                xai={app.xai}
                overallScore={app.aiScore}
                candidateName={app.candidate?.name}
              />
            </div>
          )}
          {app.aiInterviewQuestions?.length > 0 && (
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  fontFamily: font.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: color.graphite,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "8px",
                }}
              >
                Interview questions
              </div>
              {app.aiInterviewQuestions.slice(0, 3).map((q, i) => (
                <div
                  key={i}
                  style={{
                    background: color.paper,
                    border: `1px solid ${color.lineLight}`,
                    padding: "8px 12px",
                    marginBottom: "6px",
                    fontSize: "13px",
                    color: color.ink,
                  }}
                >
                  <span
                    style={{
                      fontFamily: font.mono,
                      fontWeight: 700,
                      color: color.signal,
                      marginRight: "8px",
                      fontSize: "11px",
                    }}
                  >
                    Q{i + 1}.
                  </span>
                  {q}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <button
          style={{
            fontFamily: font.mono,
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            padding: "6px 12px",
            border: "none",
            cursor: "pointer",
            background: "rgba(29,138,78,0.10)",
            color: "#1D8A4E",
          }}
          onClick={onShortlist}
        >
          Shortlist
        </button>
        <button
          style={{
            fontFamily: font.mono,
            fontSize: "10px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            padding: "6px 12px",
            border: "none",
            cursor: "pointer",
            background: `rgba(255,77,46,0.08)`,
            color: color.signal,
          }}
          onClick={onReject}
        >
          Reject
        </button>
        {app.status === "shortlisted" && (
          <>
            <button
              style={{
                fontFamily: font.mono,
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                padding: "6px 12px",
                border: `1px solid ${color.lineLightStrong}`,
                cursor: "pointer",
                background: "#fff",
                color: color.ink,
              }}
              onClick={onOpenChat}
            >
              Chat
            </button>
            <button
              style={{
                fontFamily: font.mono,
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                padding: "6px 12px",
                border: `1px solid ${color.lineLightStrong}`,
                cursor: "pointer",
                background: "#fff",
                color: color.ink,
              }}
              onClick={onSchedule}
            >
              Schedule
            </button>
          </>
        )}
      </div>
    </div>
  );
}