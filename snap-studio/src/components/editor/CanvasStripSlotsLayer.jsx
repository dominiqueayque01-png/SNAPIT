import { memo, useMemo } from "react";
import { Group, Rect, Image as KonvaImage, Text } from "react-konva";
import { FILTERS } from "../../constants/filters";
import useKonvaImage from "../../hooks/useKonvaImage";
import CanvasObjectNode from "./CanvasObjectNode";

function buildSlotFilterString(filterId, brightness = 100, contrast = 100) {
  const preset = FILTERS.find((f) => f.id === filterId) || FILTERS[0];
  const parts = [];
  if (preset.canvasFilter && preset.canvasFilter !== "none") {
    parts.push(preset.canvasFilter);
  }
  if (brightness !== 100) {
    parts.push(`brightness(${brightness}%)`);
  }
  if (contrast !== 100) {
    parts.push(`contrast(${contrast}%)`);
  }
  return parts.length ? parts.join(" ") : "none";
}

function useSlotFilteredImage(image, filterString) {
  return useMemo(() => {
    if (!image) return null;
    if (!filterString || filterString === "none") return image;

    const w = image.naturalWidth || image.width;
    const h = image.naturalHeight || image.height;
    if (!w || !h) return image;

    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.filter = filterString;
    ctx.drawImage(image, 0, 0, w, h);
    return c;
  }, [image, filterString]);
}

const StripSlotNode = memo(function StripSlotNode({
  slot,
  isSelected,
  isExportingHidden,
  interactive,
  onSelectSlot,
  onDoubleClickSlot
}) {
  const { image } = useKonvaImage(slot.src);
  const filterStr = buildSlotFilterString(
    slot.filterId,
    slot.brightness ?? 100,
    slot.contrast ?? 100
  );
  const processedImage = useSlotFilteredImage(image, filterStr);

  // Compute cover-fit dimensions + per-slot zoom & pan offset inside the slot box
  const drawMetrics = useMemo(() => {
    if (!processedImage) return null;
    const imgW = processedImage.naturalWidth || processedImage.width || 1;
    const imgH = processedImage.naturalHeight || processedImage.height || 1;
    const imgRatio = imgW / imgH;
    const slotRatio = slot.width / slot.height;

    let baseW;
    let baseH;
    if (imgRatio > slotRatio) {
      baseH = slot.height;
      baseW = slot.height * imgRatio;
    } else {
      baseW = slot.width;
      baseH = slot.width / imgRatio;
    }

    const zoom = slot.zoom || 1;
    const w = baseW * zoom;
    const h = baseH * zoom;
    const maxPanX = Math.max(0, (w - slot.width) / 2);
    const maxPanY = Math.max(0, (h - slot.height) / 2);
    const panX = ((slot.offsetX || 0) / 100) * Math.max(maxPanX, slot.width * 0.25);
    const panY = ((slot.offsetY || 0) / 100) * Math.max(maxPanY, slot.height * 0.25);

    return {
      x: slot.x + (slot.width - w) / 2 + panX,
      y: slot.y + (slot.height - h) / 2 + panY,
      width: w,
      height: h
    };
  }, [processedImage, slot.x, slot.y, slot.width, slot.height, slot.zoom, slot.offsetX, slot.offsetY]);

  const handleSelect = (e) => {
    if (!interactive) return;
    e.cancelBubble = true;
    onSelectSlot(slot.index);
  };

  const handleDoubleClick = (e) => {
    if (!interactive || !onDoubleClickSlot) return;
    e.cancelBubble = true;
    onDoubleClickSlot(slot.index);
  };

  return (
    <Group
      onClick={handleSelect}
      onTap={handleSelect}
      onDblClick={handleDoubleClick}
      onDblTap={handleDoubleClick}
    >
      {/* Clipped Photo Window */}
      <Group
        clipX={slot.x}
        clipY={slot.y}
        clipWidth={slot.width}
        clipHeight={slot.height}
      >
        <Rect
          x={slot.x}
          y={slot.y}
          width={slot.width}
          height={slot.height}
          fill="#261e1c"
        />

        {processedImage && drawMetrics && (
          <KonvaImage
            image={processedImage}
            x={drawMetrics.x}
            y={drawMetrics.y}
            width={drawMetrics.width}
            height={drawMetrics.height}
            scaleX={slot.flipX ? -1 : 1}
            offsetX={slot.flipX ? drawMetrics.width : 0}
          />
        )}

        {/* Per-Shot Stickers, Uploads & Text Composited Cleanly Inside This Slot */}
        {slot.objects?.length > 0 && (
          <Group x={slot.x} y={slot.y} listening={false}>
            {slot.objects.map((obj) => (
              <CanvasObjectNode
                key={obj.id}
                obj={obj}
                isSelected={false}
                toolMode="pan"
                onSelect={() => {}}
                onCommitChange={() => {}}
                onRegisterNode={() => {}}
              />
            ))}
          </Group>
        )}

        {!processedImage && (
          <Text
            x={slot.x}
            y={slot.y + slot.height / 2 - 10}
            width={slot.width}
            text={`SLOT ${slot.label} · EMPTY`}
            fontFamily="Courier Prime"
            fontSize={16}
            fill="#cbbdb6"
            align="center"
          />
        )}
      </Group>

      {/* Subtle Realistic Photo Cutout Inner Rule */}
      <Rect
        x={slot.x}
        y={slot.y}
        width={slot.width}
        height={slot.height}
        stroke={isSelected && !isExportingHidden ? "#d4556b" : "rgba(42,33,31,0.16)"}
        strokeWidth={isSelected && !isExportingHidden ? 4 : 1.5}
        listening={false}
      />

      {/* Active Slot Indicator Badge (Editor UI only, never exported) */}
      {isSelected && !isExportingHidden && (
        <Group listening={false}>
          <Rect
            x={slot.x + 8}
            y={slot.y + 8}
            width={92}
            height={26}
            cornerRadius={4}
            fill="#d4556b"
          />
          <Text
            x={slot.x + 8}
            y={slot.y + 14}
            width={92}
            text={`SHOT ${slot.label}`}
            fontFamily="Courier Prime"
            fontSize={13}
            fontStyle="bold"
            fill="#fdfbf7"
            align="center"
          />
        </Group>
      )}
    </Group>
  );
});

