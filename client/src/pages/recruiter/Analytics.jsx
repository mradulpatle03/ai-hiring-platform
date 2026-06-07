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
    color: "#7F77DD",
    bg: "#f0effe",
    gradient: "linear-gradient(135deg, #f0effe 0%, #e8e6f8 100%)",
  },
  {
    key: "openJobs",
    label: "Open positions",
    sub: "Currently active",
    icon: Target,
    color: "#1D9E75",
    bg: "#e1f5ee",
    gradient: "linear-gradient(135deg, #e1f5ee 0%, #d6f0e8 100%)",
  },
  {
    key: "totalApplications",
    label: "Applicants",
    sub: "Across all jobs",
    icon: Users,
    color: "#378ADD",
    bg: "#e6f1fb",
    gradient: "linear-gradient(135deg, #e6f1fb 0%, #deecf9 100%)",
  },
  {
    key: "shortlisted",
    label: "Shortlisted",
    sub: null,
    icon: Star,
    color: "#EF9F27",
    bg: "#faeeda",
    gradient: "linear-gradient(135deg, #faeeda 0%, #f9e7d2 100%)",
  },
  {
    key: "avgScore",
    label: "Avg AI score",
    sub: "Screened apps",
    icon: TrendingUp,
    color: "#D4537E",
    bg: "#fbeaf0",
    gradient: "linear-gradient(135deg, #fbeaf0 0%, #f9e3eb 100%)",
  },
  {
    key: "screened",
    label: "AI screened",
    sub: "Fully processed",
    icon: Zap,
    color: "#5a52c0",
    bg: "#eeedfe",
    gradient: "linear-gradient(135deg, #eeedfe 0%, #e7e5f9 100%)",
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

function MetricCard({ label, value, sub, icon: Icon, color, bg, gradient }) {
  return (
    <div
      style={{
        background: gradient,
        border: "1px solid rgba(127, 119, 221, 0.08)",
        boxShadow:
          "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)",
        borderRadius: 16,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "all 0.25s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0, 0, 0, 0.08), 0 8px 28px rgba(127, 119, 221, 0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "rgba(127, 119, 221, 0.18)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 2px 8px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(0, 0, 0, 0.02)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(127, 119, 221, 0.08)";
      }}
    >
      {/* Decorative corner accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          background: "rgba(255, 255, 255, 0.4)",
          borderRadius: "0 16px 0 16px",
          opacity: 0.6,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "#666",
            fontWeight: 600,
            letterSpacing: "0.3px",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Icon size={16} color={color} strokeWidth={2.2} />
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#1a1a1a",
            lineHeight: 1,
            letterSpacing: "-0.5px",
          }}
        >
          {value ?? (
            <span style={{ color: "#d0d0d0", fontSize: 20, fontWeight: 500 }}>
              —
            </span>
          )}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 10,
              color: "#777",
              marginTop: 6,
              fontWeight: 500,
            }}
          >
            {sub}
          </div>
        )}
      </div>
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
      <div
        style={{
          paddingBottom: "3rem",
          background: "linear-gradient(to bottom, #fafbff 0%, #f2f4f8 100%)",
          minHeight: "100vh",
          padding: "0 2rem 3rem 2rem",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            padding: "0 0 1rem 0",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#1a1a1a",
                margin: 0,
                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              Analytics
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#777",
                margin: "6px 0 0",
                fontWeight: 500,
              }}
            >
              {user?.company} · Hiring insights
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              background: "linear-gradient(135deg, #7F77DD 0%, #6A5FD9 100%)",
              border: "none",
              color: "#fff",
              boxShadow:
                "0 8px 28px rgba(127, 119, 221, 0.3), 0 4px 12px rgba(127, 119, 221, 0.15)",
              borderRadius: 999,
              padding: "7px 16px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.3px",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 10px 32px rgba(127, 119, 221, 0.35), 0 6px 16px rgba(127, 119, 221, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 8px 28px rgba(127, 119, 221, 0.3), 0 4px 12px rgba(127, 119, 221, 0.15)";
            }}
          >
            <Zap size={12} strokeWidth={2.2} />
            Live · refreshes every 30s
          </div>
        </div>

        {/* Stat grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: "2.5rem",
          }}
        >
          {STATS.map(({ key, label, icon, color, bg, gradient }) => (
            <MetricCard
              key={key}
              label={label}
              value={getVal(key)}
              sub={getSub(key)}
              icon={icon}
              color={color}
              bg={bg}
              gradient={gradient}
            />
          ))}
        </div>

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid #e8e8ed",
            marginBottom: "2rem",
            background: "#fff",
            borderRadius: "12px 12px 0 0",
            padding: "0 4px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
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
                  gap: 7,
                  padding: "12px 18px",
                  background: active
                    ? "linear-gradient(135deg, #fafbff 0%, #f2f4f8 100%)"
                    : "none",
                  border: "none",
                  borderBottom: active
                    ? "3px solid #7F77DD"
                    : "3px solid transparent",
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#7F77DD" : "#888",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginBottom: -1,
                  borderRadius: active ? "12px 12px 0 0" : "0",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#777";
                    e.currentTarget.style.background =
                      "rgba(127, 119, 221, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = "#888";
                    e.currentTarget.style.background = "none";
                  }
                }}
              >
                <Icon size={14} strokeWidth={active ? 2.2 : 2} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab panels */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "16px",
            boxShadow:
              "0 2px 12px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.02)",
            border: "1px solid #e8e8ed",
          }}
        >
          {tab === "pipeline" && <ApplicationsChart />}
          {tab === "funnel" && <FunnelChart />}
          {tab === "scoring" && <ScoreDistChart />}
          {tab === "byjob" && <ScoreByJobChart />}
          {tab === "skills" && <TopSkillsChart />}
          {tab === "activity" && <RecentActivity />}
        </div>
      </div>
    </Layout>
  );
}
