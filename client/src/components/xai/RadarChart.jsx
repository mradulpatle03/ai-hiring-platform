import { useState, useEffect, useRef } from "react";

const SIZE = 280;
const CENTER = SIZE / 2;
const LEVELS = 4;

const dimensions = [
  { key: "technicalSkills", label: "Technical Skills", short: "Technical" },
  { key: "experienceDepth", label: "Experience Depth", short: "Experience" },
  { key: "projectImpact", label: "Project Impact", short: "Projects" },
  {
    key: "communicationClarity",
    label: "Communication Clarity",
    short: "Comms",
  },
  { key: "growthPotential", label: "Growth Potential", short: "Growth" },
];

const N = dimensions.length;
const toRad = (deg) => (deg * Math.PI) / 180;
const pt = (angle, r, cx = CENTER, offset = 0) => ({
  x: cx + r * Math.cos(toRad(angle - 90)) + offset,
  y: cx + r * Math.sin(toRad(angle - 90)) + offset,
});

// Signal token hex values (CSS vars unavailable inside SVG fill/stroke attrs)
const getColor = (score) => {
  if (score >= 8)
    return { fill: "#1D8A4E", light: "rgba(29,138,78,0.08)", text: "#1D8A4E" }; // --success
  if (score >= 6)
    return { fill: "#4D7CFF", light: "rgba(77,124,255,0.08)", text: "#4D7CFF" }; // --wire
  if (score >= 4)
    return { fill: "#B07A0E", light: "rgba(176,122,14,0.08)", text: "#B07A0E" }; // --warning
  return { fill: "#FF4D2E", light: "rgba(255,77,46,0.08)", text: "#FF4D2E" }; // --signal
};

const lerp = (a, b, t) => a + (b - a) * t;
const lerpPoint = (p1, p2, t) => ({
  x: lerp(p1.x, p2.x, t),
  y: lerp(p1.y, p2.y, t),
});

