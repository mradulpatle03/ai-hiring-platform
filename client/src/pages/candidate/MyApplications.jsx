import { useQuery } from "@tanstack/react-query";
import { fetchMyApplications } from "../../api/applications";
import Layout from "../../components/Layout";
import ScoreBadge from "../../components/ScoreBadge";
import StatusBadge from "../../components/StatusBadge";
import { useState } from "react";

const s = {
  h1: { fontSize: "20px", fontWeight: "600", marginBottom: "1.5rem" },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    marginBottom: "10px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.25rem",
    cursor: "pointer",
  },
  title: { fontWeight: "600", fontSize: "14px" },
  company: { fontSize: "12px", color: "#888", marginTop: "2px" },
  body: { padding: "0 1.25rem 1.25rem", borderTop: "1px solid #f5f5f5" },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginTop: "12px",
    marginBottom: "5px",
  },
  pill: {
    fontSize: "11px",
    padding: "3px 9px",
    borderRadius: "999px",
    marginRight: "5px",
    marginBottom: "4px",
    display: "inline-block",
  },
  qBox: {
    background: "#f9f8ff",
    border: "1px solid #e8e5fc",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "6px",
    fontSize: "13px",
    color: "#444",
  },
  missing: { background: "#fdf0f0", color: "#c0392b" },
  matched: { background: "#e8f8f0", color: "#1a7a4a" },
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
      <div style={s.h1}>My applications ({apps.length})</div>

      {isLoading ? (
        <p style={{ color: "#aaa" }}>Loading...</p>
      ) : apps.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "14px" }}>No applications yet.</p>
      ) : (
        apps.map((app) => (
          <div key={app._id} style={s.card}>
            <div
              style={s.header}
              onClick={() => setExpanded(expanded === app._id ? null : app._id)}
            >
              <div>
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
                <span style={{ fontSize: "12px", color: "#aaa" }}>
                  {expanded === app._id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expanded === app._id && (
              <div style={s.body}>
                {app.status === "screening" || app.status === "pending" ? (
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#888",
                      paddingTop: "12px",
                    }}
                  >
                    ⏳ AI is still screening your application. Check back in a
                    moment.
                  </p>
                ) : (
                  <>
                    {app.aiReasoning && (
                      <>
                        <div style={s.label}>AI feedback on your resume</div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#444",
                            lineHeight: 1.6,
                          }}
                        >
                          {app.aiReasoning}
                        </p>
                      </>
                    )}
                    {app.aiMissingSkills?.length > 0 && (
                      <>
                        <div style={s.label}>Skills to add to your resume</div>
                        {app.aiMissingSkills.map((sk) => (
                          <span key={sk} style={{ ...s.pill, ...s.missing }}>
                            {sk}
                          </span>
                        ))}
                      </>
                    )}
                    {app.aiInterviewQuestions?.length > 0 && (
                      <>
                        <div style={s.label}>Prepare for these questions</div>
                        {app.aiInterviewQuestions.map((q, i) => (
                          <div key={i} style={s.qBox}>
                            <span
                              style={{
                                color: "#7F77DD",
                                fontWeight: "600",
                                marginRight: "8px",
                              }}
                            >
                              Q{i + 1}.
                            </span>
                            {q}
                          </div>
                        ))}
                      </>
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
