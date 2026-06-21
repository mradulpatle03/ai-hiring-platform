import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { color, font } from "../../styles/theme";

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
          padding: 2.5rem 3rem;
          background: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hf-mobile-brand { display: none; }

        .hf-field-input {
          border: 1px solid ${color.lineLightStrong};
          background: ${color.paper};
        }
        .hf-field-input:focus {
          outline: none;
          border-color: ${color.ink};
          background: #fff;
        }

        @media (max-width: 720px) {
          .hf-left-panel { width: 220px; padding: 2rem 1.5rem; }
          .hf-right-panel { padding: 2rem 2rem; }
        }

        @media (max-width: 560px) {
          .hf-card { flex-direction: column; }
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
          .hf-right-panel { padding: 1.5rem 1.25rem 2rem; }
          .hf-title { font-size: 22px !important; }
          .hf-role-btn { font-size: 12px !important; padding: 9px 6px !important; }
          .hf-btn { font-size: 13px !important; padding: 12px !important; }
        }
      `}</style>

      <div className="hf-card">
        {/* Left panel */}
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
              Your next career move or your next great hire starts here.
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <p style={styles.stepsLabel}>Get started in 3 steps</p>
            <div style={styles.leftSteps}>
              {[
                { n: "01", text: "Create your account" },
                { n: "02", text: "Build your profile" },
                { n: "03", text: "Start matching" },
              ].map(({ n, text }) => (
                <div key={n} style={styles.stepItem}>
                  <span style={styles.stepNum}>{n}</span>
                  <span style={styles.stepText}>{text}</span>
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
            <p style={styles.eyebrow}>// get started</p>
            <h1 className="hf-title" style={styles.title}>
              Create your account
            </h1>
            <p style={styles.sub}>Join the AI hiring platform</p>
          </div>

          {/* Role toggle */}
          <div style={styles.roleToggle}>
            {[
              {
                value: "candidate",
                label: "Job Seeker",
                icon: (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
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
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.3"
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
              <label style={styles.fieldLabel} htmlFor="hf-name">
                Full name
              </label>
              <input
                id="hf-name"
                className="hf-field-input"
                style={{
                  ...styles.fieldInput,
                  borderColor: fieldErrors.name ? color.signal : undefined,
                }}
                name="name"
                placeholder="your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
              {fieldErr("name")}
            </div>

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

            {form.role === "recruiter" && (
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel} htmlFor="hf-company">
                  Company name
                </label>
                <input
                  id="hf-company"
                  className="hf-field-input"
                  style={{
                    ...styles.fieldInput,
                    borderColor: fieldErrors.company ? color.signal : undefined,
                  }}
                  name="company"
                  placeholder="Acme Corp"
                  value={form.company}
                  onChange={handleChange}
                />
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
                  Creating account
                </>
              ) : (
                <>
                  Create account
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

  stepsLabel: {
    fontFamily: font.mono,
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    margin: "0 0 14px",
  },
  leftSteps: { display: "flex", flexDirection: "column", gap: "12px" },
  stepItem: { display: "flex", alignItems: "center", gap: "12px" },
  stepNum: {
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 700,
    color: color.signal,
    flexShrink: 0,
  },
  stepText: { fontSize: "13px", color: "rgba(255,255,255,0.8)" },

  formHeader: { marginBottom: "1.5rem" },
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
    fontSize: "25px",
    fontWeight: 700,
    color: color.ink,
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  sub: { color: color.graphite, fontSize: "13px", margin: 0 },

  roleToggle: {
    display: "flex",
    gap: "0",
    marginBottom: "1.25rem",
    border: `1px solid ${color.lineLightStrong}`,
    width: "100%",
  },
  roleBtn: {
    flex: 1,
    minWidth: 0,
    padding: "10px 8px",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    background: "transparent",
    color: color.graphiteDim,
    transition: "all 0.15s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    whiteSpace: "nowrap",
  },
  roleBtnActive: { background: color.ink, color: "#fff" },

  errorBanner: {
    background: "#fff",
    color: color.signal,
    border: `1px solid ${color.signal}`,
    padding: "11px 13px",
    fontSize: "13px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    marginBottom: "1rem",
    width: "100%",
  },

  fieldGroup: { marginBottom: "14px", width: "100%" },
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
    marginTop: "4px",
  },

  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "1.25rem",
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
