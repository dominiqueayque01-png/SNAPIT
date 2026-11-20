/**
 * High-resolution Konva Stage exporter.
 * Exports the exact document area at native resolution without zoom/pan distortion
 * or selection handles, supporting PNG (with transparency) and JPEG.
 */

export async function exportKonvaComposition({
  stageRef,
  docWidth,
  docHeight,
  mimeType = "image/png",
  quality = 0.94,
  pixelRatio = 1,
  onBeforeExport,
  onAfterExport
}) {
  const stage = stageRef?.current;
  if (!stage) {
    throw new Error("Editor canvas is not ready for export.");
  }

  // Allow caller to hide Transformer / selection UI cleanly before capture
  if (onBeforeExport) {
    onBeforeExport();
  }

  // Wait one animation frame so Konva flushes transformer hide + redraw
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  // Snapshot current viewport transform
  const prevScaleX = stage.scaleX();
  const prevScaleY = stage.scaleY();
  const prevX = stage.x();
  const prevY = stage.y();
  const prevWidth = stage.width();
  const prevHeight = stage.height();

  try {
    // Reset stage strictly to native 1:1 document coordinates
    stage.width(docWidth);
    stage.height(docHeight);
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();

    const dataUrl = stage.toDataURL({
      x: 0,
      y: 0,
      width: docWidth,
      height: docHeight,
      mimeType,
      quality: mimeType === "image/jpeg" ? quality : undefined,
      pixelRatio
    });

    return dataUrl;
  } finally {
    // Restore interactive viewport zoom/pan immediately
    stage.width(prevWidth);
    stage.height(prevHeight);
    stage.scale({ x: prevScaleX, y: prevScaleY });
    stage.position({ x: prevX, y: prevY });
    stage.batchDraw();

    if (onAfterExport) {
      onAfterExport();
    }
  }
}
