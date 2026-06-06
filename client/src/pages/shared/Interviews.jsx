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
  h1: { fontSize: "20px", fontWeight: "600", marginBottom: "4px" },
  sub: { fontSize: "13px", color: "#888", marginBottom: "1.5rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))",
    gap: "1rem",
  },
  empty: { color: "#aaa", fontSize: "14px", padding: "2rem 0" },
};

export default function Interviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selecting, setSelecting] = useState(null); // interview being selected by candidate

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
        <button
          onClick={() => setSelecting(null)}
          style={{
            fontSize: "13px",
            color: "#7F77DD",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginBottom: "1rem",
          }}
        >
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
      <div style={s.h1}>Interviews</div>
      <div style={s.sub}>
        {user.role === "recruiter"
          ? "Manage your scheduled interviews"
          : "Your upcoming and past interviews"}
      </div>

      {isLoading ? (
        <p style={{ color: "#aaa" }}>Loading...</p>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Upcoming ({active.length})
              </div>
              <div style={{ ...s.grid, marginBottom: "2rem" }}>
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
            </>
          )}

          {past.length > 0 && (
            <>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#555",
                  marginBottom: "10px",
                }}
              >
                Past ({past.length})
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
            </>
          )}

          {interviews.length === 0 && <p style={s.empty}>No interviews yet.</p>}
        </>
      )}
    </Layout>
  );
}
