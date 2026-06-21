import { MapPin, Clock, Building } from "lucide-react";
import { color, font } from "../styles/theme";

export default function JobCard({ job, onClick, action }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${color.lineLight}`,
        borderLeft: `3px solid ${color.paper3}`,
        padding: "1.25rem",
        transition: "border-left-color 0.15s",
        cursor: "pointer",
      }}
      onClick={onClick}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderLeftColor = color.signal)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderLeftColor = color.paper3)
      }
    >
      <div
        style={{
          fontFamily: font.display,
          fontWeight: 600,
          fontSize: "16px",
          marginBottom: "5px",
          letterSpacing: "-0.01em",
        }}
      >
        {job.title}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: color.graphite,
          marginBottom: "12px",
        }}
      >
        <Building size={12} />
        {job.company}
      </div>
      <div
        style={{
          display: "flex",
          gap: "14px",
          fontFamily: font.mono,
          fontSize: "11px",
          color: color.graphiteDim,
          marginBottom: "12px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MapPin size={11} />
          {job.location}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock size={11} />
          {job.experienceYears}+ yrs
        </span>
        {job.salary && <span>${job.salary}</span>}
      </div>
      {job.skillsRequired?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {job.skillsRequired.slice(0, 4).map((sk) => (
            <span
              key={sk}
              style={{
                fontFamily: font.mono,
                fontSize: "10px",
                color: color.graphite,
                border: `1px solid ${color.lineLight}`,
                padding: "3px 8px",
              }}
            >
              {sk}
            </span>
          ))}
          {job.skillsRequired.length > 4 && (
            <span
              style={{
                fontFamily: font.mono,
                fontSize: "10px",
                color: color.graphiteDim,
                padding: "3px 8px",
              }}
            >
              +{job.skillsRequired.length - 4}
            </span>
          )}
        </div>
      )}
      {action && <div style={{ marginTop: "14px" }}>{action}</div>}
    </div>
  );
}
