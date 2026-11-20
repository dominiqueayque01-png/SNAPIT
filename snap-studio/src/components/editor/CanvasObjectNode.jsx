import { memo } from "react";
import { Image as KonvaImage, Text as KonvaText } from "react-konva";
import useKonvaImage from "../../hooks/useKonvaImage";

function CanvasObjectNode({
  obj,
  isSelected,
  toolMode,
  onSelect,
  onCommitChange,
  onRegisterNode,
  onRequestInlineEdit
}) {
  const { image } = useKonvaImage(obj.type === "image" ? obj.src : null);

  if (!obj.visible) return null;

  const isInteractive = toolMode === "select";
  const isDraggable = isInteractive && !obj.locked;

  const handleSelect = (e) => {
    if (!isInteractive) return;
    e.cancelBubble = true;
    onSelect(obj.id);
  };

  const handleDragEnd = (e) => {
    onCommitChange(obj.id, {
      x: Math.round(e.target.x()),
      y: Math.round(e.target.y())
    });
  };

  if (obj.type === "image") {
    if (!image) return null;

    return (
      <KonvaImage
        ref={(node) => onRegisterNode(obj.id, node)}
        id={obj.id}
        image={image}
        x={obj.x}
        y={obj.y}
        width={obj.width}
        height={obj.height}
        rotation={obj.rotation || 0}
        opacity={obj.opacity ?? 1}
        scaleX={obj.flipX ? -1 : 1}
        scaleY={obj.flipY ? -1 : 1}
        offsetX={obj.flipX ? obj.width : 0}
        offsetY={obj.flipY ? obj.height : 0}
        draggable={isDraggable}
        listening={isInteractive}
        onClick={handleSelect}
        onTap={handleSelect}
        onDragStart={(e) => {
          e.cancelBubble = true;
          if (!isSelected) onSelect(obj.id);
        }}
        onDragEnd={handleDragEnd}
        onTransformEnd={(e) => {
          const node = e.target;
          const absScaleX = Math.abs(node.scaleX());
          const absScaleY = Math.abs(node.scaleY());
          const nextWidth = Math.max(20, Math.round(node.width() * absScaleX));
          const nextHeight = Math.max(20, Math.round(node.height() * absScaleY));

          node.scaleX(obj.flipX ? -1 : 1);
          node.scaleY(obj.flipY ? -1 : 1);

          onCommitChange(obj.id, {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: nextWidth,
            height: nextHeight,
            rotation: Math.round(node.rotation())
          });
        }}
      />
    );
  }

  if (obj.type === "text") {
    return (
      <KonvaText
        ref={(node) => onRegisterNode(obj.id, node)}
        id={obj.id}
        text={obj.text || ""}
        x={obj.x}
        y={obj.y}
        width={obj.width || 300}
        fontSize={obj.fontSize || 42}
        fontFamily={obj.fontFamily || "Reenie Beanie"}
        fontStyle={obj.fontStyle || "normal"}
        fill={obj.fill || "#2a211f"}
        align={obj.align || "center"}
        letterSpacing={obj.letterSpacing ?? 0}
        lineHeight={obj.lineHeight ?? 1.2}
        rotation={obj.rotation || 0}
        opacity={obj.opacity ?? 1}
        padding={6}
        draggable={isDraggable}
        listening={isInteractive}
        onClick={handleSelect}
        onTap={handleSelect}
        onDblClick={(e) => {
          if (!isInteractive || obj.locked) return;
          e.cancelBubble = true;
          onRequestInlineEdit?.(obj);
        }}
        onDblTap={(e) => {
          if (!isInteractive || obj.locked) return;
          e.cancelBubble = true;
          onRequestInlineEdit?.(obj);
        }}
        onDragStart={(e) => {
          e.cancelBubble = true;
          if (!isSelected) onSelect(obj.id);
        }}
        onDragEnd={handleDragEnd}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const nextWidth = Math.max(60, Math.round(node.width() * scaleX));
          const nextFontSize = Math.max(
            12,
            Math.min(220, Math.round((obj.fontSize || 42) * scaleY))
          );

          node.scaleX(1);
          node.scaleY(1);

          onCommitChange(obj.id, {
            x: Math.round(node.x()),
            y: Math.round(node.y()),
            width: nextWidth,
            fontSize: nextFontSize,
            rotation: Math.round(node.rotation())
          });
        }}
      />
    );
  }

  return null;
}

export default memo(CanvasObjectNode);
