import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyJobs, closeJob } from "../../api/jobs";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";
import { ListSkeleton } from "../../components/Skeleton";

const s = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  h1: { fontSize: "20px", fontWeight: "600" },
  btn: {
    padding: "9px 18px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontWeight: "600", fontSize: "15px", marginBottom: "4px" },
  meta: { fontSize: "13px", color: "#888" },
  skills: { display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "10px" },
  skill: {
    background: "#f0effc",
    color: "#5a52c0",
    fontSize: "11px",
    padding: "3px 9px",
    borderRadius: "999px",
  },
  actions: { display: "flex", gap: "8px", flexShrink: 0 },
  linkBtn: {
    fontSize: "13px",
    color: "#7F77DD",
    fontWeight: "500",
    padding: "5px 10px",
    borderRadius: "6px",
    background: "#f0effc",
  },
  closeBtn: {
    fontSize: "13px",
    color: "#c0392b",
    background: "#fdf0f0",
    border: "none",
    borderRadius: "6px",
    padding: "5px 10px",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default function MyJobs() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["myJobs"],
    queryFn: fetchMyJobs,
  });

  const closeMutation = useMutation({
    mutationFn: closeJob,
    onSuccess: () => {
      queryClient.invalidateQueries(["myJobs"]);
      toast.success("Job closed");
    },
  });

  const jobs = data?.jobs || [];

  return (
    <Layout>
      <div style={s.header}>
        <div style={s.h1}>My jobs ({jobs.length})</div>
        <Link to="/recruiter/jobs/new" style={s.btn}>
          + Post new job
        </Link>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : jobs.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "14px" }}>No jobs posted yet.</p>
      ) : (
        jobs.map((job) => (
          <div key={job._id} style={s.card}>
            <div style={s.row}>
              <div>
                <div style={s.title}>{job.title}</div>
                <div style={s.meta}>
                  {job.location} · {job.experienceYears}+ yrs ·{" "}
                  <StatusBadge status={job.status} />
                </div>
              </div>
              <div style={s.actions}>
                <Link
                  to={`/recruiter/jobs/${job._id}/applicants`}
                  style={s.linkBtn}
                >
                  View applicants
                </Link>
                {job.status === "open" && (
                  <button
                    style={s.closeBtn}
                    onClick={() => closeMutation.mutate(job._id)}
                  >
                    Close job
                  </button>
                )}
              </div>
            </div>
            {job.skillsRequired?.length > 0 && (
              <div style={s.skills}>
                {job.skillsRequired.map((sk) => (
                  <span key={sk} style={s.skill}>
                    {sk}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </Layout>
  );
}