export default function RadarChart({
  dimensions: scores,
  size = SIZE,
  overallScore,
}) {
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const duration = 900;
    const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

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

  const fullDataPoints = dimensions.map((dim, i) => {
    const score = scores?.[dim.key]?.score || 0;
    const r = (score / 10) * mr;
    return pt(angles[i], r);
  });

  const animDataPoints = fullDataPoints.map((p) =>
    lerpPoint({ x: CENTER, y: CENTER }, p, progress),
  );

  const toSvgPts = animDataPoints.map((p) => toSvg(p));
  const polygonPoints = toSvgPts.map((p) => `${p.x},${p.y}`).join(" ");

  const gridPolygons = Array.from({ length: LEVELS }, (_, li) => {
    const r = (mr * (li + 1)) / LEVELS;
    return angles
      .map((a) => {
        const p = toSvg(pt(a, r));
        return `${p.x},${p.y}`;
      })
      .join(" ");
  });

  const labelData = dimensions.map((dim, i) => {
    const r = mr + 26 * scale;
    const p = toSvg(pt(angles[i], r));
    const score = scores?.[dim.key]?.score || 0;
    return {
      ...p,
      label: dim.short,
      fullLabel: dim.label,
      score,
      key: dim.key,
      index: i,
    };
  });

  const avg = (
    Object.values(scores || {}).reduce(
      (sum, item) => sum + (Number(item?.score) || 0),
      0,
    ) / Math.max(Object.keys(scores || {}).length, 1)
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
            <stop offset="0%" stopColor="#4D7CFF" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#4D7CFF" stopOpacity="0.03" />
          </radialGradient>
        </defs>

        {/* Background grid */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill={i % 2 === 0 ? "rgba(11,14,20,0.06)" : "none"}
            stroke="rgba(11,14,20,0.25)"
            strokeWidth={0.8}
          />
        ))}

        {/* Level value labels */}
        {/* {Array.from({ length: LEVELS }, (_, li) => {
          const r = (mr * (li + 1)) / LEVELS;
          const p = toSvg(pt(0, r));
          return (
            <text
              key={li}
              x={p.x + 4}
              y={p.y + 3}
              fontSize={7.5 * scale}
              fill="#8A8D98"
              fontFamily="'JetBrains Mono', monospace"
              textAnchor="start"
            >
              {((li + 1) / LEVELS) * 10}
            </text>
          );
        })} */}

        {/* Axis lines */}
        {angles.map((angle, i) => {
          const outer = toSvg(pt(angle, mr));
          return (
            <line
              key={i}
              x1={cx}
              y1={cx}
              x2={outer.x}
              y2={outer.y}
              stroke={
                hovered === i ? "rgba(11,14,20,0.2)" : "rgba(11,14,20,0.08)"
              }
              strokeWidth={hovered === i ? 1.5 : 0.8}
              style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
            />
          );
        })}

        {/* Data polygon fill */}
        <polygon points={polygonPoints} fill="url(#radarGrad)" stroke="none" />

        {/* Data polygon border */}
        <polygon
          points={polygonPoints}
          fill="none"
          stroke="#4D7CFF"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />

        {/* Data point dots */}
        {toSvgPts.map((p, i) => {
          const score = dimensions[i]
            ? scores?.[dimensions[i].key]?.score || 0
            : 0;
          const c = getColor(score);
          const isHov = hovered === i;
          return (
            <g key={i}>
              {isHov && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={10 * scale}
                  fill={c.fill}
                  fillOpacity={0.12}
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHov ? 5.5 * scale : 4 * scale}
                fill={c.fill}
                stroke="#fff"
                strokeWidth={1.5}
                style={{ transition: "r 0.2s, fill 0.2s", cursor: "pointer" }}
                onMouseEnter={(e) => {
                  setHovered(i);
                  setTooltip({ index: i, x: p.x, y: p.y });
                }}
                onMouseLeave={() => {
                  setHovered(null);
                  setTooltip(null);
                }}
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
              onMouseEnter={() => {
                setHovered(i);
                setTooltip({ index: i, x: toSvgPts[i].x, y: toSvgPts[i].y });
              }}
              onMouseLeave={() => {
                setHovered(null);
                setTooltip(null);
              }}
            >
              <text
                x={p.x}
                y={p.y - 4 * scale}
                textAnchor="middle"
                fontSize={14 * scale}
                fill={isHov ? "#0B0E14" : "#5C5F6B"}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="600"
                style={{ transition: "fill 0.2s" }}
              >
                {p.label}
              </text>
              <rect
                x={p.x - 13 * scale}
                y={p.y + 6 * scale}
                width={26 * scale}
                height={14 * scale}
                fill={isHov ? c.light : "rgba(11,14,20,0.04)"}
                style={{ transition: "fill 0.2s" }}
              />
              <text
                x={p.x}
                y={p.y + 16 * scale}
                textAnchor="middle"
                fontSize={14 * scale}
                fill={isHov ? c.fill : "#5C5F6B"}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="700"
                style={{ transition: "fill 0.2s" }}
              >
                {p.score}
              </text>
            </g>
          );
        })}

        {/* Center score — square, ink background */}
        <rect
          x={cx - 26 * scale}
          y={cx - 26 * scale}
          width={52 * scale}
          height={52 * scale}
          fill="#0B0E14"
        />
        <text
          x={cx}
          y={cx - 4 * scale}
          textAnchor="middle"
          fontSize={19 * scale}
          fill="#C8FF4D"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
        >
          {(avg * progress).toFixed(1)}
        </text>
        <text
          x={cx}
          y={cx + 10 * scale}
          textAnchor="middle"
          fontSize={12 * scale}
          fill="#c4c5cb"
          fontFamily="'JetBrains Mono', monospace"
          letterSpacing="0.08em"
        >
          AVG
        </text>

        {/* Tooltip */}
        {tooltip !== null &&
          (() => {
            const idx = tooltip.index;
            const dim = dimensions[idx];
            const score = scores?.[dim?.key]?.score || 0;
            const c = getColor(score);
            const reasoning = scores?.[dim?.key]?.reasoning || "";
            const short = reasoning;
            const tw = 220 * scale;
            const th = 90 * scale;
            let tx = tooltip.x - tw / 2;
            let ty = tooltip.y - th - 10 * scale;
            tx = Math.max(4, Math.min(tx, size - tw - 4));
            ty = Math.max(4, ty);

            return (
              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={tx}
                  y={ty}
                  width={tw}
                  height={th}
                  rx={8}
                  fill="#0B0E14"
                  style={{
                    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))",
                  }}
                />
                <text
                  x={tx + tw / 2}
                  y={ty + 11 * scale}
                  textAnchor="middle"
                  fontSize={12 * scale}
                  fill={c.fill}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="700"
                >
                  {dim?.label} · {score}/10
                </text>
                {short && (
                  <foreignObject
                    x={tx + 8 * scale}
                    y={ty + 22 * scale}
                    width={tw - 16 * scale}
                    height={th - 28 * scale}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      style={{
                        fontSize: `${11 * scale}px`,
                        color: "#D5D8E0",
                        lineHeight: 1.4,
                        fontFamily: "Inter, sans-serif",
                        overflow: "hidden",
                      }}
                    >
                      {reasoning}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })()}
      </svg>
    </div>
  );
}
