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
        // Map field errors from Zod
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
      <div
        style={{
          fontSize: "12px",
          color: "#e74c3c",
          marginTop: "-8px",
          marginBottom: "8px",
        }}
      >
        {fieldErrors[field]}
      </div>
    ) : null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.sub}>Join the AI Hiring Platform</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role toggle */}
          <div style={styles.roleToggle}>
            {["candidate", "recruiter"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: r }))}
                style={{
                  ...styles.roleBtn,
                  ...(form.role === r ? styles.roleBtnActive : {}),
                }}
              >
                {r === "candidate" ? "Job Seeker" : "Recruiter"}
              </button>
            ))}
          </div>

          <input
            style={{
              ...styles.input,
              borderColor: fieldErrors.name ? "#e74c3c" : "#ddd",
            }}
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
          {fieldErr("name")}

          <input
            style={{
              ...styles.input,
              borderColor: fieldErrors.email ? "#e74c3c" : "#ddd",
            }}
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          {fieldErr("email")}

          <input
            style={{
              ...styles.input,
              borderColor: fieldErrors.password ? "#e74c3c" : "#ddd",
            }}
            name="password"
            type="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={handleChange}
            required
          />
          {fieldErr("password")}

          {form.role === "recruiter" && (
            <>
              <input
                style={{
                  ...styles.input,
                  borderColor: fieldErrors.company ? "#e74c3c" : "#ddd",
                }}
                name="company"
                placeholder="Company name"
                value={form.company}
                onChange={handleChange}
              />
              {fieldErr("company")}
            </>
          )}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
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
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  title: { fontSize: "22px", fontWeight: "500", margin: "0 0 4px" },
  sub: { color: "#888", fontSize: "14px", margin: "0 0 1.5rem" },
  error: {
    background: "#fff0f0",
    color: "#c0392b",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "1rem",
  },
  roleToggle: { display: "flex", gap: "8px", marginBottom: "1rem" },
  roleBtn: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  roleBtnActive: {
    background: "#7F77DD",
    color: "#fff",
    borderColor: "#7F77DD",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },
  btn: {
    width: "100%",
    padding: "11px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    fontWeight: "500",
  },
  footer: {
    textAlign: "center",
    fontSize: "13px",
    marginTop: "1rem",
    color: "#666",
  },
};
