import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Layout from "../../components/Layout";
import GitHubCard from "../../components/github/GitHubCard";
import toast from "react-hot-toast";
import { User, Mail, Building } from "lucide-react";

const s = {
  pageHead: {
    marginBottom: "28px",
  },
  h1: {
    fontFamily: "var(--font-display)",
    fontSize: "30px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "var(--ink)",
  },
  sub: {
    fontSize: "13px",
    color: "var(--graphite)",
    marginTop: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "20px",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    border: "1px solid var(--line-light)",
    borderRadius: "var(--radius-md)",
    padding: "22px",
  },
  sectionLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    marginBottom: "14px",
    display: "block",
  },
  avatarWrap: {
    width: "52px",
    height: "52px",
    background: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },
  avatarText: {
    fontFamily: "var(--font-display)",
    fontSize: "18px",
    fontWeight: "700",
    color: "var(--volt)",
    letterSpacing: "-0.02em",
  },
  name: {
    fontFamily: "var(--font-display)",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "var(--ink)",
    marginBottom: "3px",
  },
  rolePill: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    marginBottom: "20px",
    display: "block",
  },
  boostBox: {
    background: "var(--paper)",
    border: "1px solid var(--line-light)",
    borderLeft: "3px solid var(--volt)",
    borderRadius: "var(--radius-sm)",
    padding: "12px 14px",
    marginBottom: "22px",
  },
  boostTxt: {
    fontSize: "12px",
    color: "var(--ink)",
    lineHeight: 1.6,
    fontFamily: "var(--font-body)",
  },
  boostStrong: {
    fontFamily: "var(--font-mono)",
    fontWeight: "700",
    fontSize: "10px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--ink)",
    marginRight: "6px",
  },
  divider: {
    height: "1px",
    background: "var(--line-light)",
    margin: "0 0 18px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 0",
    borderBottom: "1px solid var(--line-light)",
  },
  rowLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    width: "72px",
    flexShrink: 0,
  },
  rowValue: {
    fontSize: "13px",
    color: "var(--ink)",
    fontWeight: "500",
  },
  ghLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    marginBottom: "10px",
    display: "block",
  },
};

export default function CandidateProfile() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const status = params.get("github");
    if (status === "connected") {
      toast.success(
        "GitHub connected! Your next applications will include GitHub data.",
      );
      setParams({});
    } else if (status === "error") {
      toast.error("GitHub connection failed. Please try again.");
      setParams({});
    }
  }, [params, setParams]);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Layout>
      <div style={s.pageHead}>
        <div style={s.h1}>My Profile</div>
        <div style={s.sub}>Manage your profile and connected accounts</div>
      </div>

      <div style={s.grid}>
        {/* Left — profile info */}
        <div style={s.card}>
          <div style={s.avatarWrap}>
            <span style={s.avatarText}>{initials}</span>
          </div>
          <div style={s.name}>{user?.name}</div>
          <span style={s.rolePill}>Job Seeker · HireAI</span>

          <div style={s.boostBox}>
            <div style={s.boostTxt}>
              <span style={s.boostStrong}>Tip</span>
              Connecting your GitHub can boost your AI match score by up to 30
              points. Recruiters love seeing real code activity.
            </div>
          </div>

          <div style={s.divider} />
          <span style={s.sectionLabel}>Account details</span>

          {[
            {
              icon: <User size={13} color="var(--graphite)" />,
              label: "Name",
              value: user?.name,
            },
            {
              icon: <Mail size={13} color="var(--graphite)" />,
              label: "Email",
              value: user?.email,
            },
            {
              icon: <Building size={13} color="var(--graphite)" />,
              label: "Role",
              value: "Candidate",
            },
          ].map(({ icon, label, value }) => (
            <div key={label} style={s.row}>
              {icon}
              <span style={s.rowLabel}>{label}</span>
              <span style={s.rowValue}>{value}</span>
            </div>
          ))}
        </div>

        {/* Right — GitHub card */}
        <div>
          <span style={s.ghLabel}>GitHub Integration</span>
          <GitHubCard />
        </div>
      </div>
    </Layout>
  );
}