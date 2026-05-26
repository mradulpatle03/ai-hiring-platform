import { useQuery } from "@tanstack/react-query";
import { fetchFunnel } from "../../api/analytics";

export default function FunnelChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-funnel"],
    queryFn: fetchFunnel,
  });
  const funnel = data?.funnel || [];
  const max = funnel[0]?.count || 1;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: "12px",
        padding: "1.25rem",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px" }}>
        Hiring funnel
      </div>
      <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "1.5rem" }}>
        Candidate progression through stages
      </div>
      {isLoading ? (
        <div
          style={{
            height: "160px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ddd",
          }}
        >
          Loading...
        </div>
      ) : funnel.length === 0 ? (
        <div
          style={{
            color: "#ddd",
            fontSize: "13px",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          No data yet
        </div>
      ) : (
        funnel.map((stage, i) => {
          const pct = Math.round((stage.count / max) * 100);
          const convPct =
            i > 0 && funnel[i - 1].count > 0
              ? Math.round((stage.count / funnel[i - 1].count) * 100)
              : null;
          return (
            <div
              key={stage.stage}
              style={{ marginBottom: i < funnel.length - 1 ? "12px" : 0 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: "500" }}>
                  {stage.stage}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {convPct !== null && (
                    <span style={{ fontSize: "11px", color: "#aaa" }}>
                      {convPct}% from prev
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: stage.color,
                    }}
                  >
                    {stage.count}
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: stage.color,
                    borderRadius: "4px",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
