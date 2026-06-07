import { useState, useEffect, useRef } from "react";

const SIZE = 280;
const CENTER = SIZE / 2;
const LEVELS = 4;

const dimensions = [
  { key: "technicalSkills",      label: "Technical Skills",       short: "Technical"  },
  { key: "experienceDepth",      label: "Experience Depth",       short: "Experience" },
  { key: "projectImpact",        label: "Project Impact",         short: "Projects"   },
  { key: "communicationClarity", label: "Communication Clarity",  short: "Comms"      },
  { key: "growthPotential",      label: "Growth Potential",       short: "Growth"     },
];

const N = dimensions.length;
const toRad = (deg) => (deg * Math.PI) / 180;
const pt = (angle, r, cx = CENTER, offset = 0) => ({
  x: cx + r * Math.cos(toRad(angle - 90)) + offset,
  y: cx + r * Math.sin(toRad(angle - 90)) + offset,
});

const getColor = (score) => {
  if (score >= 8) return { fill: "#1D9E75", light: "#E1F5EE", text: "#085041" };
  if (score >= 6) return { fill: "#7F77DD", light: "#EEEDFE", text: "#3C3489" };
  if (score >= 4) return { fill: "#EF9F27", light: "#FAEEDA", text: "#633806" };
  return { fill: "#E24B4A", light: "#FCEBEB", text: "#791F1F" };
};

const lerp = (a, b, t) => a + (b - a) * t;
const lerpPoint = (p1, p2, t) => ({ x: lerp(p1.x, p2.x, t), y: lerp(p1.y, p2.y, t) });

