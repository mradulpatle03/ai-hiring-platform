// Signal design system — shared tokens for inline styles.
// Import this anywhere instead of hardcoding hex values, so the whole
// app stays visually consistent and re-themeable from one place.

export const color = {
  ink: "#0B0E14",
  ink2: "#12161F",
  ink3: "#1B202C",
  paper: "#F7F5EF",
  paper2: "#EFECE3",
  paper3: "#E5E1D4",

  signal: "#FF4D2E",
  signalDim: "#E0431F",
  volt: "#C8FF4D",
  wire: "#4D7CFF",
  graphite: "#5C5F6B",
  graphiteDim: "#8A8D98",

  line: "rgba(255,255,255,0.08)",
  lineLight: "rgba(11,14,20,0.10)",
  lineLightStrong: "rgba(11,14,20,0.20)",

  success: "#1D8A4E",
  warning: "#B07A0E",
  danger: "#FF4D2E",

  white: "#FFFFFF",
};

export const font = {
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', monospace",
};

export const radius = {
  sm: 2,
  md: 4,
};

// Score tier coloring — used everywhere a 0-100 AI score is displayed
export const scoreTier = (score) => {
  if (score == null) return { color: color.graphiteDim, label: "—" };
  if (score >= 75) return { color: color.success, label: "Strong" };
  if (score >= 50) return { color: color.warning, label: "Fair" };
  return { color: color.signal, label: "Weak" };
};

// Reusable style fragments
export const panel = {
  background: color.white,
  border: `1px solid ${color.lineLight}`,
  borderRadius: radius.md,
};

export const panelDark = {
  background: color.ink,
  border: `1px solid ${color.line}`,
  color: color.white,
  borderRadius: radius.md,
};

export const labelStyle = {
  fontFamily: font.mono,
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: color.graphite,
};

export const monoStyle = { fontFamily: font.mono };
export const displayStyle = { fontFamily: font.display, letterSpacing: "-0.02em" };