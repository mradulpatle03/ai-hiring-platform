import { useQuery } from "@tanstack/react-query";
import { fetchOverview } from "../../api/analytics";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import StatCard from "../../components/analytics/StatCard";
import ApplicationsChart from "../../components/analytics/ApplicationsChart";
import ScoreDistChart from "../../components/analytics/ScoreDistChart";
import FunnelChart from "../../components/analytics/FunnelChart";
import TopSkillsChart from "../../components/analytics/TopSkillsChart";
import ScoreByJobChart from "../../components/analytics/ScoreByJobChart";
import RecentActivity from "../../components/analytics/RecentActivity";

const s = {
  header: { marginBottom: "1.75rem" },
  h1: { fontSize: "20px", fontWeight: "600", marginBottom: "3px" },
  sub: { fontSize: "13px", color: "#888" },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))",
    gap: "12px",
    marginBottom: "1.25rem",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.25rem",
    marginBottom: "1.25rem",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1.25rem",
    marginBottom: "1.25rem",
  },
  grid21: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "1.25rem",
    marginBottom: "1.25rem",
  },
};

export default function Analytics() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchOverview,
    refetchInterval: 30000,
  });
  const stats = data?.stats;

  return (
    <Layout>
      <div style={s.header}>
        <div style={s.h1}>Analytics</div>
        <div style={s.sub}>{user?.company} · Hiring insights dashboard</div>
      </div>

      {/* Row 1 — stat cards */}
      <div style={s.grid4}>
        <StatCard
          label="Total jobs"
          value={stats?.totalJobs}
          icon=""
          sub="All time"
        />
        <StatCard
          label="Open jobs"
          value={stats?.openJobs}
          icon=""
          sub="Currently active"
        />
        <StatCard
          label="Total applicants"
          value={stats?.totalApplications}
          icon=""
          sub="Across all jobs"
        />
        <StatCard
          label="Shortlisted"
          value={stats?.shortlisted}
          icon=""
          sub={`${stats?.conversionRate ?? "—"}% conversion`}
        />
        <StatCard
          label="Avg AI score"
          value={stats?.avgScore != null ? `${stats.avgScore}/100` : null}
          icon=""
          sub="Across screened apps"
        />
        <StatCard
          label="AI screened"
          value={stats?.screened}
          icon=""
          sub="Fully processed"
        />
      </div>

      {/* Row 2 — applications over time (wide) + funnel */}
      <div style={s.grid21}>
        <ApplicationsChart />
        <FunnelChart />
      </div>

      {/* Row 3 — score distribution + score by job */}
      <div style={s.grid2}>
        <ScoreDistChart />
        <ScoreByJobChart />
      </div>

      {/* Row 4 — top missing skills + recent activity */}
      <div style={s.grid2}>
        <TopSkillsChart />
        <RecentActivity />
      </div>
    </Layout>
  );
}
