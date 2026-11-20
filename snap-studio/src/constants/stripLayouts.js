/**
 * Exact high-resolution Polaroid strip & collage geometry for per-slot Konva editing.
 * Each slot has independent coordinates so every captured photo can be selected,
 * filtered, zoomed, panned, flipped, swapped, or replaced individually.
 */

export function buildStripLayoutGeometry(mode, photos = []) {
  const count = mode === "strip-3" ? 3 : 4;

  if (mode === "grid-4") {
    const docWidth = 1000;
    const padX = 44;
    const topPad = 68;
    const gap = 24;
    const slotWidth = Math.round((docWidth - padX * 2 - gap) / 2);
    const slotHeight = Math.round(slotWidth * 0.75); // 4:3
    const bottomChin = 160;
    const docHeight = topPad + slotHeight * 2 + gap + bottomChin;

    const slots = Array.from({ length: 4 }, (_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return {
        id: `slot_${i}`,
        index: i,
        label: `0${i + 1}A`,
        x: padX + col * (slotWidth + gap),
        y: topPad + row * (slotHeight + gap),
        width: slotWidth,
        height: slotHeight,
        src: photos[i] || null,
        filterId: "normal",
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        flipX: false,
        brightness: 100,
        contrast: 100,
        objects: []
      };
    });

    return { docWidth, docHeight, topPad, bottomChin, padX, slots };
  }

  // Vertical 3-cut or 4-strip Polaroid
  const docWidth = 640;
  const padX = 44;
  const topPad = 64;
  const gap = 22;
  const slotWidth = docWidth - padX * 2;
  const slotHeight = Math.round(slotWidth * 0.72);
  const bottomChin = 170;
  const docHeight = topPad + slotHeight * count + gap * (count - 1) + bottomChin;

  const slots = Array.from({ length: count }, (_, i) => ({
    id: `slot_${i}`,
    index: i,
    label: `0${i + 1}A`,
    x: padX,
    y: topPad + i * (slotHeight + gap),
    width: slotWidth,
    height: slotHeight,
    src: photos[i] || null,
    filterId: "normal",
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    flipX: false,
    brightness: 100,
    contrast: 100,
    objects: []
  }));

  return { docWidth, docHeight, topPad, bottomChin, padX, slots };
}
