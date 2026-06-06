import ScoreBadge from "../ScoreBadge";
import StatusBadge from "../StatusBadge";
import { GitFork as Github, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import XAIPanel from "../xai/XAIPanel";

const s = {
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.25rem",
    transition: "border-color 0.15s",
  },
  top: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#f0effc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    color: "#7F77DD",
    flexShrink: 0,
  },
  name: { fontWeight: "600", fontSize: "14px", marginBottom: "2px" },
  email: { fontSize: "12px", color: "#888" },
  scores: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  job: { fontSize: "12px", color: "#888", marginBottom: "8px" },
  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginBottom: "8px",
  },
  skill: {
    fontSize: "11px",
    background: "#fdf0f0",
    color: "#c0392b",
    padding: "2px 7px",
    borderRadius: "999px",
  },
  gh: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#555",
    marginBottom: "8px",
  },
  expand: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#7F77DD",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 0",
  },
  detail: {
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #f5f5f5",
  },
  dtLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "5px",
  },
  dtText: {
    fontSize: "13px",
    color: "#444",
    lineHeight: 1.6,
    marginBottom: "8px",
  },
  qBox: {
    background: "#f9f8ff",
    border: "1px solid #e8e5fc",
    borderRadius: "7px",
    padding: "8px 10px",
    fontSize: "12px",
    color: "#444",
    marginBottom: "5px",
  },
  actions: { display: "flex", gap: "6px", marginTop: "10px", flexWrap: "wrap" },
  btn: (v) => ({
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    background:
      v === "shortlist" ? "#e8f8f0" : v === "reject" ? "#fdf0f0" : "#f5f5f5",
    color: v === "shortlist" ? "#1a7a4a" : v === "reject" ? "#c0392b" : "#555",
  }),
};

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
      style={s.card}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c8c5f5")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#eee")}
    >
      <div style={s.top}>
        <div style={s.avatar}>{getInitials(app.candidate?.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={s.name}>{app.candidate?.name}</div>
          <div style={s.email}>{app.candidate?.email}</div>
        </div>
      </div>

      <div style={s.scores}>
        <ScoreBadge score={app.aiScore} />
        <StatusBadge status={app.status} />
      </div>

      <div style={s.job}>{app.job?.title}</div>

      {gh?.connected && (
        <div style={s.gh}>
          <Github size={11} />
          <span>@{gh.username}</span>
          {gh.topLanguages?.slice(0, 2).map((l) => (
            <span
              key={l}
              style={{
                background: "#f0effc",
                color: "#5a52c0",
                padding: "1px 6px",
                borderRadius: "999px",
                fontSize: "10px",
              }}
            >
              {l}
            </span>
          ))}
          {gh.totalStars > 0 && (
            <span style={{ color: "#aaa" }}>⭐ {gh.totalStars}</span>
          )}
        </div>
      )}

      {app.aiMissingSkills?.length > 0 && (
        <div style={s.skills}>
          <span
            style={{ fontSize: "11px", color: "#aaa", alignSelf: "center" }}
          >
            Missing:
          </span>
          {app.aiMissingSkills.slice(0, 3).map((sk) => (
            <span key={sk} style={s.skill}>
              {sk}
            </span>
          ))}
          {app.aiMissingSkills.length > 3 && (
            <span style={{ ...s.skill, background: "#f5f5f5", color: "#888" }}>
              +{app.aiMissingSkills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Expand / collapse AI details */}
      <button style={s.expand} onClick={() => setExpanded((p) => !p)}>
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? "Hide details" : "AI details"}
      </button>

      {expanded && (
        <div style={s.detail}>
          {app.aiReasoning && (
            <>
              <div style={s.dtLabel}>AI reasoning</div>
              <div style={s.dtText}>{app.aiReasoning}</div>
            </>
          )}
          {app.githubInsights && (
            <>
              <div style={s.dtLabel}>GitHub insights</div>
              <div style={s.dtText}>{app.githubInsights}</div>
            </>
          )}
          {app.xai?.dimensions && (
            <div style={{ marginTop: "10px" }}>
              <div style={s.dtLabel}>XAI breakdown</div>
              <XAIPanel
                xai={app.xai}
                overallScore={app.aiScore}
                candidateName={app.candidate?.name}
              />
            </div>
          )}
          {app.aiInterviewQuestions?.length > 0 && (
            <>
              <div style={s.dtLabel}>Interview questions</div>
              {app.aiInterviewQuestions.slice(0, 3).map((q, i) => (
                <div key={i} style={s.qBox}>
                  <span
                    style={{
                      color: "#7F77DD",
                      fontWeight: "600",
                      marginRight: "6px",
                    }}
                  >
                    Q{i + 1}.
                  </span>
                  {q}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <div style={s.actions}>
        <button style={s.btn("shortlist")} onClick={onShortlist}>
          Shortlist
        </button>
        <button style={s.btn("reject")} onClick={onReject}>
          Reject
        </button>
        {app.status === "shortlisted" && (
          <>
            <button style={s.btn("chat")} onClick={onOpenChat}>
              💬 Chat
            </button>
            <button style={s.btn("schedule")} onClick={onSchedule}>
              📅 Schedule
            </button>
          </>
        )}
      </div>
    </div>
  );
}
