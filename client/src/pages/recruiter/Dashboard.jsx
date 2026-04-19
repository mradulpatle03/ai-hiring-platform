import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { fetchMyJobs } from "../../api/jobs";
import { fetchJobApplicants } from "../../api/applications";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { Briefcase, Users, TrendingUp } from "lucide-react";

const s = {
  greeting: { fontSize: "22px", fontWeight: "600", marginBottom: "4px" },
  sub: { color: "#888", fontSize: "14px", marginBottom: "2rem" },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  stat: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.25rem",
  },
  statNum: { fontSize: "28px", fontWeight: "600", color: "#7F77DD" },
  statLbl: { fontSize: "13px", color: "#888", marginTop: "2px" },
  section: { marginBottom: "2rem" },
  h2: { fontSize: "16px", fontWeight: "600", marginBottom: "1rem" },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 18px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },
  jobRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    marginBottom: "8px",
  },
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["myJobs"], queryFn: fetchMyJobs });
  const jobs = data?.jobs || [];
  const openJobs = jobs.filter((j) => j.status === "open");

  return (
    <Layout>
      <div style={s.greeting}>Welcome back, {user?.name}</div>
      <div style={s.sub}>{user?.company} · Recruiter Dashboard</div>

      <div style={s.grid3}>
        <div style={s.stat}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Briefcase size={16} color="#7F77DD" />
            <span style={{ fontSize: "13px", color: "#888" }}>Total Jobs</span>
          </div>
          <div style={s.statNum}>{jobs.length}</div>
        </div>
        <div style={s.stat}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <TrendingUp size={16} color="#7F77DD" />
            <span style={{ fontSize: "13px", color: "#888" }}>Open Jobs</span>
          </div>
          <div style={s.statNum}>{openJobs.length}</div>
        </div>
        <div style={s.stat}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Users size={16} color="#7F77DD" />
            <span style={{ fontSize: "13px", color: "#888" }}>
              Active Roles
            </span>
          </div>
          <div style={s.statNum}>{openJobs.length}</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={s.h2}>Your open jobs</div>
        <Link to="/recruiter/jobs/new" style={s.btn}>
          + Post new job
        </Link>
      </div>

      {openJobs.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "14px" }}>
          No open jobs yet. Post your first one!
        </p>
      ) : (
        openJobs.map((job) => (
          <div key={job._id} style={s.jobRow}>
            <div>
              <div style={{ fontWeight: "500" }}>{job.title}</div>
              <div style={{ fontSize: "13px", color: "#888" }}>
                {job.location}
              </div>
            </div>
            <Link
              to={`/recruiter/jobs/${job._id}/applicants`}
              style={{ fontSize: "13px", color: "#7F77DD", fontWeight: "500" }}
            >
              View applicants →
            </Link>
          </div>
        ))
      )}
    </Layout>
  );
}
