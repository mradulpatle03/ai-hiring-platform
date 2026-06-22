import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMyInterviews,
  cancelInterview,
  completeInterview,
} from "../../api/interviews";
import Layout from "../../components/Layout";
import InterviewCard from "../../components/interviews/InterviewCard";
import SlotSelector from "../../components/interviews/SlotSelector";
import toast from "react-hot-toast";

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
    fontSize: "13px",
    color: "var(--graphite)",
    marginTop: "4px",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionCount: {
    background: "var(--paper-2)",
    padding: "1px 7px",
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "700",
    color: "var(--graphite)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))",
    gap: "1px",
    background: "var(--line-light)",
    border: "1px solid var(--line-light)",
  },
  gridWrap: {
    marginBottom: "32px",
  },
  empty: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--graphite)",
    letterSpacing: "0.04em",
    padding: "2rem 0",
  },
  loading: {
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "var(--graphite)",
    letterSpacing: "0.04em",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    background: "none",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px",
    padding: "0",
  },
};

export default function Interviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selecting, setSelecting] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["myInterviews"],
    queryFn: fetchMyInterviews,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelInterview,
    onSuccess: () => {
      queryClient.invalidateQueries(["myInterviews"]);
      toast.success("Interview cancelled");
    },
    onError: () => toast.error("Failed to cancel"),
  });

  const completeMutation = useMutation({
    mutationFn: completeInterview,
    onSuccess: () => {
      queryClient.invalidateQueries(["myInterviews"]);
      toast.success("Marked as completed");
    },
    onError: () => toast.error("Failed to update"),
  });

  const interviews = data?.interviews || [];
  const active = interviews.filter((i) =>
    ["pending_selection", "scheduled"].includes(i.status),
  );
  const past = interviews.filter((i) =>
    ["completed", "cancelled"].includes(i.status),
  );

  if (selecting) {
    return (
      <Layout>
        <button onClick={() => setSelecting(null)} style={s.backBtn}>
          ← Back to interviews
        </button>
        <SlotSelector
          interview={selecting}
          onConfirmed={() => {
            setSelecting(null);
            queryClient.invalidateQueries(["myInterviews"]);
            toast.success(
              "Interview confirmed! Check your email for the calendar invite.",
            );
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={s.pageHead}>
        <div style={s.h1}>Interviews</div>
        <div style={s.sub}>
          {user.role === "recruiter"
            ? "Manage your scheduled interviews"
            : "Your upcoming and past interviews"}
        </div>
      </div>

      {isLoading ? (
        <p style={s.loading}>Loading…</p>
      ) : (
        <>
          {active.length > 0 && (
            <div style={s.gridWrap}>
              <div style={s.sectionLabel}>
                Upcoming
                <span style={s.sectionCount}>{active.length}</span>
              </div>
              <div style={s.grid}>
                {active.map((iv) => (
                  <InterviewCard
                    key={iv._id}
                    interview={iv}
                    userRole={user.role}
                    onCancel={() => cancelMutation.mutate(iv._id)}
                    onComplete={() => completeMutation.mutate(iv._id)}
                    onSelectSlot={() => setSelecting(iv)}
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div style={s.gridWrap}>
              <div style={s.sectionLabel}>
                Past
                <span style={s.sectionCount}>{past.length}</span>
              </div>
              <div style={s.grid}>
                {past.map((iv) => (
                  <InterviewCard
                    key={iv._id}
                    interview={iv}
                    userRole={user.role}
                    onCancel={() => cancelMutation.mutate(iv._id)}
                    onComplete={() => completeMutation.mutate(iv._id)}
                    onSelectSlot={() => setSelecting(iv)}
                  />
                ))}
              </div>
            </div>
          )}

          {interviews.length === 0 && (
            <p style={s.empty}>No interviews yet.</p>
          )}
        </>
      )}
    </Layout>
  );
}