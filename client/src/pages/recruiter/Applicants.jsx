import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJobApplicants, updateAppStatus } from "../../api/applications";
import { fetchJobById } from "../../api/jobs";
import Layout from "../../components/Layout";
import ScoreBadge from "../../components/ScoreBadge";
import StatusBadge from "../../components/StatusBadge";
import SlotPicker from "../../components/interviews/SlotPicker";
import toast from "react-hot-toast";
import { User } from "lucide-react";
import { fetchOrCreateConversation } from "../../api/conversations";
import { useNavigate } from "react-router-dom";
import XAIPanel from "../../components/xai/XAIPanel";
import { ApplicantRowSkeleton } from "../../components/Skeleton";
import { color, font } from "../../styles/theme";

export default function Applicants() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [xaiApp, setXaiApp] = useState(null);

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
  const navigate = useNavigate();

  const openChat = async (applicationId) => {
    try {
      await fetchOrCreateConversation(applicationId);
      navigate("/recruiter/messages");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot open chat");
    }
  };
  const [scheduling, setScheduling] = useState(null);

  const apps = data?.applications || [];

  return (
    <Layout>
      <div style={s.eyebrow}>// applicant pool</div>
      <div style={s.h1}>{jobData?.job?.title || "Applicants"}</div>
      <div style={s.sub}>
        {apps.length} applicant{apps.length !== 1 ? "s" : ""} · sorted by AI
        score
      </div>

      {isLoading ? (
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
            {Array.from({ length: 5 }).map((_, i) => (
              <ApplicantRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      ) : apps.length === 0 ? (
        <p style={s.empty}>No applicants yet.</p>
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
                  style={s.tr}
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
                      <div style={s.avatar}>
                        <User size={14} color={color.signal} />
                      </div>
                      <div>
                        <div style={s.name}>{app.candidate?.name}</div>
                        <div style={s.email}>{app.candidate?.email}</div>
                        {app.candidate?.github?.connected && (
                          <div style={s.ghTag}>github connected</div>
                        )}
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
                    <span style={s.dateText}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={s.td} onClick={(e) => e.stopPropagation()}>
                    <button
                      style={s.btnShortlist}
                      onClick={() =>
                        mutation.mutate({ id: app._id, status: "shortlisted" })
                      }
                    >
                      Shortlist
                    </button>
                    <button
                      style={s.btnReject}
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
                    <td colSpan={5} style={{ padding: "0 16px 14px" }}>
                      <div style={s.drawer}>
                        {app.aiReasoning && (
                          <div style={{ marginBottom: "14px" }}>
                            <div style={s.drawerLabel}>AI reasoning</div>
                            <p style={s.drawerText}>{app.aiReasoning}</p>
                          </div>
                        )}
                        {app.githubInsights && (
                          <div style={{ marginBottom: "14px" }}>
                            <div style={s.drawerLabel}>Github insights</div>
                            <p style={s.ghInsightBox}>{app.githubInsights}</p>
                          </div>
                        )}
                        {app.xai?.dimensions && (
                          <button
                            style={s.btnXai}
                            onClick={(e) => {
                              e.stopPropagation();
                              setXaiApp(xaiApp === app._id ? null : app._id);
                            }}
                          >
                            {xaiApp === app._id ? "Hide" : "Show"} XAI report
                          </button>
                        )}

                        {xaiApp === app._id && (
                          <div style={{ marginTop: "12px" }}>
                            <XAIPanel
                              xai={app.xai}
                              overallScore={app.aiScore}
                              candidateName={app.candidate?.name}
                            />
                          </div>
                        )}
                        {app.aiMissingSkills?.length > 0 && (
                          <div
                            style={{ marginBottom: "14px", marginTop: "14px" }}
                          >
                            <div style={s.drawerLabel}>Missing skills</div>
                            {app.aiMissingSkills.map((skill) => (
                              <span key={skill} style={s.skillPill}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                        {app.aiInterviewQuestions?.length > 0 && (
                          <div>
                            <div style={s.drawerLabel}>
                              Suggested interview questions
                            </div>
                            {app.aiInterviewQuestions.map((q, i) => (
                              <div key={i} style={s.qBox}>
                                <span style={s.qNum}>Q{i + 1}.</span>
                                {q}
                              </div>
                            ))}
                          </div>
                        )}
                        {app.status === "shortlisted" && (
                          <button
                            style={s.btnChat}
                            onClick={(e) => {
                              e.stopPropagation();
                              openChat(app._id);
                            }}
                          >
                            Open chat
                          </button>
                        )}
                        {app.status === "shortlisted" && (
                          <button
                            style={s.btnSchedule}
                            onClick={(e) => {
                              e.stopPropagation();
                              setScheduling(app._id);
                            }}
                          >
                            Schedule interview
                          </button>
                        )}
                        {app.status === "pending" ||
                        app.status === "screening" ? (
                          <p style={s.screeningNote}>
                            AI is still screening this candidate…
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
      {scheduling && (
        <div style={s.modalOverlay}>
          <div style={{ width: "100%", maxWidth: "560px" }}>
            <SlotPicker
              applicationId={scheduling}
              onSuccess={() => {
                setScheduling(null);
                toast.success(
                  "Interview invitation sent! Candidate will receive an email.",
                );
              }}
              onCancel={() => setScheduling(null)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
}

const s = {
  eyebrow: {
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: color.signal,
    marginBottom: "6px",
  },
  h1: {
    fontFamily: font.display,
    fontSize: "23px",
    fontWeight: 700,
    marginBottom: "4px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontFamily: font.mono,
    fontSize: "12px",
    color: color.graphiteDim,
    marginBottom: "1.5rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
  },
  th: {
    padding: "12px 16px",
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    color: color.graphite,
    textAlign: "left",
    borderBottom: `1px solid ${color.lineLight}`,
    background: color.paper2,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  tr: { cursor: "pointer" },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    borderBottom: `1px solid ${color.lineLight}`,
    verticalAlign: "top",
  },
  avatar: {
    width: "32px",
    height: "32px",
    background: color.paper2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  name: { fontWeight: 600, fontSize: "14px" },
  email: { fontSize: "12px", color: color.graphiteDim, marginTop: "1px" },
  ghTag: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: font.mono,
    fontSize: "9px",
    color: "#fff",
    background: color.ink,
    padding: "2px 7px",
    marginTop: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  dateText: {
    fontFamily: font.mono,
    fontSize: "12px",
    color: color.graphiteDim,
  },

  btnShortlist: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    padding: "6px 11px",
    border: "none",
    cursor: "pointer",
    marginRight: "6px",
    background: "rgba(29,138,78,0.10)",
    color: "#1D8A4E",
  },
  btnReject: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    padding: "6px 11px",
    border: "none",
    cursor: "pointer",
    background: "rgba(255,77,46,0.08)",
    color: color.signal,
  },

  drawer: {
    background: color.paper,
    border: `1px solid ${color.lineLight}`,
    padding: "1.25rem",
    margin: "8px 0",
  },
  drawerLabel: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    color: color.graphite,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  drawerText: { fontSize: "13px", color: color.ink, lineHeight: 1.6 },
  ghInsightBox: {
    fontSize: "13px",
    color: color.ink,
    lineHeight: 1.6,
    background: "#fff",
    padding: "10px 13px",
    border: `1px solid ${color.lineLight}`,
  },
  skillPill: {
    fontFamily: font.mono,
    fontSize: "10px",
    color: color.signal,
    border: `1px solid ${color.signal}`,
    padding: "3px 9px",
    marginRight: "6px",
    marginBottom: "6px",
    display: "inline-block",
  },
  qBox: {
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
    padding: "10px 14px",
    marginBottom: "8px",
    fontSize: "13px",
  },
  qNum: {
    color: color.signal,
    fontFamily: font.mono,
    fontWeight: 700,
    marginRight: "8px",
  },

  btnXai: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    background: color.ink,
    color: "#fff",
    border: "none",
    padding: "8px 13px",
    cursor: "pointer",
    marginTop: "8px",
    marginBottom: "8px",
  },
  btnChat: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    background: "none",
    color: color.ink,
    border: `1px solid ${color.lineLightStrong}`,
    padding: "7px 12px",
    cursor: "pointer",
    marginTop: "10px",
    marginRight: "8px",
  },
  btnSchedule: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    background: "rgba(29,138,78,0.10)",
    color: "#1D8A4E",
    border: "none",
    padding: "7px 12px",
    cursor: "pointer",
    marginTop: "8px",
  },
  screeningNote: {
    fontFamily: font.mono,
    fontSize: "11px",
    color: color.graphiteDim,
    marginTop: "10px",
  },

  empty: { color: color.graphiteDim, fontSize: "14px" },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(11,14,20,0.6)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
  },
};
