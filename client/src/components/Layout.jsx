import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LogOut,
  Briefcase,
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
import { color, font } from "../styles/theme";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

  const recruiterLinks = [
    {
      to: "/recruiter",
      icon: <LayoutDashboard size={15} />,
      label: "Dashboard",
    },
    { to: "/recruiter/jobs", icon: <Briefcase size={15} />, label: "My Jobs" },
    { to: "/recruiter/search", icon: <Search size={15} />, label: "Search" },
    {
      to: "/recruiter/interviews",
      icon: <CalendarCheck size={15} />,
      label: "Interviews",
    },
    {
      to: "/recruiter/messages",
      icon: <MessageSquare size={15} />,
      label: "Messages",
    },
    {
      to: "/recruiter/analytics",
      icon: <BarChart2 size={15} />,
      label: "Analytics",
    },
  ];

  const candidateLinks = [
    {
      to: "/candidate",
      icon: <LayoutDashboard size={15} />,
      label: "Dashboard",
    },
    {
      to: "/candidate/jobs",
      icon: <Briefcase size={15} />,
      label: "Browse Jobs",
    },
    {
      to: "/candidate/applied",
      icon: <Star size={15} />,
      label: "My Applications",
    },
    {
      to: "/candidate/interviews",
      icon: <CalendarCheck size={15} />,
      label: "Interviews",
    },
    {
      to: "/candidate/messages",
      icon: <MessageSquare size={15} />,
      label: "Messages",
    },
    {
      to: "/candidate/profile",
      icon: <UserCircle size={15} />,
      label: "Profile",
    },
  ];

  const links = user?.role === "recruiter" ? recruiterLinks : candidateLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div style={styles.shell}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .hf-nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          transition: color 0.15s;
          white-space: nowrap;
          position: relative;
        }
        .hf-nav-link:hover { color: rgba(255,255,255,0.85); }
        .hf-nav-link.active { color: #fff; }
        .hf-nav-link.active::after {
          content: '';
          position: absolute;
          left: 13px; right: 13px; bottom: -1px;
          height: 2px;
          background: ${color.signal};
        }

        .hf-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 600;
          font-family: ${font.mono};
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.12);
          background: none;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .hf-logout-btn:hover { border-color: ${color.signal}; color: #fff; }

        .hf-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          padding: 6px;
          align-items: center;
          justify-content: center;
        }
        .hf-hamburger:hover { color: #fff; }

        .hf-mobile-drawer { display: none; position: fixed; inset: 0; z-index: 200; }
        .hf-drawer-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); }
        .hf-drawer-panel {
          position: absolute; top: 0; left: 0; bottom: 0; width: 270px;
          background: ${color.ink};
          color: #fff;
          display: flex; flex-direction: column; padding: 0;
          border-right: 1px solid ${color.line};
        }
        .hf-drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.25rem; border-bottom: 1px solid ${color.line};
        }
        .hf-drawer-links {
          flex: 1; overflow-y: auto; padding: 0.75rem;
          display: flex; flex-direction: column; gap: 2px;
        }
        .hf-drawer-link {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 12px; font-size: 14px; font-weight: 500;
          color: rgba(255,255,255,0.6); text-decoration: none;
          border-left: 2px solid transparent;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .hf-drawer-link:hover { background: ${color.ink2}; color: #fff; }
        .hf-drawer-link.active { background: ${color.ink2}; color: #fff; border-left-color: ${color.signal}; }
        .hf-drawer-footer { padding: 1rem 1.25rem; border-top: 1px solid ${color.line}; }

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

      {/* Top nav — dark control room bar */}
      <nav style={styles.nav} className="hf-nav">
        <div style={styles.brandWrap}>
          <div style={styles.brandIcon}>
            <span style={styles.brandIconText}>HF</span>
          </div>
          <span style={styles.brand}>HireFlow</span>
        </div>

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

        <div style={styles.navRight}>
          <div style={styles.userPill}>
            <div style={styles.avatar}>{initials}</div>
            <span style={styles.userName} className="hf-user-name">
              {user?.name}
            </span>
          </div>

          <button
            className="hf-logout-btn"
            style={{ display: "flex" }}
            onClick={handleLogout}
          >
            <LogOut size={13} /> Logout
          </button>

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
        <div
          className="hf-drawer-overlay"
          onClick={() => setMobileOpen(false)}
        />
        <div className="hf-drawer-panel">
          <div className="hf-drawer-header">
            <div style={styles.brandWrap}>
              <div style={styles.brandIcon}>
                <span style={styles.brandIconText}>HF</span>
              </div>
              <span style={styles.brand}>HireFlow</span>
            </div>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.5)",
                padding: 4,
              }}
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div
            style={{
              padding: "0.875rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: `1px solid ${color.line}`,
            }}
          >
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: font.mono,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginTop: 2,
                }}
              >
                {user?.role}
              </div>
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
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "10px",
              }}
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
            >
              <LogOut size={14} /> Logout
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
    background: color.paper,
  },
  nav: {
    background: color.ink,
    borderBottom: `1px solid ${color.line}`,
    padding: "0 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "60px",
    position: "sticky",
    top: 0,
    zIndex: 100,
    gap: "1rem",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  brandIcon: {
    width: "28px",
    height: "28px",
    background: color.signal,
    clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandIconText: {
    fontFamily: font.mono,
    fontWeight: 700,
    fontSize: 12,
    color: color.ink,
  },
  brand: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "17px",
    color: "#fff",
    letterSpacing: "-0.02em",
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
    gap: "8px",
    flexShrink: 0,
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingRight: "4px",
  },
  avatar: {
    width: "28px",
    height: "28px",
    background: color.ink3,
    border: `1px solid ${color.line}`,
    color: color.volt,
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userName: {
    fontSize: "12px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.65)",
    maxWidth: "120px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  main: {
    flex: 1,
    padding: "2rem",
    maxWidth: "1180px",
    margin: "0 auto",
    width: "100%",
  },
};
