import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Briefcase,
  User,
  LayoutDashboard,
  Star,
  MessageSquare,
  BarChart2,
} from "lucide-react";

const s = {
  shell: { display: "flex", flexDirection: "column", minHeight: "100vh" },
  nav: {
    background: "#fff",
    borderBottom: "1px solid #eee",
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontWeight: "600",
    fontSize: "16px",
    color: "#7F77DD",
    letterSpacing: "-0.3px",
  },
  links: { display: "flex", gap: "4px", alignItems: "center" },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#555",
    transition: "all 0.15s",
    fontWeight: "400",
  },
  active: { background: "#f0effc", color: "#7F77DD", fontWeight: "500" },
  logout: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#e74c3c",
    border: "none",
    background: "none",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: "2rem",
    maxWidth: "1100px",
    margin: "0 auto",
    width: "100%",
  },
  user: { fontSize: "13px", color: "#888", marginRight: "8px" },
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => ({
    ...s.link,
    ...(location.pathname.startsWith(path) ? s.active : {}),
  });

  const recruiterLinks = [
    {
      to: "/recruiter",
      icon: <LayoutDashboard size={14} />,
      label: "Dashboard",
    },
    { to: "/recruiter/jobs", icon: <Briefcase size={14} />, label: "My Jobs" },
    {
      to: "/recruiter/messages",
      icon: <MessageSquare size={14} />,
      label: "Messages",
    },
    {
      to: "/recruiter/analytics",
      icon: <BarChart2 size={14} />,
      label: "Analytics",
    },
  ];
  const candidateLinks = [
    {
      to: "/candidate",
      icon: <LayoutDashboard size={14} />,
      label: "Dashboard",
    },
    {
      to: "/candidate/jobs",
      icon: <Briefcase size={14} />,
      label: "Browse Jobs",
    },
    {
      to: "/candidate/applied",
      icon: <Star size={14} />,
      label: "My Applications",
    },
    {
      to: "/candidate/messages",
      icon: <MessageSquare size={14} />,
      label: "Messages",
    },
  ];

  const links = user?.role === "recruiter" ? recruiterLinks : candidateLinks;

  return (
    <div style={s.shell}>
      <nav style={s.nav}>
        <span style={s.brand}>HireAI</span>
        <div style={s.links}>
          {links.map((l) => (
            <Link key={l.to} to={l.to} style={isActive(l.to)}>
              {l.icon} {l.label}
            </Link>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={s.user}>{user?.name}</span>
          <button
            style={s.logout}
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </nav>
      <main style={s.main}>{children}</main>
    </div>
  );
}
