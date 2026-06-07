import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Briefcase,
  User,
  LayoutDashboard,
  Star,
  MessageSquare,
  UserCircle,
  BarChart2,
  CalendarCheck,
  Search,
  Menu,
  X,
} from "lucide-react";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const recruiterLinks = [
    { to: "/recruiter",            icon: <LayoutDashboard size={15} />, label: "Dashboard"  },
    { to: "/recruiter/jobs",       icon: <Briefcase size={15} />,       label: "My Jobs"    },
    { to: "/recruiter/search",     icon: <Search size={15} />,          label: "Search"     },
    { to: "/recruiter/interviews", icon: <CalendarCheck size={15} />,   label: "Interviews" },
    { to: "/recruiter/messages",   icon: <MessageSquare size={15} />,   label: "Messages"   },
    { to: "/recruiter/analytics",  icon: <BarChart2 size={15} />,       label: "Analytics"  },
  ];

  const candidateLinks = [
    { to: "/candidate",             icon: <LayoutDashboard size={15} />, label: "Dashboard"       },
    { to: "/candidate/jobs",        icon: <Briefcase size={15} />,       label: "Browse Jobs"     },
    { to: "/candidate/applied",     icon: <Star size={15} />,            label: "My Applications" },
    { to: "/candidate/interviews",  icon: <CalendarCheck size={15} />,   label: "Interviews"      },
    { to: "/candidate/messages",    icon: <MessageSquare size={15} />,   label: "Messages"        },
    { to: "/candidate/profile",     icon: <UserCircle size={15} />,      label: "Profile"         },
  ];

  const links = user?.role === "recruiter" ? recruiterLinks : candidateLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div style={styles.shell}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .hf-nav-link {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border-radius: 8px;
          font-size: 13.5px;
          color: #666;
          font-weight: 400;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .hf-nav-link:hover { background: #f5f4fd; color: #534AB7; }
        .hf-nav-link.active { background: #f0effc; color: #7F77DD; font-weight: 500; }

        .hf-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 8px;
          font-size: 13.5px;
          color: #e74c3c;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .hf-logout-btn:hover { background: #fff0f0; }

        .hf-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #555;
          padding: 6px;
          border-radius: 8px;
          align-items: center;
          justify-content: center;
        }
        .hf-hamburger:hover { background: #f5f4fd; }

        .hf-mobile-drawer {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
        }
        .hf-drawer-overlay {
          position: absolute;
          inset: 0;
          background: rgba(30,20,80,0.18);
        }
        .hf-drawer-panel {
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 260px;
          background: #fff;
          display: flex;
          flex-direction: column;
          padding: 0;
          box-shadow: 4px 0 24px rgba(83,74,183,0.12);
        }
        .hf-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f0f0f0;
        }
        .hf-drawer-links {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .hf-drawer-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 9px;
          font-size: 14px;
          color: #555;
          text-decoration: none;
          font-weight: 400;
          transition: background 0.15s, color 0.15s;
        }
        .hf-drawer-link:hover { background: #f5f4fd; color: #534AB7; }
        .hf-drawer-link.active { background: #f0effc; color: #7F77DD; font-weight: 500; }
        .hf-drawer-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid #f0f0f0;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .hf-nav-links-desktop { display: none !important; }
          .hf-hamburger { display: flex !important; }
        }
        @media (max-width: 1100px) {
          .hf-mobile-drawer.open { display: block; }
        }
        @media (max-width: 480px) {
          .hf-user-name { display: none; }
          .hf-main { padding: 1.25rem 1rem !important; }
        }
        @media (max-width: 360px) {
          .hf-main { padding: 1rem 0.75rem !important; }
          .hf-nav { padding: 0 0.75rem !important; }
        }
      `}</style>

      {/* Top nav */}
      <nav style={styles.nav} className="hf-nav">

        {/* Brand */}
        <div style={styles.brandWrap}>
          <div style={styles.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <span style={styles.brand}>HireFlow</span>
        </div>

        {/* Desktop nav links */}
        <div style={styles.linksDesktop} className="hf-nav-links-desktop">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`hf-nav-link${isActive(l.to) ? " active" : ""}`}
            >
              {l.icon} {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={styles.navRight}>
          {/* Avatar + name */}
          <div style={styles.userPill}>
            <div style={styles.avatar}>{initials}</div>
            <span style={styles.userName} className="hf-user-name">{user?.name}</span>
          </div>

          {/* Desktop logout */}
          <button className="hf-logout-btn" style={{ display: "flex" }} onClick={handleLogout}>
            <LogOut size={15} /> Logout
          </button>

          {/* Hamburger */}
          <button
            className="hf-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`hf-mobile-drawer${mobileOpen ? " open" : ""}`}>
        <div className="hf-drawer-overlay" onClick={() => setMobileOpen(false)} />
        <div className="hf-drawer-panel">
          <div className="hf-drawer-header">
            <div style={styles.brandWrap}>
              <div style={styles.brandIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <span style={styles.brand}>HireFlow</span>
            </div>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 4, borderRadius: 6 }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* User info in drawer */}
          <div style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #f5f5f5" }}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: "#999", textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>

          <div className="hf-drawer-links">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`hf-drawer-link${isActive(l.to) ? " active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>

          <div className="hf-drawer-footer">
            <button
              className="hf-logout-btn"
              style={{ width: "100%", justifyContent: "center", padding: "10px" }}
              onClick={() => { setMobileOpen(false); handleLogout(); }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main style={styles.main} className="hf-main">
        {children}
      </main>
    </div>
  );
}

const styles = {
  shell: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "#f7f6fb",
  },
  nav: {
    background: "#fff",
    borderBottom: "1px solid #eeecf9",
    padding: "0 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "62px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    gap: "1rem",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    flexShrink: 0,
  },
  brandIcon: {
    width: "30px",
    height: "30px",
    background: "#7F77DD",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brand: {
    fontWeight: 700,
    fontSize: "15px",
    color: "#534AB7",
    letterSpacing: "-0.4px",
  },
  linksDesktop: {
    display: "flex",
    gap: "2px",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    flexWrap: "nowrap",
    overflow: "hidden",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 10px 4px 4px",
    borderRadius: "999px",
    background: "#f5f4fd",
    border: "0.5px solid rgba(127,119,221,0.15)",
    marginRight: "4px",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#7F77DD",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: "0.02em",
  },
  userName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#534AB7",
    maxWidth: "120px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  main: {
    flex: 1,
    padding: "2rem",
    maxWidth: "1140px",
    margin: "0 auto",
    width: "100%",
  },
};