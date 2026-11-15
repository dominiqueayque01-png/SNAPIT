/**
 * Canvas 2D AR Renderer for Snapchat-Style Face Mesh Lenses
 */

export const AR_LENSES = [
  { id: "none", name: "Original", icon: "✨", description: "No AR Filter" },
  { id: "cat", name: "Cat Kitty", icon: "🐱", description: "Cat ears, cute pink nose & whiskers" },
  { id: "glasses", name: "Heart Shades", icon: "🕶️", description: "Y2K translucent pink heart sunglasses" },
  { id: "blush", name: "Kawaii Blush", icon: "🌸", description: "Glowing cheek blush & twinkle sparkles" },
  { id: "crown", name: "Angel Crown", icon: "👑", description: "Golden glowing halo & stars" }
];

export function drawFaceLens(ctx, landmarks, lensId, width, height, isMirrored = true) {
  if (!landmarks || landmarks.length === 0 || lensId === "none") return;

  const getPt = (idx) => {
    const lm = landmarks[idx];
    if (!lm) return { x: 0, y: 0 };
    return {
      x: isMirrored ? (1 - lm.x) * width : lm.x * width,
      y: lm.y * height
    };
  };

  // Key facial anchor landmarks
  const foreheadCenter = getPt(10);
  const noseTip = getPt(4);
  const leftEyeOuter = getPt(33);
  const rightEyeOuter = getPt(263);
  const noseBridge = getPt(168);
  const leftCheek = getPt(116);
  const rightCheek = getPt(345);

  // Compute roll tilt angle and eye span
  const dx = isMirrored ? leftEyeOuter.x - rightEyeOuter.x : rightEyeOuter.x - leftEyeOuter.x;
  const dy = isMirrored ? leftEyeOuter.y - rightEyeOuter.y : rightEyeOuter.y - leftEyeOuter.y;
  const headAngle = Math.atan2(dy, dx);
  const eyeSpan = Math.hypot(dx, dy);

  ctx.save();

  if (lensId === "cat") {
    drawCatLens(ctx, foreheadCenter, noseTip, leftCheek, rightCheek, eyeSpan, headAngle);
  } else if (lensId === "glasses") {
    drawHeartSunglasses(ctx, noseBridge, eyeSpan, headAngle);
  } else if (lensId === "blush") {
    drawBlushAndSparkles(ctx, leftCheek, rightCheek, noseTip, eyeSpan);
  } else if (lensId === "crown") {
    drawAngelCrown(ctx, foreheadCenter, eyeSpan, headAngle);
  }

  ctx.restore();
}

/**
 * 🐱 1. Cat Ears, Little Pink Nose & Whiskers
 */
function drawCatLens(ctx, forehead, nose, leftCheek, rightCheek, eyeSpan, angle) {
  const earSize = eyeSpan * 0.9;
  const earSpread = eyeSpan * 0.85;

  ctx.save();
  ctx.translate(forehead.x, forehead.y);
  ctx.rotate(angle);

  // Draw Left Ear
  ctx.save();
  ctx.translate(-earSpread, -earSize * 0.7);
  drawCatEarShape(ctx, earSize, false);
  ctx.restore();

  // Draw Right Ear
  ctx.save();
  ctx.translate(earSpread, -earSize * 0.7);
  drawCatEarShape(ctx, earSize, true);
  ctx.restore();

  // Cute Little Red Ribbon on Left Ear (Matching our cat mascot 2.png!)
  ctx.save();
  ctx.translate(-earSpread + earSize * 0.3, -earSize * 0.2);
  drawMiniRibbon(ctx, earSize * 0.35);
  ctx.restore();

  ctx.restore();

  // Cat Nose Tip
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);
  ctx.fillStyle = "#ff5e7e";
  ctx.beginPath();
  const nw = eyeSpan * 0.16;
  const nh = eyeSpan * 0.12;
  ctx.moveTo(0, nh);
  ctx.lineTo(-nw, -nh * 0.6);
  ctx.quadraticCurveTo(0, -nh * 1.2, nw, -nh * 0.6);
  ctx.closePath();
  ctx.fill();

  // White highlight on nose
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-nw * 0.3, -nh * 0.2, nw * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Whiskers (3 on each cheek)
  drawWhiskers(ctx, leftCheek, eyeSpan * 0.9, angle, true);
  drawWhiskers(ctx, rightCheek, eyeSpan * 0.9, angle, false);
}

