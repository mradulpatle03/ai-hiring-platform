import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJobApplicants, updateAppStatus } from "../../api/applications";
import { fetchJobById } from "../../api/jobs";
import Layout from "../../components/Layout";
import ScoreBadge from "../../components/ScoreBadge";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, User } from "lucide-react";

const s = {
  h1: { fontSize: "20px", fontWeight: "600", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#888", marginBottom: "1.5rem" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #eee",
  },
  th: {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#888",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    background: "#fafafa",
  },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    borderBottom: "1px solid #f5f5f5",
    verticalAlign: "top",
  },
  drawer: {
    background: "#f9f8ff",
    border: "1px solid #e8e5fc",
    borderRadius: "10px",
    padding: "1.25rem",
    margin: "8px 0",
  },
  qBox: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "8px",
    fontSize: "13px",
  },
  skillPill: {
    background: "#fdf0f0",
    color: "#c0392b",
    fontSize: "11px",
    padding: "3px 9px",
    borderRadius: "999px",
    marginRight: "5px",
    marginBottom: "4px",
    display: "inline-block",
  },
  matchPill: {
    background: "#e8f8f0",
    color: "#1a7a4a",
    fontSize: "11px",
    padding: "3px 9px",
    borderRadius: "999px",
    marginRight: "5px",
    marginBottom: "4px",
    display: "inline-block",
  },
  btnSm: {
    padding: "5px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    marginRight: "6px",
  },
};

export default function Applicants() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(null);

  const { data: jobData } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["applicants", jobId],
    queryFn: () => fetchJobApplicants(jobId),
    refetchInterval: 5000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }) => updateAppStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(["applicants", jobId]);
      toast.success("Status updated");
    },
  });

  const apps = data?.applications || [];

  return (
    <Layout>
      <div style={s.h1}>{jobData?.job?.title || "Applicants"}</div>
      <div style={s.sub}>
        {apps.length} applicant{apps.length !== 1 ? "s" : ""} · sorted by AI
        score
      </div>

      {isLoading ? (
        <p style={{ color: "#aaa" }}>Loading applicants...</p>
      ) : apps.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "14px" }}>No applicants yet.</p>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Candidate</th>
              <th style={s.th}>AI Score</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Applied</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <>
                <tr
                  key={app._id}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    setExpanded(expanded === app._id ? null : app._id)
                  }
                >
                  <td style={s.td}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: "#f0effc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <User size={15} color="#7F77DD" />
                      </div>
                      <div>
                        <div style={{ fontWeight: "500" }}>
                          {app.candidate?.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          {app.candidate?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={s.td}>
                    <ScoreBadge score={app.aiScore} />
                  </td>
                  <td style={s.td}>
                    <StatusBadge status={app.status} />
                  </td>
                  <td style={s.td}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td style={s.td} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={{
                        ...s.btnSm,
                        background: "#e8f8f0",
                        color: "#1a7a4a",
                      }}
                      onClick={() =>
                        mutation.mutate({ id: app._id, status: "shortlisted" })
                      }
                    >
                      Shortlist
                    </button>
                    <button
                      style={{
                        ...s.btnSm,
                        background: "#fdf0f0",
                        color: "#c0392b",
                      }}
                      onClick={() =>
                        mutation.mutate({ id: app._id, status: "rejected" })
                      }
                    >
                      Reject
                    </button>
                  </td>
                </tr>

                {expanded === app._id && (
                  <tr key={`${app._id}-expanded`}>
                    <td colSpan={5} style={{ padding: "0 16px 12px" }}>
                      <div style={s.drawer}>
                        {app.aiReasoning && (
                          <div style={{ marginBottom: "12px" }}>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#555",
                                marginBottom: "5px",
                              }}
                            >
                              AI REASONING
                            </div>
                            <p
                              style={{
                                fontSize: "13px",
                                color: "#444",
                                lineHeight: 1.6,
                              }}
                            >
                              {app.aiReasoning}
                            </p>
                          </div>
                        )}
                        {app.aiMissingSkills?.length > 0 && (
                          <div style={{ marginBottom: "12px" }}>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#555",
                                marginBottom: "5px",
                              }}
                            >
                              MISSING SKILLS
                            </div>
                            {app.aiMissingSkills.map((s) => (
                              <span key={s} style={s.skillPill}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {app.aiInterviewQuestions?.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#555",
                                marginBottom: "8px",
                              }}
                            >
                              SUGGESTED INTERVIEW QUESTIONS
                            </div>
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
                          </div>
                        )}
                        {app.status === "pending" ||
                        app.status === "screening" ? (
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#aaa",
                              marginTop: "8px",
                            }}
                          >
                            ⏳ AI is still screening this candidate...
                          </p>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
