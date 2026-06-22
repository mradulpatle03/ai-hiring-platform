import { useQuery } from "@tanstack/react-query";
import { fetchMyApplications } from "../../api/applications";
import Layout from "../../components/Layout";
import ScoreBadge from "../../components/ScoreBadge";
import StatusBadge from "../../components/StatusBadge";
import { useState } from "react";
import XAIPanel from "../../components/xai/XAIPanel";

const s = {
  pageHead: {
    marginBottom: "28px",
  },
  h1: {
    fontFamily: "var(--font-display)",
    fontSize: "30px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "var(--ink)",
  },
  sub: {
    fontFamily: "var(--font-body)",
    fontSize: "13px",
    color: "var(--graphite)",
    marginTop: "4px",
  },
  empty: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--graphite)",
    letterSpacing: "0.04em",
  },
  card: {
    background: "#fff",
    border: "1px solid var(--line-light)",
    borderBottom: "none",
    overflow: "hidden",
  },
  cardFirst: {
    borderTop: "1px solid var(--line-light)",
  },
  cardLast: {
    borderBottom: "1px solid var(--line-light)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    cursor: "pointer",
    gap: "18px",
  },
  title: {
    fontWeight: "600",
    fontSize: "14px",
    color: "var(--ink)",
  },
  company: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--graphite)",
    marginTop: "3px",
    letterSpacing: "0.02em",
  },
  chevron: {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--graphite)",
  },
  body: {
    padding: "0 18px 18px",
    borderTop: "1px solid var(--line-light)",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    color: "var(--graphite)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginTop: "16px",
    marginBottom: "8px",
    display: "block",
  },
  reasoning: {
    fontSize: "13px",
    color: "var(--ink)",
    lineHeight: 1.65,
    paddingTop: "2px",
  },
  pill: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    padding: "4px 9px",
    marginRight: "5px",
    marginBottom: "5px",
    display: "inline-block",
    border: "1px solid",
    borderRadius: "var(--radius-sm)",
  },
  missing: {
    background: "rgba(255,77,46,0.08)",
    color: "var(--signal)",
    borderColor: "rgba(255,77,46,0.2)",
  },
  qBox: {
    background: "var(--paper)",
    border: "1px solid var(--line-light)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    marginBottom: "6px",
    fontSize: "13px",
    color: "var(--ink)",
    lineHeight: 1.55,
    display: "flex",
    gap: "10px",
  },
  qNum: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "700",
    color: "var(--graphite)",
    letterSpacing: "0.04em",
    paddingTop: "2px",
    flexShrink: 0,
  },
  screening: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--graphite)",
    paddingTop: "14px",
    letterSpacing: "0.02em",
  },
};

export default function MyApplications() {
  const [expanded, setExpanded] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["myApps"],
    queryFn: fetchMyApplications,
    refetchInterval: 8000,
  });
  const apps = data?.applications || [];

  return (
    <Layout>
      <div style={s.pageHead}>
        <div style={s.h1}>Applications</div>
        <div style={s.sub}>{apps.length} total · sorted by date</div>
      </div>

      {isLoading ? (
        <p style={s.empty}>Loading…</p>
      ) : apps.length === 0 ? (
        <p style={s.empty}>No applications yet.</p>
      ) : (
        apps.map((app, idx) => (
          <div
            key={app._id}
            style={{
              ...s.card,
              ...(idx === 0 ? s.cardFirst : {}),
              ...(idx === apps.length - 1 ? s.cardLast : {}),
            }}
          >
            <div
              style={s.header}
              onClick={() => setExpanded(expanded === app._id ? null : app._id)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.title}>{app.job?.title}</div>
                <div style={s.company}>
                  {app.job?.company} ·{" "}
                  {new Date(app.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <ScoreBadge score={app.aiScore} />
                <StatusBadge status={app.status} />
                <span style={s.chevron}>
                  {expanded === app._id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expanded === app._id && (
              <div style={s.body}>
                {app.status === "screening" || app.status === "pending" ? (
                  <p style={s.screening}>
                    AI is still screening your application. Check back in a
                    moment.
                  </p>
                ) : (
                  <>
                    {app.aiReasoning && (
                      <>
                        <span style={s.label}>AI feedback on your resume</span>
                        <p style={s.reasoning}>{app.aiReasoning}</p>
                      </>
                    )}
                    {app.aiMissingSkills?.length > 0 && (
                      <>
                        <span style={s.label}>
                          Skills to add to your resume
                        </span>
                        {app.aiMissingSkills.map((sk) => (
                          <span key={sk} style={{ ...s.pill, ...s.missing }}>
                            {sk}
                          </span>
                        ))}
                      </>
                    )}
                    {app.aiInterviewQuestions?.length > 0 && (
                      <>
                        <span style={s.label}>Prepare for these questions</span>
                        {app.aiInterviewQuestions.map((q, i) => (
                          <div key={i} style={s.qBox}>
                            <span style={s.qNum}>Q{i + 1}.</span>
                            <span>{q}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {app.xai?.dimensions && (
                      <div style={{ marginTop: "12px" }}>
                        <span style={s.label}>Your detailed AI analysis</span>
                        <XAIPanel xai={app.xai} overallScore={app.aiScore} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </Layout>
  );
}
