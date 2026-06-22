import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { color, font } from "../../styles/theme";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "recruiter" ? "/recruiter" : "/candidate");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const map = {};
        data.errors.forEach((e) => {
          map[e.field] = e.message;
        });
        setFieldErrors(map);
      }
      setError(data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fieldErr = (field) =>
    fieldErrors[field] ? (
      <div style={styles.fieldError}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ flexShrink: 0 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {fieldErrors[field]}
      </div>
    ) : null;

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes hf-spin { to { transform: rotate(360deg); } }
        *, *::before, *::after { box-sizing: border-box; }

        .hf-card {
          display: flex;
          width: 100%;
          max-width: 920px;
          min-height: 560px;
          background: #fff;
          border: 1px solid ${color.lineLight};
        }

        .hf-left-panel {
          width: 300px;
          flex-shrink: 0;
          background: ${color.ink};
          padding: 2.5rem 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .hf-right-panel {
          flex: 1;
          min-width: 0;
          padding: 3rem 3rem;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hf-mobile-brand { display: none; }

        #hf-email, #hf-password {
          border: 1px solid ${color.lineLightStrong};
          background: ${color.paper};
          border-radius: 0;
        }
        #hf-email:focus, #hf-password:focus {
          outline: none;
          border-color: ${color.ink};
          background: #fff;
        }

        @media (max-width: 720px) {
          .hf-left-panel { width: 220px; padding: 2rem 1.5rem; }
          .hf-right-panel { padding: 2rem 2rem; }
        }

        @media (max-width: 560px) {
          .hf-card { flex-direction: column; min-height: unset; }
          .hf-left-panel { display: none; }
          .hf-mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 1.75rem;
          }
          .hf-right-panel {
            padding: 2.25rem 1.5rem 2.5rem;
            justify-content: flex-start;
          }
        }

        @media (max-width: 360px) {
          .hf-right-panel { padding: 1.5rem 1.25rem 2rem; }
          .hf-title { font-size: 24px !important; }
          .hf-field-input { font-size: 14px !important; }
          .hf-btn { font-size: 13px !important; padding: 12px !important; }
        }
      `}</style>

      <div className="hf-card">
        {/* Left panel — dark control room */}
        <div className="hf-left-panel">
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.5,
              backgroundImage: `linear-gradient(${color.line} 1px, transparent 1px), linear-gradient(90deg, ${color.line} 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div style={{ position: "relative" }}>
            <div style={styles.brand}>
              <div style={styles.brandIconWhite}>
                <span style={styles.brandMark}>HF</span>
              </div>
              <span style={styles.brandName}>HireFlow</span>
            </div>
            <p style={styles.leftTagline}>
              Where signal beats noise. AI-scored hiring, built for speed.
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <div style={styles.leftStats}>
              {[
                { value: "240+", label: "active roles" },
                { value: "AI", label: "scored candidates" },
                { value: "11d", label: "avg. time to hire" },
              ].map(({ value, label }) => (
                <div key={label} style={styles.statItem}>
                  <span style={styles.statValue}>{value}</span>
                  <span style={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="hf-right-panel">
          <div className="hf-mobile-brand">
            <div style={styles.brandIconPurple}>
              <span style={styles.brandMark}>HF</span>
            </div>
            <span style={styles.brandNamePurple}>HireFlow</span>
          </div>

          <div style={styles.formHeader}>
            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "1rem",
                color: color.graphite,
                textDecoration: "none",
                fontFamily: font.mono,
                fontSize: "12px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              ← Back to Home
            </Link>
            <p style={styles.eyebrow}>// sign in</p>
            <h1 className="hf-title" style={styles.title}>
              Access your dashboard
            </h1>
            <p style={styles.sub}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ flexShrink: 0 }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ minWidth: 0, wordBreak: "break-word" }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel} htmlFor="hf-email">
                Email address
              </label>
              <input
                id="hf-email"
                className="hf-field-input"
                style={{
                  ...styles.fieldInput,
                  borderColor: fieldErrors.email ? color.signal : undefined,
                }}
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
              {fieldErr("email")}
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel} htmlFor="hf-password">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="hf-password"
                  className="hf-field-input"
                  style={{
                    ...styles.fieldInput,
                    paddingRight: "44px",
                    borderColor: fieldErrors.password
                      ? color.signal
                      : undefined,
                  }}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={styles.eyeBtn}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErr("password")}
            </div>

            <button
              className="hf-btn"
              style={styles.btn}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{
                      animation: "hf-spin 0.8s linear infinite",
                      flexShrink: 0,
                    }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ flexShrink: 0 }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p style={styles.footer}>
            No account yet?{" "}
            <Link to="/register" style={styles.footerLink}>
              Create one — it's free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: color.paper2,
    padding: "1.5rem",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "2rem",
  },
  brandIconWhite: {
    width: "32px",
    height: "32px",
    background: color.signal,
    clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandIconPurple: {
    width: "30px",
    height: "30px",
    background: color.ink,
    clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandMark: {
    fontFamily: font.mono,
    fontWeight: 700,
    fontSize: "12px",
    color: "#fff",
  },
  brandName: {
    fontFamily: font.display,
    fontSize: "18px",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  brandNamePurple: {
    fontFamily: font.display,
    fontSize: "18px",
    fontWeight: 700,
    color: color.ink,
    letterSpacing: "-0.01em",
  },
  leftTagline: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "200px",
  },
  leftStats: { display: "flex", flexDirection: "column", gap: "16px" },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    borderLeft: `2px solid ${color.signal}`,
    paddingLeft: "10px",
  },
  statValue: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "20px",
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  statLabel: {
    fontFamily: font.mono,
    fontSize: "10px",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },

  formHeader: { marginBottom: "1.75rem" },
  eyebrow: {
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: color.signal,
    margin: "0 0 8px",
  },
  title: {
    fontFamily: font.display,
    fontSize: "27px",
    fontWeight: 700,
    color: color.ink,
    margin: "0 0 6px",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  sub: { color: color.graphite, fontSize: "13px", margin: 0 },

  errorBanner: {
    background: "#fff",
    color: color.signal,
    border: `1px solid ${color.signal}`,
    padding: "11px 13px",
    fontSize: "13px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "1.25rem",
    width: "100%",
  },

  fieldGroup: { marginBottom: "16px", width: "100%" },
  fieldLabel: {
    display: "block",
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: color.graphite,
    marginBottom: "7px",
  },
  fieldInput: {
    width: "100%",
    padding: "12px 14px",
    fontSize: "14px",
    border: `1px solid ${color.lineLightStrong}`,
    background: color.paper,
    color: color.ink,
    boxSizing: "border-box",
    transition: "border-color 0.15s, background 0.15s",
    minWidth: 0,
  },
  eyeBtn: {
    position: "absolute",
    right: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: color.graphiteDim,
    padding: 0,
    display: "flex",
    alignItems: "center",
  },

  btn: {
    width: "100%",
    padding: "13px",
    background: color.ink,
    color: "#fff",
    border: "none",
    fontFamily: font.mono,
    fontSize: "13px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.15s",
    marginTop: "6px",
  },

  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "1.5rem",
    color: color.graphiteDim,
  },
  footerLink: { color: color.signal, fontWeight: 600 },

  fieldError: {
    fontSize: "11px",
    color: color.signal,
    marginTop: "5px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontFamily: font.mono,
  },
};
