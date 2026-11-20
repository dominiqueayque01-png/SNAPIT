---
version: 1
slug: "snap-studio-src-pages-landing-jsx"
primary_target: "snap-studio/src/pages/Landing.jsx"
related_targets: ["snap-studio/src/pages/Booth.jsx","snap-studio/src/pages/Editor.jsx","snap-studio/src/pages/Gallery.jsx"]
---

# Surface Brief: SNAP! STUDIO (Landing, Booth, Editor, Gallery)

- **Scope:** Full redesign of `Landing.jsx` (Persuade), `Booth.jsx` (Operate — preserving the 3-column desk concept), `Editor.jsx` (Operate), and `Gallery.jsx` (Experience/Operate) in `snap-studio/`.
- **Audience & Job:** Personal creative journalers and analog photography fans shooting, developing, and keeping instant-style Polaroid strips privately in their browser with zero server uploads.
- **Preserved Constraints:** 3-column Booth desk layout (live strip left, tactile vintage camera center, latest instant Polaroid print right); 4 capture modes (`single`, `strip-3`, `strip-4`, `grid-4`), 8 film filters, 7 frame stocks, custom captions, drag/rotate/resize stickers, PNG/Print/QR export, local album. Cat mascot (`2.png`) and cute pastel scrapbook tone removed.

## Direction contract

- **THESIS:** SNAP! STUDIO is an archival silver-halide proofing folio and Polaroid contact desk—refusing both kawaii pastel scrapbook booths and generic SaaS hero templates.
- **OWN-WORLD:** Matte archival stock (`#EFECE5`) paired with deep darkroom slate (`#161513`), grease-pencil vermilion (`#B83227`), silver-halide graphite (`#7A746B`), warm paper whites (`#F7F4ED`), and brass-amber exposure indices (`#D4A24C`). Display typography in `Antonio` (uppercase condensed), body in `Libre Franklin`, technical exposure metadata in `Courier Prime`, and handwritten Polaroid chin notes in `Reenie Beanie`. Hairline 1.5px ink rules, realistic contact shadows on physical prints, grease-pencil crop marks, and tactile hardware controls.
- **STORY:** Visitors immediately feel the quiet craft of an analog proofing table, test real film cuts and film stocks live on the contact mat, trust the zero-upload local privacy, and step straight into the 3-column Booth desk to shoot, decorate, and archive their prints.
- **FIRST VIEWPORT:** Fixed 68px hairline top rail (`SNAP! STUDIO [NO. 04 · LOCAL]`, section anchors, vermilion `Enter Booth` CTA). Asymmetric 2-column proofing spread: left archival sheet with monumental `Antonio` display headline (`EXPOSE. DEVELOP. KEEP THE PRINT.`), concise lead, working 4-cut film format selector (`01A Single`, `03A 3-Cut`, `04A 4-Strip`, `04B 2×2 Grid`), vermilion `Open Camera Booth` CTA, and local-privacy spec strip; right darkroom slate contact mat (`#161513`) with live-updating tilted Polaroid strip + single Polaroid print with vermilion crop mark and interactive frame-stock swatches.
- **FORM:** Silver-Halide Contact Folio (candidate 5 of 7), seed:bde0932c11e5a36e. Raised by declined challengers: mechanical frame-index countdowns, instant in-place live format switching, genuine paper thickness/chin captions, explicit exposure stages (armed → exposing → developing → print ready), and optical depth hierarchy.
- **FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
