import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { fetchMyJobs } from "../../api/jobs";
import Layout from "../../components/Layout";
import { Link } from "react-router-dom";
import { Briefcase, Users, TrendingUp } from "lucide-react";
import { color, font } from "../../styles/theme";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["myJobs"], queryFn: fetchMyJobs });
  const jobs = data?.jobs || [];
  const openJobs = jobs.filter((j) => j.status === "open");

  return (
    <Layout>
      <div style={s.eyebrow}>// dashboard</div>
      <div style={s.greeting}>Welcome back, {user?.name}</div>
      <div style={s.sub}>{user?.company} · Recruiter control room</div>

      <div style={s.statStrip}>
        <div style={s.statCell}>
          <div style={s.statHead}>
            <Briefcase size={14} color={color.signal} />
            <span style={s.statLabel}>Total Jobs</span>
          </div>
          <div style={s.statNum}>{jobs.length}</div>
        </div>
        <div style={s.statCell}>
          <div style={s.statHead}>
            <TrendingUp size={14} color={color.signal} />
            <span style={s.statLabel}>Open Jobs</span>
          </div>
          <div style={s.statNum}>{openJobs.length}</div>
        </div>
        <div style={{ ...s.statCell, borderRight: "none" }}>
          <div style={s.statHead}>
            <Users size={14} color={color.signal} />
            <span style={s.statLabel}>Active Roles</span>
          </div>
          <div style={s.statNum}>{openJobs.length}</div>
        </div>
      </div>

      <div style={s.sectionHead}>
        <div style={s.h2}>Your open jobs</div>
        <Link to="/recruiter/jobs/new" style={s.btn}>
          + Post new job
        </Link>
      </div>

      {openJobs.length === 0 ? (
        <p style={s.empty}>No open jobs yet. Post your first one!</p>
      ) : (
        openJobs.map((job) => (
          <div key={job._id} style={s.jobRow}>
            <div>
              <div style={s.jobTitle}>{job.title}</div>
              <div style={s.jobMeta}>{job.location}</div>
            </div>
            <Link
              to={`/recruiter/jobs/${job._id}/applicants`}
              style={s.jobLink}
            >
              View applicants →
            </Link>
          </div>
        ))
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
    marginBottom: "8px",
  },
  greeting: {
    fontFamily: font.display,
    fontSize: "26px",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: "4px",
  },
  sub: { color: color.graphite, fontSize: "13px", marginBottom: "2rem" },

  statStrip: {
    display: "flex",
    border: `1px solid ${color.lineLight}`,
    background: "#fff",
    marginBottom: "2.5rem",
  },
  statCell: {
    flex: 1,
    padding: "18px 22px",
    borderRight: `1px solid ${color.lineLight}`,
  },
  statHead: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
  },
  statLabel: {
    fontFamily: font.mono,
    fontSize: "11px",
    color: color.graphite,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  statNum: {
    fontFamily: font.display,
    fontSize: "32px",
    fontWeight: 700,
    color: color.ink,
    letterSpacing: "-0.02em",
  },

  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  h2: {
    fontFamily: font.display,
    fontSize: "17px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 18px",
    background: color.ink,
    color: "#fff",
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  empty: { color: color.graphiteDim, fontSize: "13px" },

  jobRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
    borderLeft: `3px solid ${color.paper3}`,
    padding: "1rem 1.25rem",
    marginBottom: "8px",
  },
  jobTitle: { fontFamily: font.display, fontWeight: 600, fontSize: "14px" },
  jobMeta: {
    fontFamily: font.mono,
    fontSize: "11px",
    color: color.graphiteDim,
    marginTop: "3px",
  },
  jobLink: {
    fontFamily: font.mono,
    fontSize: "11px",
    color: color.signal,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
};
