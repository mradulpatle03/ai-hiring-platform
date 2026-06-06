import { Component } from "react";

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
    padding: "2.5rem",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
    lineHeight: 1.6,
    marginBottom: "1.5rem",
  },
  detail: {
    background: "#fdf0f0",
    border: "1px solid #fde0e0",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "12px",
    color: "#c0392b",
    fontFamily: "monospace",
    textAlign: "left",
    marginBottom: "1.5rem",
    wordBreak: "break-word",
    maxHeight: "100px",
    overflowY: "auto",
  },
  btnRow: { display: "flex", gap: "10px", justifyContent: "center" },
  btnPri: {
    padding: "10px 22px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
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
          <div style={s.icon}>⚠️</div>
          <div style={s.title}>Something went wrong</div>
          <div style={s.sub}>
            An unexpected error occurred. This has been noted. Try reloading the
            page — if the problem persists, go back to the home page.
          </div>

          {/* Show error details in dev only */}
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
