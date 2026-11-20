# Design System — SNAP! STUDIO

## Visual World

**Cozy Vintage Polaroid & Contact Folio** — Combines the crisp editorial architecture of 1960s analog contact-sheet proofing tables with warm, charming Polaroid studio warmth: creamy archival paper, cocoa-espresso proofing mats, vintage strawberry-rose accents, blush washi tape, pastel paper stocks, and the interactive purring studio cat mascot.

## Color Palette

| Role | Token | Hex | Usage |
|---|---|---|---|
| Archival Ground | `--paper-archival` | `#F6F0E8` | Primary page canvas, header rail, light editorial sections |
| Bright Print Stock | `--paper-bright` | `#FCF9F4` | Interactive cut buttons, cards, archival inputs |
| Warm Mat Surface | `--paper-warm` | `#EDE3D6` | Secondary trays, preset chips, colophon footer |
| Polaroid Paper | `--paper-polaroid` | `#FDFBF7` | Physical Polaroid frames and photo strips |
| Cocoa Proofing Mat | `--slate-darkroom` | `#2B2220` | Contact mats, darkroom lab band, active button fills, camera chassis |
| Darkroom Elevated | `--slate-elevated` | `#362B28` | Filter controls on dark grounds, companion pill, camera bezels |
| Darkroom Hairline | `--slate-hairline` | `#4D3F3B` | Dividers inside darkroom bands and contact mats |
| Primary Ink | `--ink-primary` | `#2A211F` | Headlines, borders, primary labels |
| Secondary Ink | `--ink-secondary` | `#534541` | Body copy and descriptions |
| Muted Technical Ink | `--ink-muted` | `#7D6B65` | Technical specs, timestamps, film indices |
| Vintage Strawberry-Rose | `--vermilion` | `#D4556B` | Shutter release, primary CTAs, crop marks, active accent |
| Strawberry-Rose Hover | `--vermilion-hover` | `#BC4258` | Primary CTA hover state |
| Soft Blush | `--vermilion-soft` | `#FAE4E8` | Companion avatar ground, subtle hover tint, text selection |
| Honey Exposure Index | `--amber-index` | `#E6AD52` | Film-edge frame indices (`01A`–`04A`), optical reticle |
| Matcha Armed Indicator | `--emerald-ready` | `#5C9976` | Camera live/armed status LED |

## Typography

- **Display (`--font-display`):** `Antonio` (weights 500–700, uppercase, tight leading `0.93`–`1.05`, tracking `-0.02em`) — editorial headlines, view titles, cut names.
- **Body (`--font-body`):** `Libre Franklin` (weights 400–700, 15–17px, line-height `1.6`, max measure `56ch`–`65ch`) — descriptions, workflow explanations, empty-state guidance.
- **Technical / Metadata (`--font-mono`):** `Courier Prime` (weights 400 & 700, tabular numerals via `.tabular`) — exposure counters, timestamps, ISO specs, nav links, mechanical camera controls.
- **Polaroid Chin Notes (`--font-hand`):** `Reenie Beanie` — handwritten inscriptions along the bottom chin of Polaroid prints and photo strips.

## Surfaces, Borders & Depth

- **UI Chrome:** Sharp `2px`–`4px` radii with crisp `1px`–`1.5px` solid ink rules (`#161513` or `#C9C2B6`). No glassmorphism, no decorative gradients, no hard neobrutalist offset shadows.
- **Physical Prints:** Polaroid frames and photo strips carry generous bottom chins, authentic paper borders, subtle desk tilt (`-2deg` to `+3.2deg` on desktop, straightened on hover and mobile), and soft multi-layer contact shadows (`--shadow-print`, `--shadow-print-dark`).
- **Browser Surfaces:** Custom `::selection` in vermilion/paper-bright, vermilion `caret-color`, `:focus-visible` vermilion outline, custom archival scrollbars, and `tabular-nums` on all counters.

## Core Views & Layout Architecture

1. **Landing (`Landing.jsx` · Persuade):** Sticky 68px hairline rail; asymmetric 2-column first viewport (archival left sheet with live 4-cut selector + darkroom slate right contact mat with interactive Polaroid strip & paper stock swatches); horizontal film-format specification ledger (`#formats`); darkroom film-stock proofing lab with live 8-filter preview & 3-stage ritual (`#darkroom`); local keepsake archive (`#album`).
2. **Booth (`Booth.jsx` · Operate):** Preserved 3-column studio desk — Left: live developing Contact Strip Proof on darkroom slate; Center: anodized Model 74 vintage camera with optical viewfinder, reticle, live OSD, W/T zoom rocker, film-stock cycler, flash toggle, D-pad, and shutter bar; Right: 4-stage Exposure Telemetry card (`STANDBY` → `ARMED` → `EXPOSING` → `PRINT READY`) + Latest Instant Polaroid print tray.
3. **Editor (`Editor.jsx` · Operate):** 2-column Darkroom Proofing layout — darkroom slate proofing mat with interactive sticker canvas on the left; Film Stocks, Paper Stocks, Chin Inscription, and Stamps & Markers panels on the right; high-resolution PNG export, local album save, and Web Share modal.
4. **Gallery (`Gallery.jsx` · Experience/Operate):** Local Archive grid displaying saved prints mounted on darkroom slate mats with download and delete controls.

## Motion

- **Authored Moments:** Shutter flash (`shutterFlash` 0.36s), Polaroid chemical development reveal (`printDevelop` 0.65s exponential ease-out), crisp view transition (`viewFadeIn` 0.28s), and blinking viewfinder REC indicator. All animations honor `prefers-reduced-motion: reduce`.
