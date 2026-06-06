const SIZE = 260;
const CENTER = SIZE / 2;
const LEVELS = 4;

const dimensions = [
  { key: "technicalSkills", label: "Technical", short: "Tech" },
  { key: "experienceDepth", label: "Experience", short: "Exp" },
  { key: "projectImpact", label: "Projects", short: "Projects" },
  { key: "communicationClarity", label: "Communication", short: "Comms" },
  { key: "growthPotential", label: "Growth", short: "Growth" },
];

const N = dimensions.length;
const toRad = (deg) => (deg * Math.PI) / 180;

// Get x,y for a point at angle and radius
const point = (angle, r) => ({
  x: CENTER + r * Math.cos(toRad(angle - 90)),
  y: CENTER + r * Math.sin(toRad(angle - 90)),
});

// Max radius for the chart
const MAX_R = SIZE / 2 - 36;

export default function RadarChart({ dimensions: scores, size = SIZE }) {
  const scale = size / SIZE;
  const cx = size / 2;
  const mr = size / 2 - 36 * scale;

  // Axis angles (evenly spaced)
  const angles = dimensions.map((_, i) => (360 / N) * i);

  // Grid polygons (levels)
  const gridPolygons = Array.from({ length: LEVELS }, (_, li) => {
    const r = (mr * (li + 1)) / LEVELS;
    const pts = angles.map((a) => {
      const p = point(a, r);
      return `${p.x * scale + (size - SIZE * scale) / 2},${p.y * scale + (size - SIZE * scale) / 2}`;
    });
    return pts.join(" ");
  });

  // Data polygon
  const dataPoints = dimensions.map((dim, i) => {
    const score = scores?.[dim.key]?.score || 0;
    const r = (score / 10) * mr;
    const p = point(angles[i], r);
    return {
      x: p.x * scale + (size - SIZE * scale) / 2,
      y: p.y * scale + (size - SIZE * scale) / 2,
      score: scores?.[dim.key]?.score || 0,
      label: dim.short,
    };
  });

  const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Axis label positions (slightly beyond the max radius)
  const labelPoints = dimensions.map((dim, i) => {
    const r = mr + 22 * scale;
    const p = point(angles[i], r);
    return {
      x: p.x * scale + (size - SIZE * scale) / 2,
      y: p.y * scale + (size - SIZE * scale) / 2,
      label: dim.short,
      score: scores?.[dim.key]?.score || 0,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid level polygons */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#f0effc"
          strokeWidth={1}
        />
      ))}

      {/* Axis lines */}
      {angles.map((angle, i) => {
        const outer = point(angle, mr);
        return (
          <line
            key={i}
            x1={cx}
            y1={cx}
            x2={outer.x * scale + (size - SIZE * scale) / 2}
            y2={outer.y * scale + (size - SIZE * scale) / 2}
            stroke="#e8e5fc"
            strokeWidth={1}
          />
        );
      })}

      {/* Data polygon fill */}
      <polygon
        points={polygonPoints}
        fill="#7F77DD"
        fillOpacity={0.15}
        stroke="#7F77DD"
        strokeWidth={2}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4 * scale}
          fill="#7F77DD"
          stroke="#fff"
          strokeWidth={1.5}
        />
      ))}

      {/* Axis labels */}
      {labelPoints.map((p, i) => (
        <g key={i}>
          <text
            x={p.x}
            y={p.y - 5 * scale}
            textAnchor="middle"
            fontSize={10 * scale}
            fill="#888"
            fontFamily="sans-serif"
            fontWeight="500"
          >
            {p.label}
          </text>
          <text
            x={p.x}
            y={p.y + 8 * scale}
            textAnchor="middle"
            fontSize={11 * scale}
            fill="#7F77DD"
            fontFamily="sans-serif"
            fontWeight="700"
          >
            {p.score}/10
          </text>
        </g>
      ))}

      {/* Center score */}
      <text
        x={cx}
        y={cx - 6}
        textAnchor="middle"
        fontSize={22 * scale}
        fill="#1a1a1a"
        fontFamily="sans-serif"
        fontWeight="700"
      >
        {Math.round(
          (Object.values(scores || {}).reduce((s, d) => s + (d.score || 0), 0) /
            Math.max(1, Object.keys(scores || {}).length)) *
            10,
        )}
      </text>
      <text
        x={cx}
        y={cx + 12}
        textAnchor="middle"
        fontSize={10 * scale}
        fill="#aaa"
        fontFamily="sans-serif"
      >
        avg score
      </text>
    </svg>
  );
}
