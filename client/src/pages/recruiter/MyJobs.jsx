import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyJobs, closeJob } from "../../api/jobs";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import StatusBadge from "../../components/StatusBadge";
import toast from "react-hot-toast";
import { ListSkeleton } from "../../components/Skeleton";
import { color, font } from "../../styles/theme";

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
        <div>
          <div style={s.eyebrow}>// my jobs</div>
          <div style={s.h1}>My jobs ({jobs.length})</div>
        </div>
        <Link to="/recruiter/jobs/new" style={s.btn}>
          + Post new job
        </Link>
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : jobs.length === 0 ? (
        <p style={s.empty}>No jobs posted yet.</p>
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

const s = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "1.75rem",
  },
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
    fontSize: "24px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
  },
  btn: {
    padding: "10px 18px",
    background: color.ink,
    color: "#fff",
    border: "none",
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  card: {
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
    borderLeft: `3px solid ${color.paper3}`,
    padding: "1.25rem",
    marginBottom: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontFamily: font.display,
    fontWeight: 600,
    fontSize: "16px",
    marginBottom: "6px",
  },
  meta: {
    fontSize: "13px",
    color: color.graphite,
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  skills: { display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" },
  skill: {
    fontFamily: font.mono,
    fontSize: "10px",
    color: color.graphite,
    border: `1px solid ${color.lineLight}`,
    padding: "3px 9px",
  },
  actions: { display: "flex", gap: "8px", flexShrink: 0 },
  linkBtn: {
    fontFamily: font.mono,
    fontSize: "11px",
    color: color.ink,
    fontWeight: 700,
    padding: "7px 12px",
    border: `1px solid ${color.lineLightStrong}`,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  closeBtn: {
    fontFamily: font.mono,
    fontSize: "11px",
    color: color.signal,
    fontWeight: 700,
    background: "none",
    border: `1px solid ${color.signal}`,
    padding: "7px 12px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  empty: { color: color.graphiteDim, fontSize: "14px" },
};