export default function RadarChart({ dimensions: scores, size = SIZE, overallScore }) {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const duration = 900;
    const ease = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / duration, 1);
      setProgress(ease(t));
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const scale = size / SIZE;
  const cx = size / 2;
  const mr = size / 2 - 40 * scale;
  const offset = (size - SIZE * scale) / 2;
  const angles = dimensions.map((_, i) => (360 / N) * i);

  const toSvg = (p) => ({
    x: p.x * scale + offset,
    y: p.y * scale + offset,
  });

  // Full data points (score-based)
  const fullDataPoints = dimensions.map((dim, i) => {
    const score = scores?.[dim.key]?.score || 0;
    const r = (score / 10) * mr;
    return pt(angles[i], r);
  });

  // Animated: lerp from center to actual points
  const animDataPoints = fullDataPoints.map((p) =>
    lerpPoint({ x: CENTER, y: CENTER }, p, progress)
  );

  const toSvgPts = animDataPoints.map((p) => toSvg(p));
  const polygonPoints = toSvgPts.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid polygons
  const gridPolygons = Array.from({ length: LEVELS }, (_, li) => {
    const r = (mr * (li + 1)) / LEVELS;
    return angles
      .map((a) => {
        const p = toSvg(pt(a, r));
        return `${p.x},${p.y}`;
      })
      .join(" ");
  });

  // Labels (beyond max radius)
  const labelData = dimensions.map((dim, i) => {
    const r = mr + 26 * scale;
    const p = toSvg(pt(angles[i], r));
    const score = scores?.[dim.key]?.score || 0;
    return { ...p, label: dim.short, fullLabel: dim.label, score, key: dim.key, index: i };
  });

  const avg =
    overallScore ??
    +(
      Object.values(scores || {}).reduce((s, d) => s + (d.score || 0), 0) /
      Math.max(1, Object.keys(scores || {}).length)
    ).toFixed(1);

  const avgColor = getColor(avg);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7F77DD" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7F77DD" stopOpacity="0.04" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background grid */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill={i % 2 === 0 ? "rgba(127,119,221,0.03)" : "none"}
            stroke="#ede9fe"
            strokeWidth={0.8}
          />
        ))}

        {/* Level value labels on one axis */}
        {Array.from({ length: LEVELS }, (_, li) => {
          const r = (mr * (li + 1)) / LEVELS;
          const p = toSvg(pt(0, r));
          return (
            <text
              key={li}
              x={p.x + 4}
              y={p.y + 3}
              fontSize={7.5 * scale}
              fill="#ccc"
              fontFamily="sans-serif"
              textAnchor="start"
            >
              {((li + 1) / LEVELS) * 10}
            </text>
          );
        })}

        {/* Axis lines */}
        {angles.map((angle, i) => {
          const outer = toSvg(pt(angle, mr));
          return (
            <line
              key={i}
              x1={cx} y1={cx}
              x2={outer.x} y2={outer.y}
              stroke={hovered === i ? "#c4c0f5" : "#ede9fe"}
              strokeWidth={hovered === i ? 1.5 : 0.8}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
          );
        })}

        {/* Data polygon fill */}
        <polygon
          points={polygonPoints}
          fill="url(#radarGrad)"
          stroke="none"
        />

        {/* Data polygon border */}
        <polygon
          points={polygonPoints}
          fill="none"
          stroke="#7F77DD"
          strokeWidth={1.8}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 3px rgba(127,119,221,0.4))" }}
        />

        {/* Data point dots */}
        {toSvgPts.map((p, i) => {
          const score = dimensions[i] ? scores?.[dimensions[i].key]?.score || 0 : 0;
          const c = getColor(score);
          const isHov = hovered === i;
          return (
            <g key={i}>
              {isHov && (
                <circle
                  cx={p.x} cy={p.y}
                  r={10 * scale}
                  fill={c.fill}
                  fillOpacity={0.15}
                />
              )}
              <circle
                cx={p.x} cy={p.y}
                r={isHov ? 5.5 * scale : 4 * scale}
                fill={c.fill}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ transition: "r 0.2s, fill 0.2s", cursor: "pointer" }}
                onMouseEnter={(e) => {
                  setHovered(i);
                  setTooltip({ index: i, x: p.x, y: p.y });
                }}
                onMouseLeave={() => { setHovered(null); setTooltip(null); }}
              />
            </g>
          );
        })}

        {/* Axis labels */}
        {labelData.map((p, i) => {
          const c = getColor(p.score);
          const isHov = hovered === i;
          return (
            <g
              key={i}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => { setHovered(i); setTooltip({ index: i, x: toSvgPts[i].x, y: toSvgPts[i].y }); }}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
            >
              <text
                x={p.x}
                y={p.y - 4 * scale}
                textAnchor="middle"
                fontSize={9.5 * scale}
                fill={isHov ? "#555" : "#999"}
                fontFamily="sans-serif"
                fontWeight="500"
                style={{ transition: "fill 0.2s" }}
              >
                {p.label}
              </text>
              <rect
                x={p.x - 14 * scale}
                y={p.y + 6 * scale}
                width={28 * scale}
                height={14 * scale}
                rx={4 * scale}
                fill={isHov ? c.light : "#f7f5ff"}
                style={{ transition: "fill 0.2s" }}
              />
              <text
                x={p.x}
                y={p.y + 16 * scale}
                textAnchor="middle"
                fontSize={9.5 * scale}
                fill={isHov ? c.fill : "#7F77DD"}
                fontFamily="sans-serif"
                fontWeight="700"
                style={{ transition: "fill 0.2s" }}
              >
                {p.score}
              </text>
            </g>
          );
        })}

        {/* Center score */}
        <circle cx={cx} cy={cx} r={28 * scale} fill="#fff" stroke="#ede9fe" strokeWidth={1} />
        <text
          x={cx} y={cx - 5 * scale}
          textAnchor="middle"
          fontSize={20 * scale}
          fill={avgColor.fill}
          fontFamily="sans-serif"
          fontWeight="700"
        >
          {(avg * progress).toFixed(1)}
        </text>
        <text
          x={cx} y={cx + 10 * scale}
          textAnchor="middle"
          fontSize={8 * scale}
          fill="#bbb"
          fontFamily="sans-serif"
        >
          avg score
        </text>

        {/* Tooltip */}
        {tooltip !== null && (() => {
          const idx = tooltip.index;
          const dim = dimensions[idx];
          const score = scores?.[dim?.key]?.score || 0;
          const c = getColor(score);
          const reasoning = scores?.[dim?.key]?.reasoning || "";
          const short = reasoning.length > 60 ? reasoning.slice(0, 57) + "…" : reasoning;
          const tw = 110 * scale;
          const th = short ? 36 * scale : 22 * scale;
          let tx = tooltip.x - tw / 2;
          let ty = tooltip.y - th - 10 * scale;
          tx = Math.max(4, Math.min(tx, size - tw - 4));
          ty = Math.max(4, ty);

          return (
            <g style={{ pointerEvents: "none" }}>
              <rect
                x={tx} y={ty}
                width={tw} height={th}
                rx={5 * scale}
                fill={c.light}
                stroke={c.fill}
                strokeWidth={0.8}
              />
              <text
                x={tx + tw / 2} y={ty + 11 * scale}
                textAnchor="middle"
                fontSize={9 * scale}
                fill={c.text}
                fontFamily="sans-serif"
                fontWeight="700"
              >
                {dim?.label} · {score}/10
              </text>
              {short && (
                <text
                  x={tx + 6 * scale} y={ty + 24 * scale}
                  fontSize={7.5 * scale}
                  fill={c.text}
                  fontFamily="sans-serif"
                  fillOpacity={0.8}
                >
                  {short}
                </text>
              )}
            </g>
          );
        })()}
      </svg>
    </div>
  );
}