function CanvasStripSlotsLayer({
  stripLayout,
  stripSlots,
  docWidth,
  docHeight,
  selectedSlotIndex,
  isExportingHidden,
  interactive,
  onSelectSlot,
  onDoubleClickSlot,
  onClickPaper
}) {
  if (!stripLayout || !stripSlots.length) return null;

  const paperColor = stripLayout.paperColor || "#fdfbf7";
  const textColor = stripLayout.textColor || "#2a211f";
  const borderColor = stripLayout.borderColor || "#d9cbbd";
  const dateText =
    stripLayout.dateText ||
    new Date().toISOString().slice(0, 10).replace(/-/g, ".");
  const bottomChin = stripLayout.bottomChin || 160;
  const padX = stripLayout.padX || 44;

  return (
    <Group>
      {/* Polaroid Strip Paper Card */}
      <Rect
        name="locked-bg"
        x={0}
        y={0}
        width={docWidth}
        height={docHeight}
        fill={paperColor}
        stroke={borderColor}
        strokeWidth={3}
        shadowColor="rgba(12, 8, 7, 0.52)"
        shadowBlur={36}
        shadowOffsetY={14}
        onClick={onClickPaper}
        onTap={onClickPaper}
      />

      {/* Top Studio Stamp */}
      <Text
        x={padX}
        y={24}
        width={docWidth - padX * 2}
        text={`SNAP! STUDIO   ·   ${dateText}`}
        fontFamily="Courier Prime"
        fontSize={14}
        letterSpacing={2.5}
        fill={textColor}
        opacity={0.7}
        align="center"
        listening={false}
      />

      {/* Separated Per-Shot Photo Slots */}
      {stripSlots.map((slot) => (
        <StripSlotNode
          key={slot.id}
          slot={slot}
          isSelected={selectedSlotIndex === slot.index}
          isExportingHidden={isExportingHidden}
          interactive={interactive}
          onSelectSlot={onSelectSlot}
          onDoubleClickSlot={onDoubleClickSlot}
        />
      ))}

      {/* Bottom Polaroid Chin Inscription */}
      <Text
        x={padX}
        y={docHeight - bottomChin + 34}
        width={docWidth - padX * 2}
        text={stripLayout.caption || "sweet sunday memories"}
        fontFamily="Reenie Beanie"
        fontSize={46}
        fill={textColor}
        align="center"
        listening={false}
      />
      <Text
        x={padX}
        y={docHeight - 46}
        width={docWidth - padX * 2}
        text={`${dateText}  ·  ISO 640  ·  SNAP!`}
        fontFamily="Courier Prime"
        fontSize={13}
        letterSpacing={2}
        fill={textColor}
        opacity={0.62}
        align="center"
        listening={false}
      />
    </Group>
  );
}

