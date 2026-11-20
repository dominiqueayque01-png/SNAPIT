/**
 * Curated editor typography and color presets grounded in SNAP! STUDIO's design system.
 */

export const EDITOR_FONTS = [
  {
    id: "antonio",
    label: "Antonio",
    family: "Antonio",
    role: "Condensed Editorial Display",
    sample: "SNAP! 74"
  },
  {
    id: "libre-franklin",
    label: "Libre Franklin",
    family: "Libre Franklin",
    role: "Clean Sans Caption",
    sample: "Studio Proof"
  },
  {
    id: "courier-prime",
    label: "Courier Prime",
    family: "Courier Prime",
    role: "Analog Typewriter & Date",
    sample: "2026.11.19"
  },
  {
    id: "reenie-beanie",
    label: "Reenie Beanie",
    family: "Reenie Beanie",
    role: "Handwritten Polaroid Chin",
    sample: "sweet memories"
  }
];

export const TEXT_PRESETS = [
  {
    id: "preset-headline",
    label: "Editorial Stamp",
    text: "SNAP! STUDIO",
    fontFamily: "Antonio",
    fontSize: 56,
    fill: "#2a211f",
    fontStyle: "bold",
    letterSpacing: 3,
    align: "center"
  },
  {
    id: "preset-hand",
    label: "Polaroid Note",
    text: "sweet sunday memories",
    fontFamily: "Reenie Beanie",
    fontSize: 52,
    fill: "#2a211f",
    fontStyle: "normal",
    letterSpacing: 1,
    align: "center"
  },
  {
    id: "preset-date",
    label: "Film Date Code",
    text: new Date().toISOString().slice(0, 10).replace(/-/g, ".") + " · ISO 640",
    fontFamily: "Courier Prime",
    fontSize: 22,
    fill: "#e6ad52",
    fontStyle: "bold",
    letterSpacing: 2,
    align: "left"
  },
  {
    id: "preset-caption",
    label: "Clean Subtitle",
    text: "Captured locally in browser",
    fontFamily: "Libre Franklin",
    fontSize: 26,
    fill: "#fdfbf7",
    fontStyle: "normal",
    letterSpacing: 0.5,
    align: "center"
  }
];

export const EDITOR_COLOR_SWATCHES = [
  "#2a211f",
  "#fdfbf7",
  "#d4556b",
  "#e6ad52",
  "#5c9976",
  "#5d6fa8",
  "#8b65a8",
  "#b84336",
  "#7d6b65",
  "#f6d8df"
];

export const BACKDROP_SWATCHES = [
  { id: "archival-cream", label: "Archival Cream", color: "#fdfbf7" },
  { id: "warm-paper", label: "Warm Paper", color: "#f6f0e8" },
  { id: "blush-rose", label: "Blush Rose", color: "#fbe3e8" },
  { id: "butter-cream", label: "Butter Cream", color: "#fbf0cf" },
  { id: "matcha-mint", label: "Matcha Mint", color: "#dfeee5" },
  { id: "sweet-lilac", label: "Sweet Lilac", color: "#ece4f7" },
  { id: "powder-blue", label: "Powder Blue", color: "#dfeef7" },
  { id: "espresso-film", label: "Espresso Film", color: "#261e1c" }
];
