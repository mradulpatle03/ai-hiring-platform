import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    company: "",
  });
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
      const user = await register(form);
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
      setError(data?.message || "Registration failed");
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
          padding: 2.5rem 2.75rem;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hf-mobile-brand { display: none; }

        #hf-name:focus, #hf-email:focus, #hf-password:focus, #hf-company:focus {
          outline: none;
          border-color: #7F77DD !important;
          box-shadow: 0 0 0 3px rgba(127,119,221,0.14);
          background: #fff;
        }

        @media (max-width: 720px) {
          .hf-left-panel { width: 200px; padding: 2rem 1.25rem; }
          .hf-right-panel { padding: 2rem 1.75rem; }
        }

        @media (max-width: 560px) {
          .hf-card { flex-direction: column; border-radius: 16px; }
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

        @media (max-width: 360px) {
          .hf-card { border-radius: 12px; }
          .hf-right-panel { padding: 1.5rem 1rem 2rem; }
          .hf-title { font-size: 20px !important; }
          .hf-sub { font-size: 13px !important; }
          .hf-role-btn { font-size: 12px !important; padding: 8px 6px !important; }
          .hf-field-input { font-size: 14px !important; padding: 10px 12px 10px 36px !important; }
          .hf-btn { font-size: 14px !important; padding: 11px !important; }
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
              Your next career move or your next great hire starts here.
            </p>
          </div>

          <div style={styles.leftSteps}>
            <p style={styles.stepsLabel}>Get started in 3 steps</p>
            {[
              { n: "1", text: "Create your account" },
              { n: "2", text: "Build your profile" },
              { n: "3", text: "Start matching" },
            ].map(({ n, text }) => (
              <div key={n} style={styles.stepItem}>
                <div style={styles.stepNum}>{n}</div>
                <div style={styles.stepText}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="hf-right-panel">
          {/* Mobile-only brand */}
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
            <p style={styles.eyebrow}>Get started</p>
            <h1 className="hf-title" style={styles.title}>
              Create your account
            </h1>
            <p className="hf-sub" style={styles.sub}>
              Join the AI Hiring Platform
            </p>
          </div>

          {/* Role toggle */}
          <div style={styles.roleToggle}>
            {[
              {
                value: "candidate",
                label: "Job Seeker",
                icon: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ),
              },
              {
                value: "recruiter",
                label: "Recruiter",
                icon: (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                ),
              },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                className="hf-role-btn"
                onClick={() => setForm((p) => ({ ...p, role: value }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === value ? styles.roleBtnActive : {}),
                }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

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
            {/* Full name */}
            <div style={styles.fieldGroup}>
              <label style={styles.fieldLabel} htmlFor="hf-name">
                Full name
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="hf-name"
                  className="hf-field-input"
                  style={{
                    ...styles.fieldInput,
                    borderColor: fieldErrors.name ? "#e74c3c" : undefined,
                  }}
                  name="name"
                  placeholder="your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              {fieldErr("name")}
            </div>

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
                  placeholder="Min. 6 characters"
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

            {/* Company — recruiter only */}
            {form.role === "recruiter" && (
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="hf-company">
                  Company name
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
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <input
                    id="hf-company"
                    className="hf-field-input"
                    style={{
                      ...styles.fieldInput,
                      borderColor: fieldErrors.company ? "#e74c3c" : undefined,
                    }}
                    name="company"
                    placeholder="Acme Corp"
                    value={form.company}
                    onChange={handleChange}
                  />
                </div>
                {fieldErr("company")}
              </div>
            )}

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
                  Creating account…
                </>
              ) : (
                <>
                  Create account
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
            Already have an account?{" "}
            <Link to="/login" style={styles.footerLink}>
              Sign in
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
  leftSteps: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  stepsLabel: {
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
    margin: "0 0 4px",
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  stepNum: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 600,
    color: "#fff",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.8)",
  },

  /* Form header */
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

  /* Role toggle */
  roleToggle: {
    display: "flex",
    gap: "6px",
    marginBottom: "1.25rem",
    background: "#f5f4fd",
    borderRadius: "11px",
    padding: "4px",
    border: "0.5px solid rgba(127,119,221,0.15)",
    width: "100%",
  },
  roleBtn: {
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
    gap: "6px",
    whiteSpace: "nowrap",
  },
  roleBtnActive: {
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
    marginTop: "4px",
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
