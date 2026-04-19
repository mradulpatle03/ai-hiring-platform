import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJobById } from "../../api/jobs";
import { applyToJob } from "../../api/applications";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import { MapPin, Clock, Building, Upload } from "lucide-react";

const s = {
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "1.5rem",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.5rem",
  },
  title: { fontSize: "22px", fontWeight: "600", marginBottom: "6px" },
  company: {
    fontSize: "15px",
    color: "#555",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    fontSize: "13px",
    color: "#777",
    marginBottom: "1.5rem",
  },
  section: { marginBottom: "1.5rem" },
  sh: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  desc: {
    fontSize: "14px",
    color: "#444",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  skill: {
    background: "#f0effc",
    color: "#5a52c0",
    fontSize: "12px",
    padding: "4px 11px",
    borderRadius: "999px",
    display: "inline-block",
    marginRight: "6px",
    marginBottom: "6px",
  },
  applyCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "1.5rem",
    position: "sticky",
    top: "80px",
  },
  dropzone: {
    border: "2px dashed #ddd",
    borderRadius: "10px",
    padding: "2rem 1rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  btn: {
    width: "100%",
    padding: "12px",
    background: "#7F77DD",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "12px",
  },
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJobById(id),
  });

  const mutation = useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      toast.success("Application submitted! AI screening has started.");
      navigate("/candidate/applied");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Application failed"),
  });

  const handleApply = () => {
    if (!file) return toast.error("Please upload your resume PDF");
    const formData = new FormData();
    formData.append("jobId", id);
    formData.append("resume", file);
    mutation.mutate(formData);
  };

  if (isLoading)
    return (
      <Layout>
        <p style={{ color: "#aaa" }}>Loading...</p>
      </Layout>
    );
  const job = data?.job;

  return (
    <Layout>
      <div style={s.layout}>
        <div style={s.card}>
          <div style={s.title}>{job.title}</div>
          <div style={s.company}>
            <Building size={15} />
            {job.company}
          </div>
          <div style={s.meta}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={13} />
              {job.location}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={13} />
              {job.experienceYears}+ years
            </span>
            {job.salary && <span>${job.salary}</span>}
          </div>
          {job.skillsRequired?.length > 0 && (
            <div style={s.section}>
              <div style={s.sh}>Skills required</div>
              {job.skillsRequired.map((sk) => (
                <span key={sk} style={s.skill}>
                  {sk}
                </span>
              ))}
            </div>
          )}
          <div style={s.section}>
            <div style={s.sh}>About this role</div>
            <div style={s.desc}>{job.description}</div>
          </div>
        </div>

        <div style={s.applyCard}>
          <div
            style={{ fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}
          >
            Apply for this role
          </div>
          <div
            style={{ fontSize: "13px", color: "#888", marginBottom: "1.25rem" }}
          >
            Upload your resume — AI will score your fit instantly.
          </div>
          <div
            style={{ ...s.dropzone, borderColor: file ? "#7F77DD" : "#ddd" }}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setFile(e.dataTransfer.files[0]);
            }}
          >
            <Upload
              size={22}
              color={file ? "#7F77DD" : "#bbb"}
              style={{ marginBottom: "8px" }}
            />
            {file ? (
              <div
                style={{
                  fontSize: "13px",
                  color: "#7F77DD",
                  fontWeight: "500",
                }}
              >
                {file.name}
              </div>
            ) : (
              <>
                <div style={{ fontSize: "13px", color: "#888" }}>
                  Drop your PDF here or click to browse
                </div>
                <div
                  style={{ fontSize: "11px", color: "#bbb", marginTop: "4px" }}
                >
                  PDF only · Max 5MB
                </div>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button
            style={s.btn}
            onClick={handleApply}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Submit application"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
