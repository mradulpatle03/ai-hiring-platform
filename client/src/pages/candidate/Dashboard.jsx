import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import {
  fetchMyApplications,
  fetchRecommendedJobs,
} from "../../api/applications";
import Layout from "../../components/Layout";
import ScoreBadge from "../../components/ScoreBadge";
import StatusBadge from "../../components/StatusBadge";
import JobCard from "../../components/JobCard";
import { Link, useNavigate } from "react-router-dom";
import { color, font } from "../../styles/theme";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: appData } = useQuery({
    queryKey: ["myApps"],
    queryFn: fetchMyApplications,
  });
  const { data: recData } = useQuery({
    queryKey: ["recommended"],
    queryFn: fetchRecommendedJobs,
  });

  const applications = appData?.applications || [];
  const recommended = recData?.jobs || [];
  const recentApps = applications.slice(0, 3);

  return (
    <Layout>
      <div style={s.eyebrow}>// dashboard</div>
      <div style={s.greeting}>Hello, {user?.name}</div>
      <div style={s.sub}>
        Track your applications and discover new opportunities.
      </div>

      {recommended.length > 0 && (
        <div style={{ marginBottom: "2.25rem" }}>
          <div style={s.sectionHead}>
            <span style={s.bolt}>⚡</span>
            <div style={s.h2}>Recommended for you</div>
          </div>
          <div style={s.grid}>
            {recommended.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onClick={() => navigate(`/candidate/jobs/${job._id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <div style={s.rowHead}>
        <div style={s.h2}>Recent applications</div>
        <Link to="/candidate/applied" style={s.viewAll}>
          View all →
        </Link>
      </div>

      {recentApps.length === 0 ? (
        <p style={s.empty}>
          No applications yet.{" "}
          <Link to="/candidate/jobs" style={s.emptyLink}>
            Browse jobs →
          </Link>
        </p>
      ) : (
        recentApps.map((app) => (
          <div key={app._id} style={s.appRow}>
            <div>
              <div style={s.appTitle}>{app.job?.title}</div>
              <div style={s.appCo}>{app.job?.company}</div>
              {app.aiMissingSkills?.length > 0 && (
                <div style={{ marginTop: "6px" }}>
                  <span style={s.missingLabel}>Missing: </span>
                  {app.aiMissingSkills.slice(0, 3).map((sk) => (
                    <span key={sk} style={s.missing}>
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <ScoreBadge score={app.aiScore} />
              <div style={{ marginTop: "7px" }}>
                <StatusBadge status={app.status} />
              </div>
            </div>
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

  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1rem",
  },
  bolt: { fontSize: "14px" },
  h2: {
    fontFamily: font.display,
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
    gap: "1rem",
  },

  rowHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  viewAll: {
    fontFamily: font.mono,
    fontSize: "11px",
    color: color.signal,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },

  appRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
    borderLeft: `3px solid ${color.paper3}`,
    padding: "1rem 1.25rem",
    marginBottom: "8px",
  },
  appTitle: { fontWeight: "600", fontSize: "14px" },
  appCo: { fontSize: "12px", color: color.graphiteDim },
  missingLabel: {
    fontFamily: font.mono,
    fontSize: "10px",
    color: color.graphiteDim,
    textTransform: "uppercase",
  },
  missing: {
    fontFamily: font.mono,
    fontSize: "10px",
    color: color.signal,
    border: `1px solid ${color.signal}`,
    padding: "2px 7px",
    marginRight: "4px",
    display: "inline-block",
    marginTop: "2px",
  },

  empty: { color: color.graphiteDim, fontSize: "14px" },
  emptyLink: { color: color.signal, fontWeight: 600 },
};