function drawCatEarShape(ctx, size, isRight) {
  ctx.save();
  if (isRight) ctx.scale(-1, 1);
  ctx.rotate(-0.15);

  // Outer ear (soft warm brown like our cat mascot)
  ctx.fillStyle = "#8d6e63";
  ctx.strokeStyle = "#5d4037";
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, size * 0.3);
  ctx.quadraticCurveTo(-size * 0.4, -size * 0.8, 0, -size);
  ctx.quadraticCurveTo(size * 0.4, -size * 0.7, size * 0.45, size * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ear (soft baby pink)
  ctx.fillStyle = "#ffb2c2";
  ctx.beginPath();
  ctx.moveTo(-size * 0.25, size * 0.2);
  ctx.quadraticCurveTo(-size * 0.2, -size * 0.6, 0, -size * 0.78);
  ctx.quadraticCurveTo(size * 0.2, -size * 0.5, size * 0.25, size * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMiniRibbon(ctx, size) {
  ctx.fillStyle = "#ef4444";
  ctx.strokeStyle = "#b91c1c";
  ctx.lineWidth = 2;
  // Left loop
  ctx.beginPath();
  ctx.ellipse(-size * 0.5, 0, size * 0.5, size * 0.3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Right loop
  ctx.beginPath();
  ctx.ellipse(size * 0.5, 0, size * 0.5, size * 0.3, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Center knot (gold bell)
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawWhiskers(ctx, cheek, length, angle, isLeft) {
  ctx.save();
  ctx.translate(cheek.x, cheek.y);
  ctx.rotate(angle);
  ctx.strokeStyle = "#3e2723";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  const dir = isLeft ? -1 : 1;
  const offsets = [-0.18, 0, 0.18];

  offsets.forEach((tilt) => {
    ctx.beginPath();
    ctx.moveTo(dir * 10, 0);
    ctx.quadraticCurveTo(
      dir * (length * 0.5),
      tilt * length * 0.6,
      dir * length,
      tilt * length
    );
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * 🕶️ 2. Y2K Tinted Heart Sunglasses
 */
function drawHeartSunglasses(ctx, bridge, eyeSpan, angle) {
  ctx.save();
  ctx.translate(bridge.x, bridge.y);
  ctx.rotate(angle);

  const glassWidth = eyeSpan * 0.78;
  const glassHeight = eyeSpan * 0.7;
  const spacing = eyeSpan * 0.58;

  // Gold connecting bridge
  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = eyeSpan * 0.05;
  ctx.beginPath();
  ctx.moveTo(-spacing * 0.5, 0);
  ctx.quadraticCurveTo(0, -eyeSpan * 0.1, spacing * 0.5, 0);
  ctx.stroke();

  // Left Heart Lens
  drawSingleHeartGlass(ctx, -spacing, 0, glassWidth, glassHeight);

  // Right Heart Lens
  drawSingleHeartGlass(ctx, spacing, 0, glassWidth, glassHeight);

  ctx.restore();
}

function drawSingleHeartGlass(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  // Lens Path
  ctx.beginPath();
  const topCurveHeight = h * 0.35;
  ctx.moveTo(0, h * 0.5);
  ctx.bezierCurveTo(-w * 0.6, h * 0.1, -w * 0.6, -topCurveHeight, -w * 0.3, -topCurveHeight);
  ctx.bezierCurveTo(-w * 0.1, -topCurveHeight, 0, -topCurveHeight * 0.5, 0, -topCurveHeight * 0.2);
  ctx.bezierCurveTo(0, -topCurveHeight * 0.5, w * 0.1, -topCurveHeight, w * 0.3, -topCurveHeight);
  ctx.bezierCurveTo(w * 0.6, -topCurveHeight, w * 0.6, h * 0.1, 0, h * 0.5);
  ctx.closePath();

  // Translucent candy pink gradient
  const grad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
  grad.addColorStop(0, "rgba(255, 75, 130, 0.85)");
  grad.addColorStop(1, "rgba(244, 63, 94, 0.7)");
  ctx.fillStyle = grad;
  ctx.fill();

  // Gold wireframe frame
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Specular diagonal white glare line
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
  ctx.lineWidth = w * 0.12;
  ctx.beginPath();
  ctx.moveTo(-w * 0.3, -h * 0.5);
  ctx.lineTo(w * 0.2, h * 0.5);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 🌸 3. Kawaii Soft Cheek Blush & Twinkle Sparkles
 */
function drawBlushAndSparkles(ctx, leftCheek, rightCheek, nose, eyeSpan) {
  const blushRadius = eyeSpan * 0.42;

  // Left Cheek Soft Radial Blush
  drawCheekBlushDot(ctx, leftCheek.x, leftCheek.y, blushRadius);

  // Right Cheek Soft Radial Blush
  drawCheekBlushDot(ctx, rightCheek.x, rightCheek.y, blushRadius);

  // Animated Twinkling Sparkles
  const time = Date.now() * 0.003;
  const pulse1 = Math.sin(time) * 0.2 + 0.8;
  const pulse2 = Math.cos(time) * 0.2 + 0.8;

  drawSparkleStar(ctx, leftCheek.x - blushRadius * 0.5, leftCheek.y - blushRadius * 0.4, 14 * pulse1, "#ffffff");
  drawSparkleStar(ctx, leftCheek.x + blushRadius * 0.4, leftCheek.y + blushRadius * 0.3, 10 * pulse2, "#fbbf24");

  drawSparkleStar(ctx, rightCheek.x + blushRadius * 0.5, rightCheek.y - blushRadius * 0.4, 14 * pulse2, "#ffffff");
  drawSparkleStar(ctx, rightCheek.x - blushRadius * 0.4, rightCheek.y + blushRadius * 0.3, 10 * pulse1, "#fbbf24");

  // Tiny highlight on nose
  drawSparkleStar(ctx, nose.x, nose.y, 8 * pulse1, "#ffffff");
}

function drawCheekBlushDot(ctx, x, y, radius) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
  grad.addColorStop(0, "rgba(255, 105, 140, 0.55)");
  grad.addColorStop(0.5, "rgba(255, 140, 160, 0.3)");
  grad.addColorStop(1, "rgba(255, 160, 180, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSparkleStar(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(0, 0, size, 0);
  ctx.quadraticCurveTo(0, 0, 0, size);
  ctx.quadraticCurveTo(0, 0, -size, 0);
  ctx.quadraticCurveTo(0, 0, 0, -size);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * 👑 4. Angel Crown & Glowing Halo
 */
function drawAngelCrown(ctx, forehead, eyeSpan, angle) {
  ctx.save();
  ctx.translate(forehead.x, forehead.y - eyeSpan * 0.6);
  ctx.rotate(angle);

  const haloW = eyeSpan * 0.85;
  const haloH = eyeSpan * 0.28;

  // Outer Golden Glow
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 20;

  // Halo Ring
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = eyeSpan * 0.08;
  ctx.beginPath();
  ctx.ellipse(0, 0, haloW, haloH, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner Highlight
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = eyeSpan * 0.03;
  ctx.beginPath();
  ctx.ellipse(0, -2, haloW * 0.95, haloH * 0.85, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Floating Sparkles above Halo
  const time = Date.now() * 0.003;
  drawSparkleStar(ctx, -haloW * 0.8, -haloH * 0.8, 12 * (Math.sin(time) * 0.3 + 0.7), "#ffffff");
  drawSparkleStar(ctx, haloW * 0.8, -haloH * 0.8, 12 * (Math.cos(time) * 0.3 + 0.7), "#fde047");

  ctx.restore();
}
