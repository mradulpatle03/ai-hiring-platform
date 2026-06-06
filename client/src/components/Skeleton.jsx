const shimmer = `
  @keyframes shimmer {
    0%   { background-position: -600px 0 }
    100% { background-position:  600px 0 }
  }
`;
const base = {
  background: "linear-gradient(90deg, #f5f5f5 25%, #ececec 37%, #f5f5f5 63%)",
  backgroundSize: "600px 100%",
  animation: "shimmer 1.4s ease infinite",
  borderRadius: "6px",
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
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "1.25rem",
      }}
    >
      <style>{shimmer}</style>
      <span
        style={{
          ...base,
          height: "16px",
          width: "60%",
          marginBottom: "10px",
          display: "block",
        }}
      />
      <span
        style={{
          ...base,
          height: "12px",
          width: "40%",
          marginBottom: "10px",
          display: "block",
        }}
      />
      <span
        style={{
          ...base,
          height: "12px",
          width: "80%",
          marginBottom: "10px",
          display: "block",
        }}
      />
      <div style={{ display: "flex", gap: "6px" }}>
        {[60, 80, 70].map((w, i) => (
          <span
            key={i}
            style={{
              ...base,
              height: "22px",
              width: `${w}px`,
              borderRadius: "999px",
              display: "block",
            }}
          />
        ))}
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
          style={{ padding: "14px 16px", borderBottom: "1px solid #f8f8f8" }}
        >
          <span style={{ ...base, height: h, width: w, display: "block" }} />
        </td>
      ))}
    </tr>
  );
}

// Generic list skeleton
export function ListSkeleton({ rows = 4 }) {
  return (
    <>
      <style>{shimmer}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: "10px",
            padding: "1rem 1.25rem",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              ...base,
              height: "14px",
              width: `${50 + ((i * 13) % 35)}%`,
              marginBottom: "8px",
              display: "block",
            }}
          />
          <span
            style={{
              ...base,
              height: "12px",
              width: `${30 + ((i * 17) % 30)}%`,
              display: "block",
            }}
          />
        </div>
      ))}
    </>
  );
}

export default SkeletonBox;
