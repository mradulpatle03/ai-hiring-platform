import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "../../api/jobs";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";

const s = {
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "680px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "6px",
    color: "#444",
  },
  group: { marginBottom: "1.25rem" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  btn: {
    padding: "10px 24px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  h1: { fontSize: "20px", fontWeight: "600", marginBottom: "0.25rem" },
  sub: { fontSize: "13px", color: "#888", marginBottom: "1.5rem" },
};

export default function PostJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "Remote",
    salary: "",
    experienceYears: 1,
  });

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries(["myJobs"]);
      toast.success("Job posted! AI is extracting skills in the background.");
      navigate("/recruiter/jobs");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to post job"),
  });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Layout>
      <div style={s.h1}>Post a new job</div>
      <div style={s.sub}>
        AI will automatically extract required skills from your description.
      </div>
      <div style={s.card}>
        <form onSubmit={handleSubmit}>
          <div style={s.group}>
            <label style={s.label}>Job title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Senior React Developer"
              required
            />
          </div>
          <div style={s.group}>
            <label style={s.label}>Job description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and requirements in detail. The more detail you add, the better the AI can screen candidates."
              rows={7}
              required
              style={{ resize: "vertical" }}
            />
          </div>
          <div style={{ ...s.row, ...s.group }}>
            <div>
              <label style={s.label}>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <div>
              <label style={s.label}>Salary (optional)</label>
              <input
                name="salary"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. ₹8–12 LPA"
              />
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>Experience required (years)</label>
            <input
              name="experienceYears"
              type="number"
              min="0"
              max="20"
              value={form.experienceYears}
              onChange={handleChange}
            />
          </div>
          <button style={s.btn} type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Posting..." : "Post job"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
