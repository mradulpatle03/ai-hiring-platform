import {
  VictoryChart,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { useQuery } from "@tanstack/react-query";
import { fetchOverTime } from "../../api/analytics";
import { chartTheme } from "./chartTheme";

export default function ApplicationsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-time"],
    queryFn: fetchOverTime,
  });
  const raw = data?.data || [];
  const chartData = raw.map((d, i) => ({
    x: i,
    y: d.count,
    label: `${d.label}: ${d.count} apps`,
  }));

  const totalCount = raw.reduce((sum, d) => sum + d.count, 0);
  const maxCount = raw.length > 0 ? Math.max(...raw.map((d) => d.count)) : 0;
  const minCount = raw.length > 0 ? Math.min(...raw.map((d) => d.count)) : 0;

  const trend =
    raw.length > 1
      ? raw.slice(raw.length / 2).reduce((sum, d) => sum + d.count, 0) /
          (raw.length / 2) -
        raw.slice(0, raw.length / 2).reduce((sum, d) => sum + d.count, 0) /
          (raw.length / 2)
      : 0;
  const trendPercent = maxCount > 0 ? (trend / maxCount) * 100 : 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(11,14,20,0.10)",
        borderRadius: "4px",
        padding: "22px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: "700",
              fontSize: "16px",
              letterSpacing: "-0.02em",
              color: "#0B0E14",
              marginBottom: "4px",
            }}
          >
            Applications over time
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#5C5F6B",
            }}
          >
            Last 30 days
          </div>
        </div>

        {/* Stats badges */}
        {raw.length > 0 && (
          <div style={{ display: "flex", gap: "6px" }}>
            <div
              style={{
                background: "rgba(11,14,20,0.04)",
                border: "1px solid rgba(11,14,20,0.10)",
                borderRadius: "2px",
                padding: "6px 12px",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#5C5F6B",
                  marginBottom: "2px",
                }}
              >
                Total
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "700",
                  fontSize: "18px",
                  letterSpacing: "-0.02em",
                  color: "#0B0E14",
                }}
              >
                {totalCount}
              </div>
            </div>

            <div
              style={{
                background:
                  trend > 0 ? "rgba(29,138,78,0.08)" : "rgba(255,77,46,0.08)",
                border: `1px solid ${trend > 0 ? "rgba(29,138,78,0.20)" : "rgba(255,77,46,0.20)"}`,
                borderRadius: "2px",
                padding: "6px 12px",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  fontWeight: "600",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#5C5F6B",
                  marginBottom: "2px",
                }}
              >
                Trend
              </div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: "700",
                  fontSize: "18px",
                  letterSpacing: "-0.02em",
                  color: trend > 0 ? "#1D8A4E" : "#FF4D2E",
                }}
              >
                {trend > 0 ? "+" : ""}
                {Math.abs(trendPercent).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      {isLoading ? (
        <div
          style={{
            height: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(11,14,20,0.02)",
            border: "1px solid rgba(11,14,20,0.08)",
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: "600",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8A8D98",
            }}
          >
            Loading…
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(11,14,20,0.02)",
            border: "1px solid rgba(11,14,20,0.06)",
            borderRadius: "2px",
            padding: "8px 4px 4px",
          }}
        >
          <VictoryChart
            height={220}
            padding={{ top: 15, bottom: 45, left: 50, right: 15 }}
            containerComponent={<VictoryVoronoiContainer />}
          >
            <VictoryAxis
              tickFormat={(t) =>
                raw[t] && raw.indexOf(raw[t]) % 5 === 0 ? raw[t].label : ""
              }
              style={chartTheme.axis.style}
              tickCount={raw.length > 0 ? Math.min(6, raw.length) : 0}
            />
            <VictoryAxis
              dependentAxis
              style={chartTheme.axis.style}
              tickCount={4}
            />
            <VictoryArea
              data={chartData}
              style={{
                data: {
                  fill: "rgba(77,124,255,0.08)",
                  stroke: "#4D7CFF",
                  strokeWidth: 2,
                  fillOpacity: 1,
                },
              }}
              curve="basis"
              labelComponent={
                <VictoryTooltip
                  style={chartTheme.tooltip.style}
                  flyoutStyle={chartTheme.tooltip.flyoutStyle}
                  flyoutPadding={chartTheme.tooltip.flyoutPadding}
                  cornerRadius={2}
                  flyoutStroke="rgba(11,14,20,0.12)"
                />
              }
            />
          </VictoryChart>
        </div>
      )}

      {/* Footer stats */}
      {raw.length > 0 && !isLoading && (
        <div
          style={{
            display: "flex",
            gap: "0",
            marginTop: "12px",
            border: "1px solid rgba(11,14,20,0.08)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 14px",
              borderRight: "1px solid rgba(11,14,20,0.08)",
            }}
          >
            <div
              style={{ width: "3px", height: "16px", background: "#1D8A4E" }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#5C5F6B",
              }}
            >
              Peak
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: "700",
                fontSize: "16px",
                letterSpacing: "-0.02em",
                color: "#0B0E14",
              }}
            >
              {maxCount}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 14px",
            }}
          >
            <div
              style={{ width: "3px", height: "16px", background: "#FF4D2E" }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "9px",
                fontWeight: "600",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#5C5F6B",
              }}
            >
              Low
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: "700",
                fontSize: "16px",
                letterSpacing: "-0.02em",
                color: "#0B0E14",
              }}
            >
              {minCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
