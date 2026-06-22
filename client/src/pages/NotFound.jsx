import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--paper)",
    padding: "2rem",
    fontFamily: "var(--font-body)",
  },
  card: {
    background: "#fff",
    border: "1px solid var(--line-light)",
    borderRadius: "var(--radius-md)",
    padding: "3rem 2.5rem",
    maxWidth: "460px",
    width: "100%",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "var(--signal)",
  },
  code: {
    fontFamily: "var(--font-display)",
    fontSize: "80px",
    fontWeight: "700",
    color: "var(--paper-3)",
    lineHeight: 1,
    letterSpacing: "-0.04em",
    marginBottom: "0",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    marginBottom: "6px",
    display: "block",
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--ink)",
    marginBottom: "10px",
    marginTop: "4px",
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "13px",
    color: "var(--graphite)",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPri: {
    padding: "9px 20px",
    background: "var(--ink)",
    color: "#fff",
    border: "1px solid var(--ink)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  btnSec: {
    padding: "9px 20px",
    background: "#fff",
    color: "var(--ink)",
    border: "1px solid var(--line-light-strong)",
    borderRadius: "var(--radius-sm)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
  },
  crumbs: {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid var(--line-light)",
  },
  crumb: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--graphite)",
    textDecoration: "none",
    padding: "5px 10px",
    border: "1px solid var(--line-light)",
    background: "var(--paper)",
    borderRadius: "var(--radius-sm)",
  },
};

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const homeLink =
    user?.role === "recruiter"
      ? "/recruiter"
      : user?.role === "candidate"
        ? "/candidate"
        : "/login";

  const quickLinks =
    user?.role === "recruiter"
      ? [
          { to: "/recruiter", label: "Dashboard" },
          { to: "/recruiter/jobs", label: "My jobs" },
          { to: "/recruiter/search", label: "Search" },
          { to: "/recruiter/analytics", label: "Analytics" },
        ]
      : user?.role === "candidate"
        ? [
            { to: "/candidate", label: "Dashboard" },
            { to: "/candidate/jobs", label: "Browse jobs" },
            { to: "/candidate/applied", label: "Applications" },
            { to: "/candidate/profile", label: "Profile" },
          ]
        : [
            { to: "/login", label: "Sign in" },
            { to: "/register", label: "Register" },
          ];

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardAccent} />
        <span style={s.label}>Error</span>
        <div style={s.code}>404</div>
        <div style={s.title}>Page not found</div>
        <div style={s.sub}>
          The page you're looking for doesn't exist or has been moved.
          {user && " Head back to your dashboard."}
        </div>

        <div style={s.btnRow}>
          <Link to={homeLink} style={s.btnPri}>
            {user ? "Go to dashboard" : "Go to login"}
          </Link>
          <button style={s.btnSec} onClick={() => navigate(-1)}>
            Go back
          </button>
        </div>

        {quickLinks.length > 0 && (
          <div style={s.crumbs}>
            {quickLinks.map((l) => (
              <Link key={l.to} to={l.to} style={s.crumb}>
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}