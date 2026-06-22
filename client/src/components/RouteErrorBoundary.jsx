import { Component } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const s = {
  wrap: {
    padding: "3rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--paper)",
    minHeight: "60vh",
    fontFamily: "var(--font-body)",
  },
  card: {
    background: "#fff",
    border: "1px solid var(--line-light)",
    borderRadius: "var(--radius-md)",
    padding: "2rem",
    maxWidth: "400px",
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
    background: "var(--warning)",
  },
  iconWrap: {
    width: "44px",
    height: "44px",
    background: "var(--ink)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  iconSvg: {
    width: "18px",
    height: "18px",
    fill: "none",
    stroke: "#B07A0E",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  eyebrow: {
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
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "var(--ink)",
    marginBottom: "8px",
  },
  sub: {
    fontSize: "13px",
    color: "var(--graphite)",
    marginBottom: "1.5rem",
    lineHeight: 1.6,
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

class RouteErrorBoundaryInner extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Route error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const homeLink =
      this.props.role === "recruiter"
        ? "/recruiter"
        : this.props.role === "candidate"
          ? "/candidate"
          : "/";

    return (
      <div style={s.wrap}>
        <div style={s.card}>
          <div style={s.cardAccent} />
          <div style={s.iconWrap}>
            <svg style={s.iconSvg} viewBox="0 0 24 24">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <span style={s.eyebrow}>Page error</span>
          <div style={s.title}>This page ran into a problem</div>
          <div style={s.sub}>
            Don't worry — the rest of the app is fine. Head back to your
            dashboard.
          </div>
          <Link
            to={homeLink}
            style={s.btn}
            onClick={() => this.setState({ hasError: false })}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }
}

export default function RouteErrorBoundary({ children }) {
  const { user } = useAuth();
  return (
    <RouteErrorBoundaryInner role={user?.role}>
      {children}
    </RouteErrorBoundaryInner>
  );
}
