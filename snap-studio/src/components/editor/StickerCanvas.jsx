import { useState, useRef, useEffect } from "react";
import { X, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

export default function StickerCanvas({
  stickers,
  onUpdateSticker,
  onRemoveSticker,
  containerRef
}) {
  const [selectedId, setSelectedId] = useState(null);
  const dragRef = useRef(null);

  // Keyboard shortcut to delete active sticker
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedId) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        onRemoveSticker(selectedId);
        setSelectedId(null);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, onRemoveSticker]);

  const handlePointerDown = (e, sticker) => {
    e.stopPropagation();
    setSelectedId(sticker.id);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    dragRef.current = {
      id: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      initX: sticker.x,
      initY: sticker.y,
      containerWidth: rect.width,
      containerHeight: rect.height
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const { id, startX, startY, initX, initY, containerWidth, containerHeight } = dragRef.current;

    const deltaX = ((e.clientX - startX) / containerWidth) * 100;
    const deltaY = ((e.clientY - startY) / containerHeight) * 100;

    const newX = Math.min(95, Math.max(5, initX + deltaX));
    const newY = Math.min(95, Math.max(5, initY + deltaY));

    onUpdateSticker(id, { x: newX, y: newY, isNew: false });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      className="interactive-sticker-layer"
      onClick={() => setSelectedId(null)}
    >
      {stickers.map((s) => {
        const isSelected = selectedId === s.id;
        return (
          <div
            key={s.id}
            className={`sticker-element ${isSelected ? "selected" : ""} ${
              s.isNew ? "sticker-stamp-new" : ""
            }`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(-50%, -50%) rotate(${s.rotation || 0}deg)`,
              fontSize: `${s.size || 40}px`,
              touchAction: "none"
            }}
            onPointerDown={(e) => handlePointerDown(e, s)}
            title="Drag to position · Click to select"
          >
            <span className="sticker-content-emoji">{s.emoji}</span>

            {isSelected && (
              <div
                className="sticker-action-controls"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="btn-sticker-ctrl"
                  title="Rotate +20°"
                  aria-label="Rotate stamp"
                  onClick={() =>
                    onUpdateSticker(s.id, {
                      rotation: ((s.rotation || 0) + 20) % 360,
                      isNew: false
                    })
                  }
                >
                  <RotateCw size={12} />
                </button>
                <button
                  type="button"
                  className="btn-sticker-ctrl"
                  title="Increase size"
                  aria-label="Make stamp bigger"
                  onClick={() =>
                    onUpdateSticker(s.id, {
                      size: Math.min(96, (s.size || 40) + 6),
                      isNew: false
                    })
                  }
                >
                  <ZoomIn size={12} />
                </button>
                <button
                  type="button"
                  className="btn-sticker-ctrl"
                  title="Decrease size"
                  aria-label="Make stamp smaller"
                  onClick={() =>
                    onUpdateSticker(s.id, {
                      size: Math.max(22, (s.size || 40) - 6),
                      isNew: false
                    })
                  }
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  type="button"
                  className="btn-sticker-ctrl delete"
                  title="Remove stamp [Del]"
                  aria-label="Remove stamp"
                  onClick={() => onRemoveSticker(s.id)}
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
