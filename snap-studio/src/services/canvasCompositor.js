/**
 * Renders a complete photobooth strip onto a 2D Canvas and returns a high-resolution Data URL.
 */
export async function renderPhotoStrip({
  photos = [],
  mode = "strip-4",
  frame = { bg: "#ffffff", textColor: "#2b252f" },
  filter = { canvasFilter: "none" },
  stickers = [],
  customText = "SNAP! STUDIO ✦",
  dateText = new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
}) {
  if (!photos.length) return null;

  // Load all images first
  const loadedImages = await Promise.all(
    photos.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = err => reject(err);
        img.src = src;
      });
    })
  );

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // High-res dimensions
  let canvasWidth, canvasHeight;
  let photoWidth, photoHeight, photoPadding, bottomPadding, topPadding;

  if (mode === "single") {
    // Polaroid format (single shot)
    canvasWidth = 800;
    photoPadding = 50;
    photoWidth = canvasWidth - (photoPadding * 2);
    photoHeight = Math.round(photoWidth * 0.75); // 4:3 aspect
    bottomPadding = 180;
    topPadding = 50;
    canvasHeight = topPadding + photoHeight + bottomPadding;
  } else if (mode === "grid-4") {
    // 2x2 collage
    canvasWidth = 1000;
    photoPadding = 40;
    const gap = 24;
    photoWidth = Math.round((canvasWidth - (photoPadding * 2) - gap) / 2);
    photoHeight = Math.round(photoWidth * 0.75);
    bottomPadding = 140;
    topPadding = 50;
    canvasHeight = topPadding + (photoHeight * 2) + gap + bottomPadding;
  } else {
    // Vertical strip (3 or 4 photos)
    const count = mode === "strip-3" ? 3 : 4;
    canvasWidth = 600;
    photoPadding = 40;
    photoWidth = canvasWidth - (photoPadding * 2);
    photoHeight = Math.round(photoWidth * 0.75);
    const gap = 20;
    bottomPadding = 160;
    topPadding = 45;
    canvasHeight = topPadding + (photoHeight * count) + (gap * (count - 1)) + bottomPadding;
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 1. Draw Frame Background
  ctx.fillStyle = frame.bg || "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle border if specified
  if (frame.borderColor) {
    ctx.strokeStyle = frame.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvasWidth - 4, canvasHeight - 4);
  }

  // 2. Draw Photos with Filter
  const gap = 20;
  ctx.save();
  if (filter.canvasFilter && filter.canvasFilter !== "none") {
    ctx.filter = filter.canvasFilter;
  }

  if (mode === "single") {
    const img = loadedImages[0];
    if (img) {
      drawPhotoCover(ctx, img, photoPadding, topPadding, photoWidth, photoHeight);
    }
  } else if (mode === "grid-4") {
    const gridGap = 24;
    loadedImages.slice(0, 4).forEach((img, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = photoPadding + col * (photoWidth + gridGap);
      const y = topPadding + row * (photoHeight + gridGap);
      drawPhotoCover(ctx, img, x, y, photoWidth, photoHeight);
    });
  } else {
    // Vertical strip
    const count = mode === "strip-3" ? 3 : 4;
    loadedImages.slice(0, count).forEach((img, i) => {
      const x = photoPadding;
      const y = topPadding + i * (photoHeight + gap);
      drawPhotoCover(ctx, img, x, y, photoWidth, photoHeight);
    });
  }
  ctx.restore();

  // 3. Draw Stickers (if any)
  stickers.forEach(s => {
    ctx.save();
    const posX = (s.x / 100) * canvasWidth;
    const posY = (s.y / 100) * canvasHeight;
    const fontSize = s.size || 48;

    ctx.translate(posX, posY);
    if (s.rotation) {
      ctx.rotate((s.rotation * Math.PI) / 180);
    }

    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.emoji, 0, 0);
    ctx.restore();
  });

  // 4. Draw Header/Footer Branding & Date Stamp
  ctx.save();
  ctx.fillStyle = frame.textColor || "#2b252f";
  ctx.textAlign = "center";

  // Main text / caption
  ctx.font = "bold 26px 'Quicksand', 'Segoe UI', sans-serif";
  ctx.fillText(customText, canvasWidth / 2, canvasHeight - 90);

  // Date and studio watermark
  ctx.font = "16px 'Courier New', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = (frame.textColor || "#2b252f") + "aa";
  ctx.fillText(`${dateText}  ✦  SNAP! STUDIO`, canvasWidth / 2, canvasHeight - 50);

  ctx.restore();

  return canvas.toDataURL("image/png");
}

function drawPhotoCover(ctx, img, x, y, w, h) {
  // Crop to center
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sWidth, sHeight, sx, sy;

  if (imgRatio > targetRatio) {
    sHeight = img.height;
    sWidth = img.height * targetRatio;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = img.width;
    sHeight = img.width / targetRatio;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }

  // Draw photo
  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);

  // Subtle inner border for photo realism
  ctx.save();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}
