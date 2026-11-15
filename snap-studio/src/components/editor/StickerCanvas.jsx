import { useState, useRef } from "react";
import { X, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

export default function StickerCanvas({
  stickers,
  onUpdateSticker,
  onRemoveSticker,
  containerRef
}) {
  const [selectedId, setSelectedId] = useState(null);
  const dragRef = useRef(null);

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

    onUpdateSticker(id, { x: newX, y: newY });
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
      {stickers.map(s => {
        const isSelected = selectedId === s.id;
        return (
          <div
            key={s.id}
            className={`sticker-element ${isSelected ? "selected" : ""}`}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              transform: `translate(-50%, -50%) rotate(${s.rotation || 0}deg)`,
              fontSize: `${s.size || 40}px`
            }}
            onPointerDown={e => handlePointerDown(e, s)}
          >
            <span className="sticker-content-emoji">{s.emoji}</span>

            {isSelected && (
              <div
                className="sticker-action-controls"
                onPointerDown={e => e.stopPropagation()}
              >
                <button
                  className="btn-sticker-ctrl"
                  title="Rotate"
                  onClick={() =>
                    onUpdateSticker(s.id, {
                      rotation: ((s.rotation || 0) + 20) % 360
                    })
                  }
                >
                  <RotateCw size={12} />
                </button>
                <button
                  className="btn-sticker-ctrl"
                  title="Bigger"
                  onClick={() =>
                    onUpdateSticker(s.id, {
                      size: Math.min(90, (s.size || 40) + 6)
                    })
                  }
                >
                  <ZoomIn size={12} />
                </button>
                <button
                  className="btn-sticker-ctrl"
                  title="Smaller"
                  onClick={() =>
                    onUpdateSticker(s.id, {
                      size: Math.max(24, (s.size || 40) - 6)
                    })
                  }
                >
                  <ZoomOut size={12} />
                </button>
                <button
                  className="btn-sticker-ctrl delete"
                  title="Delete"
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
