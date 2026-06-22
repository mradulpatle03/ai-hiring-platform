export const chartTheme = {
  axis: {
    style: {
      tickLabels: {
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 600,
        fill: "#5C5F6B",
        padding: 6,
      },
      grid: { stroke: "rgba(11,14,20,0.06)" },
      axis: { stroke: "none" },
      ticks: { stroke: "none" },
    },
  },
  tooltip: {
    style: {
      fontSize: 10,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      fill: "#0B0E14",
    },
    flyoutStyle: {
      fill: "#fff",
      stroke: "rgba(11,14,20,0.12)",
      strokeWidth: 1,
    },
    flyoutPadding: { top: 6, bottom: 6, left: 10, right: 10 },
  },
};