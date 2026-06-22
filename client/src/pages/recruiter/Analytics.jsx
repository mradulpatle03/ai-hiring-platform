import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchOverview } from "../../api/analytics";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import ApplicationsChart from "../../components/analytics/ApplicationsChart";
import ScoreDistChart from "../../components/analytics/ScoreDistChart";
import FunnelChart from "../../components/analytics/FunnelChart";
import TopSkillsChart from "../../components/analytics/TopSkillsChart";
import ScoreByJobChart from "../../components/analytics/ScoreByJobChart";
import RecentActivity from "../../components/analytics/RecentActivity";
import {
  Briefcase,
  Users,
  Star,
  Zap,
  TrendingUp,
  Activity,
  Target,
  BookOpen,
  Clock,
  BarChart2,
  GitBranch,
  PieChart,
} from "lucide-react";

const STATS = [
  {
    key: "totalJobs",
    label: "Total jobs",
    sub: "All time",
    icon: Briefcase,
    accentVar: "var(--wire)",
  },
  {
    key: "openJobs",
    label: "Open positions",
    sub: "Currently active",
    icon: Target,
    accentVar: "var(--success)",
  },
  {
    key: "totalApplications",
    label: "Applicants",
    sub: "Across all jobs",
    icon: Users,
    accentVar: "var(--wire)",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    sub: null,
    icon: Star,
    accentVar: "var(--volt)",
  },
  {
    key: "avgScore",
    label: "Avg AI score",
    sub: "Screened apps",
    icon: TrendingUp,
    accentVar: "var(--signal)",
  },
  {
    key: "screened",
    label: "AI screened",
    sub: "Fully processed",
    icon: Zap,
    accentVar: "var(--wire)",
  },
];

const TABS = [
  { id: "pipeline", label: "Pipeline", icon: Activity },
  { id: "funnel", label: "Funnel", icon: GitBranch },
  { id: "scoring", label: "Score dist", icon: BarChart2 },
  { id: "byjob", label: "Score by job", icon: PieChart },
  { id: "skills", label: "Skills", icon: BookOpen },
  { id: "activity", label: "Activity", icon: Clock },
];

function MetricCard({ label, value, sub, icon: Icon, accentVar }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line-light)",
        borderRadius: "var(--radius-md)",
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* bottom accent bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: "100%",
          height: "3px",
          background: accentVar,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: "600",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--graphite)",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: "28px",
            height: "28px",
            background: "var(--paper)",
            border: "1px solid var(--line-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={13} color="var(--graphite)" strokeWidth={2} />
        </div>
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "34px",
          fontWeight: "700",
          letterSpacing: "-0.03em",
          color: "var(--ink)",
          lineHeight: 1,
        }}
      >
        {value ?? (
          <span
            style={{
              color: "var(--graphite)",
              fontSize: "20px",
              fontWeight: "500",
            }}
          >
            —
          </span>
        )}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--graphite)",
            marginTop: "6px",
            letterSpacing: "0.04em",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [tab, setTab] = useState("pipeline");

  const { data } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchOverview,
    refetchInterval: 30000,
  });
  const stats = data?.stats;

  const getVal = (key) => {
    if (key === "avgScore")
      return stats?.avgScore != null ? `${stats.avgScore}` : null;
    return stats?.[key] ?? null;
  };

  const getSub = (key) => {
    if (key === "shortlisted" && stats?.conversionRate != null)
      return `${stats.conversionRate}% conversion rate`;
    return STATS.find((s) => s.key === key)?.sub ?? null;
  };

  return (
    <Layout>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "30px",
              fontWeight: "700",
              letterSpacing: "-0.02em",
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Analytics
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--graphite)",
              margin: "4px 0 0",
            }}
          >
            {user?.company} · Hiring insights
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--ink)",
            color: "var(--volt)",
            border: "1px solid var(--ink)",
            borderRadius: "var(--radius-sm)",
            padding: "7px 14px",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            fontWeight: "600",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          <Zap size={11} strokeWidth={2.5} />
          Live · 30s refresh
        </div>
      </div>

      {/* Stat grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1px",
          border: "1px solid var(--line-light)",
          background: "var(--line-light)",
          marginBottom: "28px",
        }}
      >
        {STATS.map(({ key, label, icon, accentVar }) => (
          <MetricCard
            key={key}
            label={label}
            value={getVal(key)}
            sub={getSub(key)}
            icon={icon}
            accentVar={accentVar}
          />
        ))}
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--line-light)",
          marginBottom: "0",
          background: "#fff",
          border: "1px solid var(--line-light)",
          borderBottom: "none",
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "12px 16px",
                background: active ? "var(--paper)" : "#fff",
                border: "none",
                borderRight: "1px solid var(--line-light)",
                borderBottom: active
                  ? "2px solid var(--signal)"
                  : "2px solid transparent",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: active ? "var(--ink)" : "var(--graphite)",
                cursor: "pointer",
              }}
            >
              <Icon size={12} strokeWidth={active ? 2.5 : 2} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab panel */}
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--line-light)",
          borderTop: "none",
          padding: "20px",
        }}
      >
        {tab === "pipeline" && <ApplicationsChart />}
        {tab === "funnel" && <FunnelChart />}
        {tab === "scoring" && <ScoreDistChart />}
        {tab === "byjob" && <ScoreByJobChart />}
        {tab === "skills" && <TopSkillsChart />}
        {tab === "activity" && <RecentActivity />}
      </div>
    </Layout>
  );
}
