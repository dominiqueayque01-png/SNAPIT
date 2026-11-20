/**
 * Safe SVG sanitization and custom image upload validation/normalization.
 * Prevents embedded script execution, event handlers, and unsafe URLs in SVGs.
 */

export const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/svg+xml",
  "image/jpeg",
  "image/webp"
];

export const SUPPORTED_EXTENSIONS = [".png", ".svg", ".jpg", ".jpeg", ".webp"];
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_RASTER_EDGE = 2400;

const BLOCKED_TAGS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "foreignobject",
  "link",
  "meta",
  "base",
  "applet",
  "audio",
  "video"
]);

const URL_ATTRS = new Set(["href", "xlink:href", "src", "action", "formaction"]);

function isUnsafeUrl(value) {
  const normalized = Array.from(String(value || ""))
    .filter((ch) => ch.charCodeAt(0) > 31 && !/\s/.test(ch))
    .join("")
    .toLowerCase();
  if (!normalized) return false;
  if (normalized.startsWith("#")) return false;
  if (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("data:text/html") ||
    normalized.startsWith("data:application/")
  ) {
    return true;
  }
  // Disallow remote external fetches inside uploaded SVGs so canvas stays untainted
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("//")) {
    return true;
  }
  return false;
}

function sanitizeInlineStyle(styleValue) {
  if (!styleValue) return "";
  return styleValue
    .replace(/expression\s*\([^)]*\)/gi, "")
    .replace(/url\s*\(\s*['"]?\s*(?:javascript:|vbscript:|https?:|\/\/)[^)]*\)/gi, "")
    .replace(/@import[^;]+;?/gi, "");
}

/**
 * Sanitizes raw SVG markup into a safe standalone SVG string with explicit dimensions.
 */
export function sanitizeSvgMarkup(rawSvg) {
  if (typeof rawSvg !== "string" || !rawSvg.trim()) {
    throw new Error("The SVG file is empty.");
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawSvg, "image/svg+xml");

  const parserError = doc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid SVG markup. Please check the file and try again.");
  }

  const root = doc.documentElement;
  if (!root || root.tagName.toLowerCase() !== "svg") {
    throw new Error("Uploaded SVG does not contain a valid <svg> root element.");
  }

  // Walk and sanitize all descendants
  const toRemove = [];
  const walk = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();

    if (BLOCKED_TAGS.has(tag)) {
      toRemove.push(node);
      return;
    }

    if (tag === "style") {
      node.textContent = sanitizeInlineStyle(node.textContent || "");
    }

    // Copy attributes first because removing mutates NamedNodeMap
    const attrs = Array.from(node.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      const val = attr.value || "";

      if (name.startsWith("on")) {
        node.removeAttribute(attr.name);
        continue;
      }

      if (URL_ATTRS.has(name) && isUnsafeUrl(val)) {
        node.removeAttribute(attr.name);
        continue;
      }

      if (name === "style") {
        const cleaned = sanitizeInlineStyle(val);
        if (cleaned.trim()) {
          node.setAttribute("style", cleaned);
        } else {
          node.removeAttribute("style");
        }
      }
    }

    for (const child of Array.from(node.children)) {
      walk(child);
    }
  };

  walk(root);
  toRemove.forEach((el) => el.remove());

  if (!root.getAttribute("xmlns")) {
    root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  // Determine reliable numeric aspect dimensions
  let width = parseFloat(root.getAttribute("width")) || 0;
  let height = parseFloat(root.getAttribute("height")) || 0;
  const viewBox = root.getAttribute("viewBox");

  if ((!width || !height) && viewBox) {
    const parts = viewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
      width = width || parts[2];
      height = height || parts[3];
    }
  }

  if (!width || !height) {
    width = 320;
    height = 320;
  }

  // Ensure crisp rasterization resolution when rendered onto Konva canvas
  const scaleUp = Math.max(width, height) < 512 ? 512 / Math.max(width, height) : 1;
  const finalW = Math.round(width * scaleUp);
  const finalH = Math.round(height * scaleUp);

  if (!viewBox) {
    root.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }
  root.setAttribute("width", String(finalW));
  root.setAttribute("height", String(finalH));

  const serializer = new XMLSerializer();
  const safeSvg = serializer.serializeToString(root);

  return {
    safeSvg,
    width: finalW,
    height: finalH
  };
}

/**
 * Converts a safe SVG string into an encoded data URL suitable for Konva Image loading.
 */
export function svgStringToDataUrl(svgString) {
  const encoded = encodeURIComponent(svgString)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function loadImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        img,
        width: img.naturalWidth || img.width || 400,
        height: img.naturalHeight || img.height || 400
      });
    img.onerror = () => reject(new Error("Could not decode the selected image file."));
    img.src = src;
  });
}

function downscaleImageIfNeeded(img, mimeType) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const longest = Math.max(w, h);

  if (longest <= MAX_RASTER_EDGE) {
    return null;
  }

  const ratio = MAX_RASTER_EDGE / longest;
  const targetW = Math.round(w * ratio);
  const targetH = Math.round(h * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const outputType = mimeType === "image/jpeg" ? "image/jpeg" : "image/png";
  const quality = outputType === "image/jpeg" ? 0.92 : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to resize oversized image."));
          return;
        }
        resolve({ blob, width: targetW, height: targetH, mimeType: outputType });
      },
      outputType,
      quality
    );
  });
}

/**
 * Validates and normalizes an uploaded PNG, SVG, JPEG, or WebP File into a safe canvas asset.
 */
export async function validateAndProcessUpload(file) {
  if (!file) {
    throw new Error("No file selected.");
  }

  const lowerName = (file.name || "").toLowerCase();
  const hasSupportedExt = SUPPORTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
  const hasSupportedMime = SUPPORTED_IMAGE_TYPES.includes(file.type);

  if (!hasSupportedMime && !hasSupportedExt) {
    throw new Error(
      `Unsupported format "${file.name}". Please upload a PNG, SVG, JPEG, or WebP file.`
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `File is too large (${mb} MB). Maximum supported upload size is 15 MB.`
    );
  }

  const isSvg = file.type === "image/svg+xml" || lowerName.endsWith(".svg");

  if (isSvg) {
    const rawText = await file.text();
    const { safeSvg, width, height } = sanitizeSvgMarkup(rawText);
    const dataUrl = svgStringToDataUrl(safeSvg);
    // Verify the sanitized SVG actually renders cleanly as an image
    await loadImageDimensions(dataUrl);
    const blob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
    return {
      name: file.name.replace(/\.[^.]+$/, "") || "Uploaded SVG",
      mimeType: "image/svg+xml",
      isSvg: true,
      blob,
      width,
      height
    };
  }

  // Raster image (PNG, JPEG, WebP)
  const tempUrl = URL.createObjectURL(file);
  try {
    const { img, width, height } = await loadImageDimensions(tempUrl);
    const resized = await downscaleImageIfNeeded(img, file.type);
    if (resized) {
      return {
        name: file.name.replace(/\.[^.]+$/, "") || "Uploaded Image",
        mimeType: resized.mimeType,
        isSvg: false,
        blob: resized.blob,
        width: resized.width,
        height: resized.height
      };
    }

    return {
      name: file.name.replace(/\.[^.]+$/, "") || "Uploaded Image",
      mimeType: file.type || "image/png",
      isSvg: false,
      blob: file,
      width,
      height
    };
  } finally {
    URL.revokeObjectURL(tempUrl);
  }
}