/**
 * Dedicated full-size single-shot canvas layer when editing an individual shot tab (01A..04A).
 * Uses identical filter, crop zoom, pan, and mirror math as StripSlotNode at (0, 0) origin.
 */
export const SingleSlotCanvasLayer = memo(function SingleSlotCanvasLayer({
  slot,
  onClickBg
}) {
  const { image } = useKonvaImage(slot?.src);
  const filterStr = buildSlotFilterString(
    slot?.filterId,
    slot?.brightness ?? 100,
    slot?.contrast ?? 100
  );
  const processedImage = useSlotFilteredImage(image, filterStr);

  const drawMetrics = useMemo(() => {
    if (!processedImage || !slot) return null;
    const imgW = processedImage.naturalWidth || processedImage.width || 1;
    const imgH = processedImage.naturalHeight || processedImage.height || 1;
    const imgRatio = imgW / imgH;
    const slotRatio = slot.width / slot.height;

    let baseW;
    let baseH;
    if (imgRatio > slotRatio) {
      baseH = slot.height;
      baseW = slot.height * imgRatio;
    } else {
      baseW = slot.width;
      baseH = slot.width / imgRatio;
    }

    const zoom = slot.zoom || 1;
    const w = baseW * zoom;
    const h = baseH * zoom;
    const maxPanX = Math.max(0, (w - slot.width) / 2);
    const maxPanY = Math.max(0, (h - slot.height) / 2);
    const panX = ((slot.offsetX || 0) / 100) * Math.max(maxPanX, slot.width * 0.25);
    const panY = ((slot.offsetY || 0) / 100) * Math.max(maxPanY, slot.height * 0.25);

    return {
      x: (slot.width - w) / 2 + panX,
      y: (slot.height - h) / 2 + panY,
      width: w,
      height: h
    };
  }, [
    processedImage,
    slot
  ]);

  if (!slot) return null;

  return (
    <Group>
      {/* Subtle Polaroid Mat Shadow Behind Active Shot */}
      <Rect
        name="locked-bg"
        x={0}
        y={0}
        width={slot.width}
        height={slot.height}
        fill="#261e1c"
        shadowColor="rgba(12, 8, 7, 0.56)"
        shadowBlur={38}
        shadowOffsetY={14}
        onClick={onClickBg}
        onTap={onClickBg}
      />

      {/* Clipped Photo Area */}
      <Group
        clipX={0}
        clipY={0}
        clipWidth={slot.width}
        clipHeight={slot.height}
        onClick={onClickBg}
        onTap={onClickBg}
      >
        {processedImage && drawMetrics && (
          <KonvaImage
            name="locked-bg"
            image={processedImage}
            x={drawMetrics.x}
            y={drawMetrics.y}
            width={drawMetrics.width}
            height={drawMetrics.height}
            scaleX={slot.flipX ? -1 : 1}
            offsetX={slot.flipX ? drawMetrics.width : 0}
            draggable={false}
          />
        )}

        {!processedImage && (
          <Text
            x={0}
            y={slot.height / 2 - 10}
            width={slot.width}
            text={`SHOT ${slot.label} · EMPTY`}
            fontFamily="Courier Prime"
            fontSize={16}
            fill="#cbbdb6"
            align="center"
          />
        )}
      </Group>

      {/* Crisp Frame Boundary */}
      <Rect
        x={0}
        y={0}
        width={slot.width}
        height={slot.height}
        stroke="rgba(253, 251, 247, 0.4)"
        strokeWidth={2}
        listening={false}
      />
    </Group>
  );
});

export default memo(CanvasStripSlotsLayer);
