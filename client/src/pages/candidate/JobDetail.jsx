import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchJobById } from "../../api/jobs";
import { applyToJob } from "../../api/applications";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import { MapPin, Clock, Building, Upload } from "lucide-react";
import { color, font } from "../../styles/theme";

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
        <p style={{ color: color.graphiteDim }}>Loading...</p>
      </Layout>
    );
  const job = data?.job;

  return (
    <Layout>
      <div style={s.layout}>
        <div style={s.card}>
          <div style={s.title}>{job.title}</div>
          <div style={s.company}>
            <Building size={14} />
            {job.company}
          </div>
          <div style={s.meta}>
            <span style={s.metaItem}>
              <MapPin size={12} />
              {job.location}
            </span>
            <span style={s.metaItem}>
              <Clock size={12} />
              {job.experienceYears}+ years
            </span>
            {job.salary && <span style={s.metaItem}>${job.salary}</span>}
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
          <div style={s.applyTitle}>Apply for this role</div>
          <div style={s.applySub}>
            Upload your resume — AI will score your fit instantly.
          </div>
          <div
            style={{
              ...s.dropzone,
              borderColor: file ? color.signal : color.lineLightStrong,
            }}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setFile(e.dataTransfer.files[0]);
            }}
          >
            <Upload
              size={20}
              color={file ? color.signal : color.graphiteDim}
              style={{ marginBottom: "8px" }}
            />
            {file ? (
              <div style={s.fileName}>{file.name}</div>
            ) : (
              <>
                <div style={s.dzText}>
                  Drop your PDF here or click to browse
                </div>
                <div style={s.dzSub}>PDF only · Max 5MB</div>
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
            {mutation.isPending ? "Submitting…" : "Submit application →"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

const s = {
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "1.5rem",
    alignItems: "start",
  },
  card: {
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
    padding: "1.75rem",
  },
  title: {
    fontFamily: font.display,
    fontSize: "24px",
    fontWeight: 700,
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },
  company: {
    fontSize: "15px",
    color: color.graphite,
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    fontFamily: font.mono,
    fontSize: "12px",
    color: color.graphiteDim,
    marginBottom: "1.5rem",
  },
  metaItem: { display: "flex", alignItems: "center", gap: "5px" },
  section: { marginBottom: "1.5rem" },
  sh: {
    fontFamily: font.mono,
    fontSize: "11px",
    fontWeight: 700,
    color: color.graphite,
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  desc: {
    fontSize: "14px",
    color: color.ink,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
  },
  skill: {
    fontFamily: font.mono,
    color: color.graphite,
    border: `1px solid ${color.lineLight}`,
    fontSize: "11px",
    padding: "4px 11px",
    display: "inline-block",
    marginRight: "6px",
    marginBottom: "6px",
  },
  applyCard: {
    background: "#fff",
    border: `1px solid ${color.lineLight}`,
    padding: "1.5rem",
    position: "sticky",
    top: "80px",
  },
  applyTitle: {
    fontFamily: font.display,
    fontWeight: 700,
    fontSize: "16px",
    marginBottom: "4px",
  },
  applySub: {
    fontSize: "13px",
    color: color.graphite,
    marginBottom: "1.25rem",
  },
  dropzone: {
    border: "2px dashed",
    padding: "2rem 1rem",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.15s",
  },
  fileName: { fontSize: "13px", color: color.signal, fontWeight: "600" },
  dzText: { fontSize: "13px", color: color.graphite },
  dzSub: {
    fontFamily: font.mono,
    fontSize: "10px",
    color: color.graphiteDim,
    marginTop: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  btn: {
    width: "100%",
    padding: "13px",
    background: color.ink,
    color: "#fff",
    border: "none",
    fontFamily: font.mono,
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    cursor: "pointer",
    marginTop: "14px",
  },
};
