import { color, font, scoreTier } from "../styles/theme";

export default function ScoreBadge({ score }) {
  if (score == null)
    return (
      <span
        style={{
          fontFamily: font.mono,
          fontSize: "11px",
          color: color.graphiteDim,
          letterSpacing: "0.02em",
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
        gap: "3px",
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: "16px",
        color: tier.color,
        letterSpacing: "-0.01em",
      }}
    >
      {score}
      <span
        style={{
          fontFamily: font.mono,
          fontSize: "10px",
          fontWeight: 600,
          color: color.graphiteDim,
        }}
      >
        /100
      </span>
    </span>
  );
}