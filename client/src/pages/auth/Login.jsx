import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState("candidate");

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
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
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
          max-width: 900px;
          min-height: 580px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(83,74,183,0.13);
          border: 0.5px solid rgba(0,0,0,0.07);
        }

        .hf-left-panel {
          width: 280px;
          flex-shrink: 0;
          background: #534AB7;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .hf-right-panel {
          flex: 1;
          min-width: 0;
          padding: 3rem 2.75rem;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hf-mobile-brand { display: none; }

        #hf-email:focus, #hf-password:focus {
          outline: none;
          border-color: #7F77DD !important;
          box-shadow: 0 0 0 3px rgba(127,119,221,0.14);
          background: #fff;
        }

        /* Tablet */
        @media (max-width: 720px) {
          .hf-left-panel { width: 200px; padding: 2rem 1.25rem; }
          .hf-right-panel { padding: 2rem 1.75rem; }
        }

        /* Mobile ≤ 560px — single column */
        @media (max-width: 560px) {
          .hf-card {
            flex-direction: column;
            border-radius: 16px;
            min-height: unset;
          }
          .hf-left-panel { display: none; }
          .hf-mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 1.5rem;
          }
          .hf-right-panel {
            padding: 2rem 1.5rem 2.5rem;
            justify-content: flex-start;
          }
        }

        /* Very small — 320px */
        @media (max-width: 360px) {
          .hf-card { border-radius: 12px; }
          .hf-right-panel { padding: 1.5rem 1rem 2rem; }
          .hf-title { font-size: 20px !important; }
          .hf-sub { font-size: 13px !important; }
          .hf-role-tab { font-size: 12px !important; padding: 8px 6px !important; }
          .hf-field-input { font-size: 14px !important; padding: 10px 12px 10px 36px !important; }
          .hf-btn { font-size: 14px !important; padding: 11px !important; }
          .hf-sso-btn { font-size: 13px !important; padding: 10px !important; }
        }
      `}</style>

      <div className="hf-card">
        {/* Left panel */}
        <div className="hf-left-panel">
          <div>
            <div style={styles.brand}>
              <div style={styles.brandIconWhite}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
              </div>
              <span style={styles.brandName}>HireFlow</span>
            </div>
            <p style={styles.leftTagline}>
              Connecting great talent with great teams faster than ever.
            </p>
          </div>

          <div style={styles.leftStats}>
            {[
              { value: "grab", label: "active roles" },
              { value: "Top", label: "companies hiring" },
              { value: "11 days", label: "avg. time to hire" },
            ].map(({ value, label }) => (
              <div key={label} style={styles.statItem}>
                <div style={styles.statDot} />
                <div style={styles.statText}>
                  <strong style={{ color: "#fff", fontWeight: 600 }}>
                    {value}
                  </strong>{" "}
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="hf-right-panel">
          {/* Mobile-only brand header */}
          <div className="hf-mobile-brand">
            <div style={styles.brandIconPurple}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <span style={styles.brandNamePurple}>HireFlow</span>
          </div>

          <div style={styles.formHeader}>
            <p style={styles.eyebrow}>Welcome back</p>
            <h1 className="hf-title" style={styles.title}>
              Sign in to your account
            </h1>
            <p className="hf-sub" style={styles.sub}>
              Pick your role to continue
            </p>
          </div>

          {/* Role tabs */}
          {/* <div style={styles.roleTabs}>
            {["candidate", "recruiter"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className="hf-role-tab"
                style={{
                  ...styles.roleTab,
                  ...(activeRole === role ? styles.roleTabActive : {}),
                }}
              >
                {role === "candidate" ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      verticalAlign: "middle",
                      marginRight: 5,
                      flexShrink: 0,
                    }}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      verticalAlign: "middle",
                      marginRight: 5,
                      flexShrink: 0,
                    }}
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                )}
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div> */}

          {error && (
            <div style={styles.errorBanner}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
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
            {/* Email */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel} htmlFor="hf-email">
                Email address
              </label>
              <div style={styles.fieldWrap}>
                <svg
                  style={styles.fieldIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="hf-email"
                  className="hf-field-input"
                  style={{
                    ...styles.fieldInput,
                    borderColor: fieldErrors.email ? "#e74c3c" : undefined,
                  }}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErr("email")}
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel} htmlFor="hf-password">
                Password
              </label>
              <div style={styles.fieldWrap}>
                <svg
                  style={styles.fieldIcon}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="hf-password"
                  className="hf-field-input"
                  style={{
                    ...styles.fieldInput,
                    paddingRight: "44px",
                    borderColor: fieldErrors.password ? "#e74c3c" : undefined,
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
                      width="16"
                      height="16"
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
                      width="16"
                      height="16"
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
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      animation: "hf-spin 0.8s linear infinite",
                      flexShrink: 0,
                    }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
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
              Create one it's free
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
    background: "#f0eff8",
    padding: "1rem",
  },

  /* Brand */
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "1.5rem",
  },
  brandIconWhite: {
    width: "36px",
    height: "36px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandIconPurple: {
    width: "34px",
    height: "34px",
    background: "#7F77DD",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    fontSize: "17px",
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  brandNamePurple: {
    fontSize: "17px",
    fontWeight: 600,
    color: "#534AB7",
    letterSpacing: "-0.01em",
  },
  leftTagline: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.65,
    margin: 0,
  },
  leftStats: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  statDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.4)",
    flexShrink: 0,
  },
  statText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
  },

  /* Form */
  formHeader: {
    marginBottom: "1.5rem",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.09em",
    color: "#7F77DD",
    textTransform: "uppercase",
    margin: "0 0 6px",
  },
  title: {
    fontSize: "24px",
    fontWeight: 600,
    color: "#1a1a2e",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  sub: {
    color: "#999",
    fontSize: "14px",
    margin: 0,
  },

  /* Role tabs */
  roleTabs: {
    display: "flex",
    gap: "5px",
    marginBottom: "1.5rem",
    background: "#f5f4fd",
    borderRadius: "11px",
    padding: "4px",
    border: "0.5px solid rgba(127,119,221,0.15)",
    width: "100%",
  },
  roleTab: {
    flex: 1,
    minWidth: 0,
    padding: "9px 8px",
    fontSize: "14px",
    fontWeight: 500,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "transparent",
    color: "#999",
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
  },
  roleTabActive: {
    background: "#fff",
    color: "#534AB7",
    border: "0.5px solid rgba(127,119,221,0.25)",
    boxShadow: "0 1px 6px rgba(83,74,183,0.1)",
  },

  /* Error */
  errorBanner: {
    background: "#fff0f0",
    color: "#c0392b",
    border: "0.5px solid #f5c6c6",
    borderRadius: "10px",
    padding: "10px 12px",
    fontSize: "13px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "1rem",
    width: "100%",
  },

  /* Fields */
  fieldGroup: {
    marginBottom: "14px",
    width: "100%",
  },
  fieldLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#555",
    marginBottom: "5px",
  },
  fieldWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  fieldIcon: {
    position: "absolute",
    left: "12px",
    color: "#bbb",
    pointerEvents: "none",
    flexShrink: 0,
  },
  fieldInput: {
    width: "100%",
    padding: "11px 14px 11px 38px",
    fontSize: "15px",
    border: "1.5px solid #e8e8e8",
    borderRadius: "10px",
    background: "#fafafa",
    color: "#1a1a2e",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
    minWidth: 0,
  },
  eyeBtn: {
    position: "absolute",
    right: "11px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#bbb",
    padding: 0,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  fieldError: {
    fontSize: "12px",
    color: "#e74c3c",
    marginTop: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-4px",
    marginBottom: "1.25rem",
  },
  forgotLink: {
    fontSize: "13px",
    color: "#7F77DD",
    textDecoration: "none",
  },

  btn: {
    width: "100%",
    padding: "12px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "background 0.15s",
    letterSpacing: "-0.01em",
    boxSizing: "border-box",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "1.25rem 0",
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#f0f0f0",
    minWidth: 0,
  },
  dividerText: {
    fontSize: "12px",
    color: "#bbb",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },

  ssoBtn: {
    width: "100%",
    padding: "11px",
    background: "#fafafa",
    border: "1.5px solid #e8e8e8",
    borderRadius: "10px",
    fontSize: "15px",
    color: "#444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
    transition: "background 0.15s",
    fontWeight: 500,
    boxSizing: "border-box",
  },

  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "1.25rem",
    color: "#aaa",
  },
  footerLink: {
    color: "#7F77DD",
    textDecoration: "none",
    fontWeight: 500,
  },
};
