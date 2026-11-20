import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Type,
  Image as ImageIcon,
  Pencil,
  Check
} from "lucide-react";
import { useEditor } from "../../context/EditorContext";

export default function LayersPanel() {
  const {
    present,
    selectedId,
    selectedSlotIndex,
    activeSlot,
    activeObjects,
    selectObject,
    selectSlot,
    setActiveSlotTab,
    updateObject,
    deleteObject,
    reorderObject,
    updateCanvasSettings
  } = useEditor();

  const [renamingId, setRenamingId] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");

  // Display top-most layer first in the UI stack
  const layersTopDown = [...activeObjects].reverse();
  const baseCount = activeSlot
    ? 1
    : present.stripSlots.length > 0
    ? present.stripSlots.length
    : 1;

  const startRename = (e, obj) => {
    e.stopPropagation();
    setRenamingId(obj.id);
    setRenameDraft(obj.name || "Layer");
  };

  const commitRename = (id) => {
    const trimmed = renameDraft.trim();
    if (trimmed) {
      updateObject(id, { name: trimmed }, true);
    }
    setRenamingId(null);
  };

  return (
    <div className="layers-panel-wrap">
      <div className="layers-panel-head">
        <span>{activeSlot ? `SHOT ${activeSlot.label} LAYERS` : "LAYER STACK"}</span>
        <span className="tabular">{activeObjects.length + baseCount} TOTAL</span>
      </div>

      {/* Selected Layer Reorder Bar (WCAG single-pointer alternative to drag reorder) */}
      {selectedId && (
        <div className="layer-order-bar" role="group" aria-label="Reorder selected layer">
          <button
            type="button"
            onClick={() => reorderObject(selectedId, "front")}
            title="Bring to Front"
            aria-label="Bring to front"
          >
            <ChevronsUp size={14} />
            <span>Front</span>
          </button>
          <button
            type="button"
            onClick={() => reorderObject(selectedId, "forward")}
            title="Bring Forward"
            aria-label="Bring forward"
          >
            <ArrowUp size={14} />
            <span>Up</span>
          </button>
          <button
            type="button"
            onClick={() => reorderObject(selectedId, "backward")}
            title="Send Backward"
            aria-label="Send backward"
          >
            <ArrowDown size={14} />
            <span>Down</span>
          </button>
          <button
            type="button"
            onClick={() => reorderObject(selectedId, "back")}
            title="Send to Back"
            aria-label="Send to back"
          >
            <ChevronsDown size={14} />
            <span>Back</span>
          </button>
        </div>
      )}

      <div className="layers-list">
        {layersTopDown.length === 0 && (
          <div className="layers-hint-empty">
            Add stickers, text, or uploaded assets from the left studio to build
            your layer stack.
          </div>
        )}

        {layersTopDown.map((obj) => {
          const isSelected = obj.id === selectedId;
          const isRenaming = renamingId === obj.id;

          return (
            <div
              key={obj.id}
              className={`layer-row ${isSelected ? "selected" : ""} ${
                !obj.visible ? "is-hidden" : ""
              }`}
              onClick={() => selectObject(obj.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectObject(obj.id);
                }
              }}
            >
              <span className="layer-kind-icon" aria-hidden="true">
                {obj.type === "text" ? <Type size={14} /> : <ImageIcon size={14} />}
              </span>

              <div className="layer-name-cell">
                {isRenaming ? (
                  <div
                    className="layer-rename-inline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={renameDraft}
                      maxLength={32}
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onBlur={() => commitRename(obj.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(obj.id);
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => commitRename(obj.id)}
                      aria-label="Confirm layer name"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <span
                    className="layer-name-text"
                    onDoubleClick={(e) => startRename(e, obj)}
                    title={obj.name || "Layer"}
                  >
                    {obj.name || (obj.type === "text" ? obj.text : "Image Layer")}
                  </span>
                )}
              </div>

              <div className="layer-row-controls" onClick={(e) => e.stopPropagation()}>
                {!isRenaming && (
                  <button
                    type="button"
                    className="layer-ctrl-btn"
                    onClick={(e) => startRename(e, obj)}
                    title="Rename layer"
                    aria-label={`Rename ${obj.name}`}
                  >
                    <Pencil size={12} />
                  </button>
                )}

                <button
                  type="button"
                  className="layer-ctrl-btn"
                  onClick={() =>
                    updateObject(obj.id, { visible: !obj.visible }, true)
                  }
                  title={obj.visible ? "Hide layer" : "Show layer"}
                  aria-label={obj.visible ? "Hide layer" : "Show layer"}
                >
                  {obj.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>

                <button
                  type="button"
                  className={`layer-ctrl-btn ${obj.locked ? "active" : ""}`}
                  onClick={() =>
                    updateObject(obj.id, { locked: !obj.locked }, true)
                  }
                  title={obj.locked ? "Unlock layer" : "Lock layer"}
                  aria-label={obj.locked ? "Unlock layer" : "Lock layer"}
                >
                  {obj.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>

                <button
                  type="button"
                  className="layer-ctrl-btn danger"
                  disabled={obj.locked}
                  onClick={() => deleteObject(obj.id)}
                  title="Delete layer"
                  aria-label={`Delete ${obj.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Active Shot Locked Base OR Final Strip Slots OR Single Photo Base */}
        {activeSlot ? (
          <div className="layer-row layer-background-row">
            <span className="layer-kind-icon" aria-hidden="true">
              <ImageIcon size={14} />
            </span>
            <div className="layer-name-cell">
              <span className="layer-name-text">Shot {activeSlot.label} Photograph</span>
              <small className="layer-bg-tag">Base Photo · Locked</small>
            </div>
            <span
              className="layer-ctrl-btn locked-static"
              title="Base photograph stays locked"
            >
              <Lock size={13} />
            </span>
          </div>
        ) : present.stripLayout && present.stripSlots.length > 0 ? (
          present.stripSlots.map((slot) => {
            const isSlotSelected = selectedSlotIndex === slot.index;
            return (
              <div
                key={slot.id}
                className={`layer-row layer-slot-row ${isSlotSelected ? "selected" : ""}`}
                onClick={() => selectSlot(slot.index)}
                onDoubleClick={() => setActiveSlotTab(slot.index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectSlot(slot.index);
                  }
                }}
              >
                <span className="layer-kind-icon" aria-hidden="true">
                  <ImageIcon size={14} />
                </span>
                <div className="layer-name-cell">
                  <span className="layer-name-text">Polaroid Shot {slot.label}</span>
                  <small className="layer-bg-tag">
                    Slot {slot.index + 1} · {slot.objects?.length || 0} overlays
                  </small>
                </div>
                <button
                  type="button"
                  className="layer-ctrl-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSlotTab(slot.index);
                  }}
                  title={`Open Shot ${slot.label} editing tab`}
                  aria-label={`Edit Shot ${slot.label}`}
                >
                  <Pencil size={12} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="layer-row layer-background-row">
            <span className="layer-kind-icon" aria-hidden="true">
              <ImageIcon size={14} />
            </span>
            <div className="layer-name-cell">
              <span className="layer-name-text">
                {present.backgroundLabel || "Captured Photo"}
              </span>
              <small className="layer-bg-tag">Background · Locked</small>
            </div>
            <div className="layer-row-controls">
              <button
                type="button"
                className="layer-ctrl-btn"
                onClick={() =>
                  updateCanvasSettings({
                    backgroundVisible: !present.backgroundVisible
                  })
                }
                title={
                  present.backgroundVisible
                    ? "Hide background photo"
                    : "Show background photo"
                }
                aria-label="Toggle background photograph visibility"
              >
                {present.backgroundVisible ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
              <span
                className="layer-ctrl-btn locked-static"
                title="Background photo stays locked to prevent accidental shifting"
                aria-label="Background locked"
              >
                <Lock size={13} />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
