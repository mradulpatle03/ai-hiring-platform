import { Link } from "react-router-dom";
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
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
  },
  icon: { fontSize: "48px", marginBottom: "1rem" },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  sub: {
    fontSize: "14px",
    color: "#888",
    lineHeight: 1.7,
    marginBottom: "2rem",
  },
  btn: {
    display: "inline-block",
    padding: "10px 22px",
    background: "#7F77DD",
    color: "#fff",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    textDecoration: "none",
  },
  role: {
    display: "inline-block",
    padding: "3px 10px",
    background: "#f0effc",
    color: "#5a52c0",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "500",
    marginBottom: "1rem",
  },
};

export default function Unauthorized() {
  const { user } = useAuth();
  const homeLink = user?.role === "recruiter" ? "/recruiter" : "/candidate";

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>🔒</div>
        {user?.role && <div style={s.role}>{user.role}</div>}
        <div style={s.title}>Access denied</div>
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
