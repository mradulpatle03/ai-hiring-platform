import { color, font, scoreTier } from "../styles/theme";

export default function ScoreBadge({ score }) {
  if (score == null)
    return (
      <span
        style={{
          fontFamily: font.mono,
          fontSize: "11px",
          color: color.graphiteDim,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        pending…
      </span>
    );

  const tier = scoreTier(score);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "2px",
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: "18px",
        color: tier.color,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      {score}
      <span
        style={{
          fontFamily: font.mono,
          fontSize: "10px",
          fontWeight: 600,
          color: color.graphiteDim,
          letterSpacing: "0.02em",
        }}
      >
        /100
      </span>
    </span>
  );
}
