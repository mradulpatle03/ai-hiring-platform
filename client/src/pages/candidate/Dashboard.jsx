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

const s = {
  greeting: { fontSize: "22px", fontWeight: "600", marginBottom: "4px" },
  sub: { color: "#888", fontSize: "14px", marginBottom: "2rem" },
  h2: { fontSize: "16px", fontWeight: "600", marginBottom: "1rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  appRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    marginBottom: "8px",
  },
  missing: {
    background: "#fdf0f0",
    color: "#c0392b",
    fontSize: "11px",
    padding: "3px 9px",
    borderRadius: "999px",
    marginRight: "4px",
    display: "inline-block",
    marginTop: "4px",
  },
};

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
      <div style={s.greeting}>Hello, {user?.name}</div>
      <div style={s.sub}>
        Track your applications and discover new opportunities.
      </div>

      {recommended.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div style={s.h2}>⚡ Recommended for you</div>
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={s.h2}>Recent applications</div>
        <Link
          to="/candidate/applied"
          style={{ fontSize: "13px", color: "#7F77DD" }}
        >
          View all →
        </Link>
      </div>

      {recentApps.length === 0 ? (
        <p style={{ color: "#aaa", fontSize: "14px" }}>
          No applications yet.{" "}
          <Link to="/candidate/jobs" style={{ color: "#7F77DD" }}>
            Browse jobs →
          </Link>
        </p>
      ) : (
        recentApps.map((app) => (
          <div key={app._id} style={s.appRow}>
            <div>
              <div style={{ fontWeight: "500", fontSize: "14px" }}>
                {app.job?.title}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {app.job?.company}
              </div>
              {app.aiMissingSkills?.length > 0 && (
                <div style={{ marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "#888" }}>
                    Missing:{" "}
                  </span>
                  {app.aiMissingSkills.slice(0, 3).map((s) => (
                    <span key={s} style={s.missing}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <ScoreBadge score={app.aiScore} />
              <div style={{ marginTop: "5px" }}>
                <StatusBadge status={app.status} />
              </div>
            </div>
          </div>
        ))
      )}
    </Layout>
  );
}
