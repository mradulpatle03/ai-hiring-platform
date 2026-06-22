import { Link } from "react-router-dom";
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
    maxWidth: "420px",
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
  iconWrap: {
    width: "48px",
    height: "48px",
    background: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.25rem",
  },
  iconSvg: {
    width: "20px",
    height: "20px",
    fill: "none",
    stroke: "var(--volt)",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
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
    letterSpacing: "-0.02em",
  },
  sub: {
    fontSize: "13px",
    color: "var(--graphite)",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  role: {
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "inline-block",
    padding: "4px 10px",
    background: "var(--ink)",
    color: "var(--volt)",
    marginBottom: "1rem",
  },
  btn: {
    display: "inline-block",
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
    textDecoration: "none",
  },
};

export default function Unauthorized() {
  const { user } = useAuth();
  const homeLink = user?.role === "recruiter" ? "/recruiter" : "/candidate";

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.cardAccent} />
        <div style={s.iconWrap}>
          <svg style={s.iconSvg} viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="1" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        {user?.role && <div style={s.role}>{user.role}</div>}
        <span style={s.label}>403 · Access denied</span>
        <div style={s.title}>You can't go there</div>
        <div style={s.sub}>
          You don't have permission to view this page.
          {user
            ? ` This area is restricted to a different role.`
            : ` Please sign in to continue.`}
        </div>
        <Link to={user ? homeLink : "/login"} style={s.btn}>
          {user ? "Back to dashboard" : "Sign in"}
        </Link>
      </div>
    </div>
  );
}