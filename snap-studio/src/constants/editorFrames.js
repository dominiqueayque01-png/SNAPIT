/**
 * Reusable decorative Polaroid & analog frame definitions.
 * Rendered declaratively inside the Konva Frame layer at any canvas dimension.
 */

export const EDITOR_FRAMES = [
  {
    id: "none",
    name: "Full Bleed",
    subtitle: "No outer border",
    defaultColor: "#fdfbf7",
    textColor: "#2a211f",
    previewBg: "#ede3d6"
  },
  {
    id: "classic-polaroid",
    name: "Classic Polaroid",
    subtitle: "Archival cream + wide chin",
    defaultColor: "#fdfbf7",
    textColor: "#2a211f",
    previewBg: "#fdfbf7"
  },
  {
    id: "blush-polaroid",
    name: "Blush Polaroid",
    subtitle: "Rose border + stitched trim",
    defaultColor: "#fbe3e8",
    textColor: "#6e2938",
    previewBg: "#fbe3e8"
  },
  {
    id: "retro-film",
    name: "35mm Retro Film",
    subtitle: "Sprocket holes & amber code",
    defaultColor: "#241d1b",
    textColor: "#e6ad52",
    previewBg: "#241d1b"
  },
  {
    id: "vintage-viewfinder",
    name: "Camera Viewfinder",
    subtitle: "Reticle corners & ISO readout",
    defaultColor: "#2a211f",
    textColor: "#fdfbf7",
    previewBg: "#362b28"
  },
  {
    id: "pastel-double",
    name: "Pastel Double Rule",
    subtitle: "Butter cream & ink hairline",
    defaultColor: "#fbf0cf",
    textColor: "#4f3b14",
    previewBg: "#fbf0cf"
  },
  {
    id: "minimalist-mat",
    name: "Archival Gallery Mat",
    subtitle: "Clean museum bevel border",
    defaultColor: "#f6f0e8",
    textColor: "#2a211f",
    previewBg: "#f6f0e8"
  },
  {
    id: "scrapbook-washi",
    name: "Scrapbook Washi",
    subtitle: "Taped corners & Polaroid chin",
    defaultColor: "#fdfbf7",
    textColor: "#2a211f",
    previewBg: "#fae4e8"
  }
];

export const FRAME_COLOR_PRESETS = [
  { id: "cream", label: "Archival Cream", bg: "#fdfbf7", text: "#2a211f" },
  { id: "blush", label: "Blush Rose", bg: "#fbe3e8", text: "#6e2938" },
  { id: "butter", label: "Butter Cream", bg: "#fbf0cf", text: "#5e4618" },
  { id: "mint", label: "Matcha Mint", bg: "#dfeee5", text: "#234a35" },
  { id: "lilac", label: "Sweet Lilac", bg: "#ece4f7", text: "#463168" },
  { id: "blue", label: "Powder Blue", bg: "#dfeef7", text: "#21465e" },
  { id: "espresso", label: "Espresso Film", bg: "#261e1c", text: "#f7f1ea" }
];
