/**
 * Modular, extensible vector SVG sticker & decorative element library.
 * Organized into 10 categories; add new packs by appending to STICKER_PACKS.
 */
import { svgStringToDataUrl } from "../services/svgSanitizer";

function makeSvg(viewBox, body) {
  const [, , w, h] = viewBox.split(" ").map(Number);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w * 3}" height="${h * 3}">${body}</svg>`;
  return {
    dataUrl: svgStringToDataUrl(svg),
    width: w,
    height: h
  };
}

function item(id, label, viewBox, body) {
  const { dataUrl, width, height } = makeSvg(viewBox, body);
  return { id, label, src: dataUrl, width, height, isSvg: true };
}

export const EDITOR_STICKER_PACKS = [
  {
    id: "cute",
    label: "Cute Stickers",
    items: [
      item(
        "cute-ribbon",
        "Blush Ribbon",
        "0 0 120 90",
        `<path d="M60 44 C42 20 12 20 14 44 C16 64 42 58 60 46 Z" fill="#F4A5B5" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>
         <path d="M60 44 C78 20 108 20 106 44 C104 64 78 58 60 46 Z" fill="#F4A5B5" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>
         <path d="M54 50 L36 80 L48 76 L58 54" fill="#E8869B" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>
         <path d="M66 50 L84 80 L72 76 L62 54" fill="#E8869B" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>
         <circle cx="60" cy="45" r="9" fill="#D4556B" stroke="#2A211F" stroke-width="3.5"/>`
      ),
      item(
        "cute-strawberry",
        "Sweet Berry",
        "0 0 100 110",
        `<path d="M50 96 C26 88 18 58 24 38 C28 26 72 26 76 38 C82 58 74 88 50 96 Z" fill="#E66478" stroke="#2A211F" stroke-width="3.5"/>
         <path d="M32 32 C38 20 46 28 50 18 C54 28 62 20 68 32 C60 36 40 36 32 32 Z" fill="#6AA882" stroke="#2A211F" stroke-width="3" stroke-linejoin="round"/>
         <circle cx="38" cy="52" r="2.6" fill="#FDFBF7"/><circle cx="52" cy="48" r="2.6" fill="#FDFBF7"/><circle cx="63" cy="55" r="2.6" fill="#FDFBF7"/>
         <circle cx="43" cy="68" r="2.6" fill="#FDFBF7"/><circle cx="57" cy="70" r="2.6" fill="#FDFBF7"/><circle cx="50" cy="82" r="2.6" fill="#FDFBF7"/>`
      ),
      item(
        "cute-cherries",
        "Twin Cherries",
        "0 0 110 110",
        `<path d="M36 66 C42 36 58 24 68 18 C64 36 72 52 76 64" fill="none" stroke="#5C8F70" stroke-width="4" stroke-linecap="round"/>
         <path d="M68 18 C82 14 92 22 86 32 C76 34 70 28 68 18 Z" fill="#77B08C" stroke="#2A211F" stroke-width="3"/>
         <circle cx="34" cy="76" r="20" fill="#D4556B" stroke="#2A211F" stroke-width="3.5"/>
         <circle cx="74" cy="78" r="20" fill="#C44259" stroke="#2A211F" stroke-width="3.5"/>
         <circle cx="28" cy="68" r="4" fill="#FDFBF7" opacity="0.8"/>
         <circle cx="68" cy="70" r="4" fill="#FDFBF7" opacity="0.8"/>`
      ),
      item(
        "cute-kitty",
        "Studio Kitty",
        "0 0 110 105",
        `<path d="M24 44 L20 16 L44 30 C52 28 58 28 66 30 L90 16 L86 44 C94 56 92 78 76 88 C62 96 48 96 34 88 C18 78 16 56 24 44 Z" fill="#FDFBF7" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>
         <circle cx="42" cy="58" r="3.5" fill="#2A211F"/><circle cx="68" cy="58" r="3.5" fill="#2A211F"/>
         <ellipse cx="32" cy="66" rx="6" ry="3.5" fill="#F4A5B5"/><ellipse cx="78" cy="66" rx="6" ry="3.5" fill="#F4A5B5"/>
         <path d="M49 65 Q55 71 61 65" fill="none" stroke="#2A211F" stroke-width="3" stroke-linecap="round"/>
         <line x1="12" y1="60" x2="26" y2="62" stroke="#2A211F" stroke-width="2.5" stroke-linecap="round"/>
         <line x1="98" y1="60" x2="84" y2="62" stroke="#2A211F" stroke-width="2.5" stroke-linecap="round"/>`
      ),
      item(
        "cute-cloud",
        "Cozy Cloud",
        "0 0 130 90",
        `<path d="M32 72 H98 C110 72 118 63 118 52 C118 42 110 34 100 34 C96 20 82 14 68 18 C58 10 40 16 38 30 C24 30 14 40 14 52 C14 64 22 72 32 72 Z" fill="#FDFBF7" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>
         <circle cx="52" cy="48" r="3" fill="#2A211F"/><circle cx="78" cy="48" r="3" fill="#2A211F"/>
         <path d="M58 55 Q65 62 72 55" fill="none" stroke="#D4556B" stroke-width="3" stroke-linecap="round"/>`
      )
    ]
  },
  {
    id: "doodles",
    label: "Doodles",
    items: [
      item(
        "doodle-arrow",
        "Curved Arrow",
        "0 0 130 80",
        `<path d="M16 62 C36 22 78 18 110 36" fill="none" stroke="#2A211F" stroke-width="4" stroke-linecap="round"/>
         <path d="M96 22 L114 38 L92 46" fill="none" stroke="#2A211F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
      ),
      item(
        "doodle-squiggle",
        "Wavy Underline",
        "0 0 160 44",
        `<path d="M10 24 Q25 8 40 24 T70 24 T100 24 T130 24 T150 24" fill="none" stroke="#D4556B" stroke-width="5" stroke-linecap="round"/>`
      ),
      item(
        "doodle-loop",
        "Swirl Loop",
        "0 0 140 70",
        `<path d="M12 46 C36 46 54 14 70 24 C86 34 62 56 54 40 C46 24 88 18 126 32" fill="none" stroke="#E6AD52" stroke-width="4.5" stroke-linecap="round"/>`
      ),
      item(
        "doodle-bubble",
        "Note Bubble",
        "0 0 130 96",
        `<path d="M22 14 H108 C116 14 120 20 120 28 V60 C120 68 114 72 106 72 H52 L30 88 L34 72 H22 C14 72 10 66 10 58 V28 C10 20 14 14 22 14 Z" fill="#FDFBF7" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>`
      ),
      item(
        "doodle-burst",
        "Accent Rays",
        "0 0 100 100",
        `<line x1="50" y1="12" x2="50" y2="30" stroke="#D4556B" stroke-width="4.5" stroke-linecap="round"/>
         <line x1="50" y1="70" x2="50" y2="88" stroke="#D4556B" stroke-width="4.5" stroke-linecap="round"/>
         <line x1="12" y1="50" x2="30" y2="50" stroke="#D4556B" stroke-width="4.5" stroke-linecap="round"/>
         <line x1="70" y1="50" x2="88" y2="50" stroke="#D4556B" stroke-width="4.5" stroke-linecap="round"/>
         <line x1="23" y1="23" x2="36" y2="36" stroke="#E6AD52" stroke-width="4" stroke-linecap="round"/>
         <line x1="77" y1="23" x2="64" y2="36" stroke="#E6AD52" stroke-width="4" stroke-linecap="round"/>
         <line x1="23" y1="77" x2="36" y2="64" stroke="#E6AD52" stroke-width="4" stroke-linecap="round"/>
         <line x1="77" y1="77" x2="64" y2="64" stroke="#E6AD52" stroke-width="4" stroke-linecap="round"/>`
      )
    ]
  },
  {
    id: "hearts-stars",
    label: "Hearts & Stars",
    items: [
      item(
        "hs-heart",
        "Blush Heart",
        "0 0 110 100",
        `<path d="M55 88 C24 68 12 48 16 32 C20 16 38 14 55 30 C72 14 90 16 94 32 C98 48 86 68 55 88 Z" fill="#D4556B" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>
         <path d="M30 34 C32 26 40 24 46 28" fill="none" stroke="#FDFBF7" stroke-width="3.5" stroke-linecap="round"/>`
      ),
      item(
        "hs-double-heart",
        "Twin Hearts",
        "0 0 120 100",
        `<path d="M44 74 C24 60 16 46 19 35 C22 24 34 22 44 33 C54 22 66 24 69 35 C72 46 64 60 44 74 Z" fill="#F4A5B5" stroke="#2A211F" stroke-width="3"/>
         <path d="M78 84 C60 72 52 58 55 48 C58 38 69 36 78 46 C87 36 98 38 101 48 C104 58 96 72 78 84 Z" fill="#D4556B" stroke="#2A211F" stroke-width="3"/>`
      ),
      item(
        "hs-sparkle",
        "Four-Point Gleam",
        "0 0 100 100",
        `<path d="M50 8 Q54 46 92 50 Q54 54 50 92 Q46 54 8 50 Q46 46 50 8 Z" fill="#E6AD52" stroke="#2A211F" stroke-width="3.2" stroke-linejoin="round"/>`
      ),
      item(
        "hs-star-trio",
        "Star Cluster",
        "0 0 120 100",
        `<polygon points="44,14 50,32 68,32 54,43 59,61 44,50 29,61 34,43 20,32 38,32" fill="#E6AD52" stroke="#2A211F" stroke-width="3" stroke-linejoin="round"/>
         <polygon points="88,48 92,58 103,58 94,65 97,76 88,69 79,76 82,65 73,58 84,58" fill="#F4A5B5" stroke="#2A211F" stroke-width="2.5" stroke-linejoin="round"/>
         <circle cx="86" cy="24" r="5" fill="#FDFBF7" stroke="#2A211F" stroke-width="2.5"/>`
      ),
      item(
        "hs-moon",
        "Crescent Moon",
        "0 0 100 100",
        `<path d="M66 16 C40 16 20 36 20 60 C20 76 34 88 52 88 C68 88 80 78 84 64 C70 70 50 62 46 46 C43 34 52 22 66 16 Z" fill="#F7DC94" stroke="#2A211F" stroke-width="3.5" stroke-linejoin="round"/>`
      )
    ]
  },
  {
    id: "flowers",
    label: "Flowers",
    items: [
      item(
        "fl-daisy",
        "Pressed Daisy",
        "0 0 110 110",
        `<g fill="#FDFBF7" stroke="#2A211F" stroke-width="3">
          <ellipse cx="55" cy="26" rx="11" ry="18"/>
          <ellipse cx="55" cy="84" rx="11" ry="18"/>
          <ellipse cx="26" cy="55" rx="18" ry="11"/>
          <ellipse cx="84" cy="55" rx="18" ry="11"/>
          <ellipse cx="34" cy="34" rx="11" ry="17" transform="rotate(-45 34 34)"/>
          <ellipse cx="76" cy="76" rx="11" ry="17" transform="rotate(-45 76 76)"/>
          <ellipse cx="76" cy="34" rx="11" ry="17" transform="rotate(45 76 34)"/>
          <ellipse cx="34" cy="76" rx="11" ry="17" transform="rotate(45 34 76)"/>
         </g>
         <circle cx="55" cy="55" r="15" fill="#E6AD52" stroke="#2A211F" stroke-width="3"/>`
      ),
      item(
        "fl-sakura",
        "Blossom Petal",
        "0 0 110 110",
        `<g fill="#FBE3E8" stroke="#2A211F" stroke-width="2.8" stroke-linejoin="round">
          <path d="M55 55 C44 36 42 18 55 12 C68 18 66 36 55 55 Z"/>
          <path d="M55 55 C74 44 92 42 98 55 C92 68 74 66 55 55 Z"/>
          <path d="M55 55 C66 74 68 92 55 98 C42 92 44 74 55 55 Z"/>
          <path d="M55 55 C36 66 18 68 12 55 C18 42 36 44 55 55 Z"/>
         </g>
         <circle cx="55" cy="55" r="10" fill="#D4556B" stroke="#2A211F" stroke-width="2.8"/>`
      ),
      item(
        "fl-tulip",
        "Vintage Tulip",
        "0 0 100 120",
        `<line x1="50" y1="62" x2="50" y2="108" stroke="#5C8F70" stroke-width="4.5" stroke-linecap="round"/>
         <path d="M50 96 C32 90 28 74 34 68 C42 74 48 82 50 96 Z" fill="#77B08C" stroke="#2A211F" stroke-width="2.8"/>
         <path d="M50 66 C30 66 24 44 30 22 L42 36 L50 18 L58 36 L70 22 C76 44 70 66 50 66 Z" fill="#E67A8E" stroke="#2A211F" stroke-width="3.2" stroke-linejoin="round"/>`
      ),
      item(
        "fl-clover",
        "Lucky Clover",
        "0 0 110 110",
        `<g fill="#77B08C" stroke="#2A211F" stroke-width="3">
          <circle cx="55" cy="34" r="16"/><circle cx="55" cy="76" r="16"/>
          <circle cx="34" cy="55" r="16"/><circle cx="76" cy="55" r="16"/>
         </g>
         <circle cx="55" cy="55" r="6" fill="#DFEEE5"/>`
      )
    ]
  },
  {
    id: "vintage",
    label: "Vintage Decor",
    items: [
      item(
        "vin-stamp",
        "Air Mail Stamp",
        "0 0 120 140",
        `<rect x="10" y="10" width="100" height="120" rx="4" fill="#FDFBF7" stroke="#2A211F" stroke-width="3.5" stroke-dasharray="6 4"/>
         <rect x="20" y="20" width="80" height="100" fill="#FBE3E8" stroke="#D4556B" stroke-width="2"/>
         <circle cx="60" cy="64" r="22" fill="none" stroke="#2A211F" stroke-width="2.5"/>
         <text x="60" y="42" text-anchor="middle" font-family="Courier Prime, monospace" font-size="11" font-weight="700" fill="#2A211F">POSTAGE</text>
         <text x="60" y="69" text-anchor="middle" font-family="Antonio, sans-serif" font-size="18" font-weight="700" fill="#D4556B">74¢</text>
         <text x="60" y="108" text-anchor="middle" font-family="Courier Prime, monospace" font-size="10" fill="#2A211F">SNAP! AIR</text>`
      ),
      item(
        "vin-seal",
        "Wax Seal",
        "0 0 110 110",
        `<circle cx="55" cy="55" r="42" fill="#B84336" stroke="#2A211F" stroke-width="3"/>
         <circle cx="55" cy="55" r="32" fill="#D4556B" stroke="#7A2424" stroke-width="2"/>
         <path d="M55 68 C42 60 36 52 38 45 C40 38 48 37 55 44 C62 37 70 38 72 45 C74 52 68 60 55 68 Z" fill="#FDFBF7"/>`
      ),
      item(
        "vin-ticket",
        "Booth Ticket",
        "0 0 160 84",
        `<path d="M12 12 H148 V32 A10 10 0 0 0 148 52 V72 H12 V52 A10 10 0 0 0 12 32 Z" fill="#FBF0CF" stroke="#2A211F" stroke-width="3"/>
         <line x1="46" y1="16" x2="46" y2="68" stroke="#2A211F" stroke-width="2" stroke-dasharray="4 4"/>
         <text x="98" y="39" text-anchor="middle" font-family="Antonio, sans-serif" font-size="20" font-weight="700" fill="#2A211F">ADMIT ONE</text>
         <text x="98" y="57" text-anchor="middle" font-family="Courier Prime, monospace" font-size="11" fill="#D4556B">BOOTH NO. 04</text>`
      ),
      item(
        "vin-clip",
        "Brass Paperclip",
        "0 0 70 140",
        `<path d="M22 36 V106 C22 120 48 120 48 106 V26 C48 14 28 14 28 26 V96 C28 104 42 104 42 96 V42" fill="none" stroke="#C9963B" stroke-width="6" stroke-linecap="round"/>`
      )
    ]
  },
  {
    id: "retro",
    label: "Retro Graphics",
    items: [
      item(
        "ret-cassette",
        "Mixtape Cassette",
        "0 0 150 98",
        `<rect x="10" y="12" width="130" height="74" rx="8" fill="#2B2220" stroke="#2A211F" stroke-width="3"/>
         <rect x="20" y="20" width="110" height="42" rx="4" fill="#F6F0E8"/>
         <rect x="20" y="20" width="110" height="12" fill="#D4556B"/>
         <circle cx="52" cy="46" r="9" fill="#2B2220"/><circle cx="98" cy="46" r="9" fill="#2B2220"/>
         <rect x="64" y="40" width="22" height="12" fill="#E6AD52"/>
         <polygon points="36,86 44,70 106,70 114,86" fill="#423532"/>`
      ),
      item(
        "ret-sun",
        "Retro Sunburst",
        "0 0 110 110",
        `<circle cx="55" cy="55" r="24" fill="#E6AD52" stroke="#2A211F" stroke-width="3"/>
         <g stroke="#2A211F" stroke-width="3" stroke-linecap="round">
           <line x1="55" y1="10" x2="55" y2="23"/><line x1="55" y1="87" x2="55" y2="100"/>
           <line x1="10" y1="55" x2="23" y2="55"/><line x1="87" y1="55" x2="100" y2="55"/>
           <line x1="23" y1="23" x2="32" y2="32"/><line x1="78" y1="78" x2="87" y2="87"/>
           <line x1="87" y1="23" x2="78" y2="32"/><line x1="32" y1="78" x2="23" y2="87"/>
         </g>`
      ),
      item(
        "ret-badge",
        "Good Vibes Badge",
        "0 0 150 72",
        `<rect x="6" y="8" width="138" height="56" rx="28" fill="#D4556B" stroke="#2A211F" stroke-width="3.5"/>
         <text x="75" y="44" text-anchor="middle" font-family="Antonio, sans-serif" font-size="24" font-weight="700" fill="#FDFBF7" letter-spacing="1.5">ANALOG SOUL</text>`
      ),
      item(
        "ret-checker",
        "Checker Ribbon",
        "0 0 160 44",
        `<rect x="4" y="4" width="152" height="36" fill="#FDFBF7" stroke="#2A211F" stroke-width="3"/>
         <rect x="4" y="4" width="19" height="18" fill="#2A211F"/><rect x="42" y="4" width="19" height="18" fill="#2A211F"/>
         <rect x="80" y="4" width="19" height="18" fill="#2A211F"/><rect x="118" y="4" width="19" height="18" fill="#2A211F"/>
         <rect x="23" y="22" width="19" height="18" fill="#2A211F"/><rect x="61" y="22" width="19" height="18" fill="#2A211F"/>
         <rect x="99" y="22" width="19" height="18" fill="#2A211F"/><rect x="137" y="22" width="19" height="18" fill="#2A211F"/>`
      )
    ]
  },
  {
    id: "hand-drawn",
    label: "Hand-Drawn",
    items: [
      item(
        "hd-camera",
        "Rangefinder Sketch",
        "0 0 140 100",
        `<rect x="14" y="24" width="112" height="64" rx="10" fill="#FDFBF7" stroke="#2A211F" stroke-width="3.5"/>
         <rect x="28" y="12" width="28" height="12" rx="3" fill="#D4556B" stroke="#2A211F" stroke-width="3"/>
         <circle cx="70" cy="56" r="22" fill="#EDE3D6" stroke="#2A211F" stroke-width="3.5"/>
         <circle cx="70" cy="56" r="11" fill="#2B2220"/>
         <circle cx="66" cy="52" r="3" fill="#FDFBF7"/>
         <rect x="98" y="34" width="16" height="10" rx="2" fill="#E6AD52" stroke="#2A211F" stroke-width="2.5"/>`
      ),
      item(
        "hd-coffee",
        "Cafe Mug",
        "0 0 110 110",
        `<path d="M26 42 H76 V76 C76 88 66 96 51 96 C36 96 26 88 26 76 Z" fill="#FDFBF7" stroke="#2A211F" stroke-width="3.5"/>
         <path d="M76 50 H86 C94 50 96 72 86 72 H76" fill="none" stroke="#2A211F" stroke-width="3.5"/>
         <path d="M40 28 Q45 18 40 12" fill="none" stroke="#D4556B" stroke-width="3" stroke-linecap="round"/>
         <path d="M58 28 Q63 18 58 12" fill="none" stroke="#D4556B" stroke-width="3" stroke-linecap="round"/>`
      ),
      item(
        "hd-vinyl",
        "Vinyl Record",
        "0 0 110 110",
        `<circle cx="55" cy="55" r="44" fill="#2B2220" stroke="#2A211F" stroke-width="3"/>
         <circle cx="55" cy="55" r="32" fill="none" stroke="#534541" stroke-width="1.5"/>
         <circle cx="55" cy="55" r="16" fill="#D4556B" stroke="#FDFBF7" stroke-width="2"/>
         <circle cx="55" cy="55" r="4" fill="#2B2220"/>`
      ),
      item(
        "hd-shades",
        "Retro Shades",
        "0 0 150 64",
        `<rect x="12" y="16" width="52" height="34" rx="14" fill="#2B2220" stroke="#2A211F" stroke-width="3.5"/>
         <rect x="86" y="16" width="52" height="34" rx="14" fill="#2B2220" stroke="#2A211F" stroke-width="3.5"/>
         <path d="M64 28 Q75 20 86 28" fill="none" stroke="#2A211F" stroke-width="4"/>
         <line x1="22" y1="26" x2="36" y2="26" stroke="#F4A5B5" stroke-width="3" stroke-linecap="round"/>
         <line x1="96" y1="26" x2="110" y2="26" stroke="#F4A5B5" stroke-width="3" stroke-linecap="round"/>`
      )
    ]
  },
  {
    id: "film",
    label: "Film Decor",
    items: [
      item(
        "film-rec",
        "REC Indicator",
        "0 0 130 52",
        `<rect x="4" y="4" width="122" height="44" rx="6" fill="#2B2220" stroke="#FDFBF7" stroke-width="2.5"/>
         <circle cx="28" cy="26" r="8" fill="#D4556B"/>
         <text x="80" y="33" text-anchor="middle" font-family="Courier Prime, monospace" font-size="22" font-weight="700" fill="#FDFBF7">REC</text>`
      ),
      item(
        "film-code",
        "Frame Index 04A",
        "0 0 150 48",
        `<rect x="4" y="4" width="142" height="40" rx="4" fill="#2B2220" stroke="#E6AD52" stroke-width="2"/>
         <text x="75" y="30" text-anchor="middle" font-family="Courier Prime, monospace" font-size="18" font-weight="700" fill="#E6AD52">▲ 04A · ISO 640</text>`
      ),
      item(
        "film-strip",
        "35mm Film Accent",
        "0 0 160 66",
        `<rect x="4" y="6" width="152" height="54" fill="#2B2220" stroke="#2A211F" stroke-width="2"/>
         <g fill="#FDFBF7">
           <rect x="12" y="10" width="10" height="7" rx="1"/><rect x="34" y="10" width="10" height="7" rx="1"/>
           <rect x="56" y="10" width="10" height="7" rx="1"/><rect x="78" y="10" width="10" height="7" rx="1"/>
           <rect x="100" y="10" width="10" height="7" rx="1"/><rect x="122" y="10" width="10" height="7" rx="1"/>
           <rect x="142" y="10" width="10" height="7" rx="1"/>
           <rect x="12" y="49" width="10" height="7" rx="1"/><rect x="34" y="49" width="10" height="7" rx="1"/>
           <rect x="56" y="49" width="10" height="7" rx="1"/><rect x="78" y="49" width="10" height="7" rx="1"/>
           <rect x="100" y="49" width="10" height="7" rx="1"/><rect x="122" y="49" width="10" height="7" rx="1"/>
           <rect x="142" y="49" width="10" height="7" rx="1"/>
         </g>
         <rect x="14" y="21" width="38" height="24" fill="#E6AD52" opacity="0.35"/>
         <rect x="61" y="21" width="38" height="24" fill="#D4556B" opacity="0.45"/>
         <rect x="108" y="21" width="38" height="24" fill="#5C9976" opacity="0.4"/>`
      ),
      item(
        "film-meter",
        "Light Meter Bar",
        "0 0 170 46",
        `<rect x="4" y="6" width="162" height="34" rx="4" fill="#2B2220" opacity="0.88"/>
         <text x="16" y="28" font-family="Courier Prime, monospace" font-size="13" fill="#FDFBF7">-2  •  -1  •  0  •  +1  •  +2</text>
         <polygon points="85,8 90,15 80,15" fill="#D4556B"/>`
      )
    ]
  },
  {
    id: "polaroid",
    label: "Polaroid Decor",
    items: [
      item(
        "pol-washi-blush",
        "Blush Washi Tape",
        "0 0 160 44",
        `<polygon points="8,6 152,6 148,14 154,22 148,30 152,38 8,38 12,30 6,22 12,14" fill="#F4A5B5" opacity="0.84" stroke="#D4556B" stroke-width="1.5"/>`
      ),
      item(
        "pol-washi-butter",
        "Honey Washi Tape",
        "0 0 160 44",
        `<polygon points="8,6 152,6 148,14 154,22 148,30 152,38 8,38 12,30 6,22 12,14" fill="#F3D58D" opacity="0.86" stroke="#C9963B" stroke-width="1.5"/>`
      ),
      item(
        "pol-washi-mint",
        "Matcha Washi Tape",
        "0 0 160 44",
        `<polygon points="8,6 152,6 148,14 154,22 148,30 152,38 8,38 12,30 6,22 12,14" fill="#B9DAC6" opacity="0.86" stroke="#5C8F70" stroke-width="1.5"/>`
      ),
      item(
        "pol-keeper",
        "Keeper! Stamp",
        "0 0 150 66",
        `<rect x="6" y="8" width="138" height="50" rx="6" fill="none" stroke="#D4556B" stroke-width="3.5" stroke-dasharray="6 3"/>
         <text x="75" y="42" text-anchor="middle" font-family="Antonio, sans-serif" font-size="26" font-weight="700" fill="#D4556B" letter-spacing="2">KEEPER!</text>`
      ),
      item(
        "pol-corners",
        "Photo Mount Corner",
        "0 0 80 80",
        `<polygon points="8,8 72,8 8,72" fill="#2A211F" opacity="0.88"/>
         <line x1="16" y1="16" x2="54" y2="16" stroke="#E6AD52" stroke-width="2"/>`
      )
    ]
  },
  {
    id: "borders",
    label: "Borders & Frames",
    items: [
      item(
        "brd-scallop",
        "Scalloped Frame",
        "0 0 160 160",
        `<rect x="12" y="12" width="136" height="136" rx="14" fill="none" stroke="#D4556B" stroke-width="4" stroke-dasharray="10 6"/>
         <rect x="22" y="22" width="116" height="116" rx="8" fill="none" stroke="#2A211F" stroke-width="2"/>`
      ),
      item(
        "brd-corners",
        "Crop Brackets",
        "0 0 160 160",
        `<g fill="none" stroke="#D4556B" stroke-width="5" stroke-linecap="square">
          <path d="M12 44 V12 H44"/><path d="M116 12 H148 V44"/>
          <path d="M12 116 V148 H44"/><path d="M116 148 H148 V116"/>
         </g>`
      ),
      item(
        "brd-archival",
        "Double Ink Rule",
        "0 0 160 160",
        `<rect x="10" y="10" width="140" height="140" fill="none" stroke="#2A211F" stroke-width="3"/>
         <rect x="18" y="18" width="124" height="124" fill="none" stroke="#E6AD52" stroke-width="2"/>`
      ),
      item(
        "brd-heart-corner",
        "Floral Corner Accent",
        "0 0 160 160",
        `<path d="M14 70 V14 H70" fill="none" stroke="#2A211F" stroke-width="3.5"/>
         <path d="M146 90 V146 H90" fill="none" stroke="#2A211F" stroke-width="3.5"/>
         <circle cx="14" cy="14" r="8" fill="#D4556B"/><circle cx="146" cy="146" r="8" fill="#D4556B"/>`
      )
    ]
  }
];

export const ALL_EDITOR_STICKERS = EDITOR_STICKER_PACKS.flatMap((pack) =>
  pack.items.map((st) => ({ ...st, categoryId: pack.id }))
);
