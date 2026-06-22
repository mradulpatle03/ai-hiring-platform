import { color } from "../styles/theme";

const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -600px 0 }
    100% { background-position:  600px 0 }
  }
`;

const base = {
  background: `linear-gradient(90deg, ${color.paper2} 25%, ${color.paper3} 37%, ${color.paper2} 63%)`,
  backgroundSize: "600px 100%",
  animation: "shimmer 1.4s ease infinite",
  borderRadius: "0px",
  display: "block",
};

// Single skeleton element
export function SkeletonBox({ width = "100%", height = "14px", style = {} }) {
  return (
    <>
      <style>{shimmer}</style>
      <span style={{ ...base, width, height, ...style }} />
    </>
  );
}

// Pre-built card skeleton — matches JobCard shape
export function JobCardSkeleton() {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${color.lineLight}`,
      borderTop: `3px solid ${color.paper3}`,
      padding: "18px 20px",
    }}>
      <style>{shimmer}</style>
      {/* Tag line */}
      <span style={{ ...base, height: "10px", width: "80px", marginBottom: "14px", display: "block" }} />
      {/* Title */}
      <span style={{ ...base, height: "16px", width: "58%", marginBottom: "8px",  display: "block" }} />
      {/* Company */}
      <span style={{ ...base, height: "11px", width: "38%", marginBottom: "16px", display: "block" }} />
      {/* Skill chips */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
        {[64, 80, 68, 40].map((w, i) => (
          <span key={i} style={{ ...base, height: "22px", width: `${w}px`, display: "block" }} />
        ))}
      </div>
      {/* CTA row */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderTop: `1px solid ${color.lineLight}`, paddingTop: "14px",
      }}>
        <span style={{ ...base, height: "12px", width: "90px", display: "block" }} />
        <span style={{ ...base, height: "30px", width: "90px", display: "block" }} />
      </div>
    </div>
  );
}

// Pre-built applicant row skeleton — matches table row shape
export function ApplicantRowSkeleton() {
  return (
    <tr>
      <style>{shimmer}</style>
      {[
        ["140px", "12px"],
        ["100px", "12px"],
        ["60px", "20px"],
        ["70px", "20px"],
        ["80px", "12px"],
        ["120px", "28px"],
      ].map(([w, h], i) => (
        <td
          key={i}
          style={{ padding: "14px 18px", borderBottom: `1px solid ${color.lineLight}` }}
        >
          <span style={{ ...base, height: h, width: w, display: "block" }} />
        </td>
      ))}
    </tr>
  );
}

// Generic list skeleton — matches candrow stack
export function ListSkeleton({ rows = 4 }) {
  return (
    <>
      <style>{shimmer}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            border: `1px solid ${color.lineLight}`,
            borderTop: i === 0 ? `1px solid ${color.lineLight}` : "none",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          {/* Avatar square */}
          <span style={{ ...base, width: "38px", height: "38px", flexShrink: 0, display: "block" }} />
          {/* Text lines */}
          <div style={{ flex: 1 }}>
            <span style={{ ...base, height: "13px", width: `${48 + ((i * 13) % 30)}%`, marginBottom: "7px", display: "block" }} />
            <span style={{ ...base, height: "10px", width: `${28 + ((i * 17) % 25)}%`, display: "block" }} />
          </div>
          {/* Score placeholder */}
          <span style={{ ...base, height: "26px", width: "44px", display: "block", flexShrink: 0 }} />
          {/* Badge placeholder */}
          <span style={{ ...base, height: "22px", width: "80px", display: "block", flexShrink: 0 }} />
        </div>
      ))}
    </>
  );
}

export default SkeletonBox;