import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8f8f8",
    padding: "2rem",
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "16px",
    padding: "3rem 2.5rem",
    maxWidth: "460px",
    width: "100%",
    textAlign: "center",
  },
  code: {
    fontSize: "72px",
    fontWeight: "600",
    color: "#f0effc",
    lineHeight: 1,
    marginBottom: "0",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "10px",
    marginTop: "-8px",
  },
  sub: {
    fontSize: "14px",
    color: "#888",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPri: {
    padding: "10px 22px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline-block",
  },
  btnSec: {
    padding: "10px 22px",
    background: "#f5f5f5",
    color: "#555",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  crumbs: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #f5f5f5",
  },
  crumb: {
    fontSize: "12px",
    color: "#7F77DD",
    textDecoration: "none",
    padding: "4px 10px",
    background: "#f0effc",
    borderRadius: "999px",
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
