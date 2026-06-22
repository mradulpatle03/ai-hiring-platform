import { Component } from "react";

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
    padding: "2.5rem",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  cardAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
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
    margin: "0 auto 16px",
  },
  iconSvg: {
    width: "20px",
    height: "20px",
    fill: "none",
    stroke: "var(--signal)",
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
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "var(--ink)",
    marginBottom: "10px",
  },
  sub: {
    fontSize: "13px",
    color: "var(--graphite)",
    lineHeight: 1.65,
    marginBottom: "1.5rem",
  },
  detail: {
    background: "rgba(255,77,46,0.05)",
    border: "1px solid rgba(255,77,46,0.2)",
    borderLeft: "3px solid var(--signal)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 14px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: "var(--signal)",
    textAlign: "left",
    marginBottom: "1.5rem",
    wordBreak: "break-word",
    maxHeight: "100px",
    overflowY: "auto",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
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
};

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production you'd send this to Sentry
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => window.location.reload();

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.cardAccent} />
          <div style={s.iconWrap}>
            <svg style={s.iconSvg} viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span style={s.eyebrow}>Runtime error</span>
          <div style={s.title}>Something went wrong</div>
          <div style={s.sub}>
            An unexpected error occurred. This has been noted. Try reloading the
            page — if the problem persists, go back to the home page.
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div style={s.detail}>
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack?.slice(0, 200)}
            </div>
          )}

          <div style={s.btnRow}>
            <button style={s.btnPri} onClick={this.handleReload}>
              Reload page
            </button>
            <button style={s.btnSec} onClick={this.handleGoHome}>
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;