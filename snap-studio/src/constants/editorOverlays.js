/**
 * Reusable photographic overlays (film grain, light leaks, vignette, dust, date stamp).
 * Multiple overlays can be toggled simultaneously with shared or per-layer intensity.
 */

export const EDITOR_OVERLAYS = [
  {
    id: "film-grain",
    name: "Fine Film Grain",
    description: "Subtle silver-halide emulsion texture",
    swatch: "radial-gradient(circle, #8d7f78 1px, #2b2220 1px)"
  },
  {
    id: "warm-leak",
    name: "Golden Light Leak",
    description: "Warm amber & tangerine edge burn",
    swatch: "linear-gradient(125deg, rgba(235,146,52,0.85), rgba(212,85,107,0.35), transparent)"
  },
  {
    id: "rose-leak",
    name: "Rose Prism Leak",
    description: "Soft strawberry-rose diagonal glow",
    swatch: "linear-gradient(45deg, rgba(212,85,107,0.8), rgba(244,182,194,0.4), transparent)"
  },
  {
    id: "vignette",
    name: "Analog Lens Vignette",
    description: "Gentle warm darkened corners",
    swatch: "radial-gradient(circle, #f6f0e8 30%, #2b2220 100%)"
  },
  {
    id: "dust-scratches",
    name: "Archival Dust",
    description: "Delicate darkroom specs & fine lines",
    swatch: "linear-gradient(135deg, #362b28, #534541)"
  },
  {
    id: "date-stamp",
    name: "Quartz Date Stamp",
    description: "Classic glowing orange camera date",
    swatch: "linear-gradient(135deg, #2b2220 40%, #e67e22 100%)"
  }
];
