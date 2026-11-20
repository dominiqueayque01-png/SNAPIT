import { useState } from "react";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal2,
  FlipVertical2,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Link2,
  Unlink2,
  RotateCw
} from "lucide-react";
import { EDITOR_FONTS, EDITOR_COLOR_SWATCHES } from "../../constants/editorFonts";
import { useEditor } from "../../context/EditorContext";
import SlotInspectorPanel from "./SlotInspectorPanel";

export default function PropertiesPanel({ onOpenSingleShotFull }) {
  const {
    present,
    selectedObject,
    updateObject,
    duplicateObject,
    deleteObject
  } = useEditor();

  const [lockRatio, setLockRatio] = useState(true);

  if (!selectedObject && present.stripLayout && present.stripSlots.length > 0) {
    return <SlotInspectorPanel onOpenSingleShotFull={onOpenSingleShotFull} />;
  }

  if (!selectedObject) {
    return (
      <div className="inspector-empty">
        <h3>Canvas Ready</h3>
        <p>
          Select any sticker, uploaded PNG/SVG, or text box on the canvas to
          adjust its position, size, rotation, and typography.
        </p>
        <div className="inspector-doc-summary tabular">
          <div>
            <span>Dimensions</span>
            <strong>
              {present.docWidth} × {present.docHeight} px
            </strong>
          </div>
          <div>
            <span>Editable Layers</span>
            <strong>{present.objects.length}</strong>
          </div>
          <div>
            <span>Background</span>
            <strong>Locked</strong>
          </div>
        </div>
        <div className="inspector-shortcuts-card">
          <span>Quick Shortcuts</span>
          <ul>
            <li>
              <kbd>Ctrl/⌘ Z</kbd> Undo · <kbd>Shift Z</kbd> Redo
            </li>
            <li>
              <kbd>Ctrl/⌘ D</kbd> Duplicate · <kbd>Del</kbd> Remove
            </li>
            <li>
              <kbd>Arrows</kbd> Nudge · <kbd>Space + Drag</kbd> Pan
            </li>
            <li>
              <kbd>Double-click</kbd> Edit text directly
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const obj = selectedObject;
  const isText = obj.type === "text";
  const isLocked = !!obj.locked;

  const isBold = (obj.fontStyle || "").includes("bold");
  const isItalic = (obj.fontStyle || "").includes("italic");

  const toggleFontStyle = (flag) => {
    const nextBold = flag === "bold" ? !isBold : isBold;
    const nextItalic = flag === "italic" ? !isItalic : isItalic;
    let style = "normal";
    if (nextBold && nextItalic) style = "italic bold";
    else if (nextBold) style = "bold";
    else if (nextItalic) style = "italic";
    updateObject(obj.id, { fontStyle: style }, true);
  };

  const handleWidthChange = (raw) => {
    const w = Math.max(20, Math.round(Number(raw) || 20));
    if (!isText && lockRatio && obj.width && obj.height) {
      const ratio = obj.height / obj.width;
      updateObject(obj.id, { width: w, height: Math.max(20, Math.round(w * ratio)) }, true);
    } else {
      updateObject(obj.id, { width: w }, true);
    }
  };

  const handleHeightChange = (raw) => {
    const h = Math.max(20, Math.round(Number(raw) || 20));
    if (!isText && lockRatio && obj.width && obj.height) {
      const ratio = obj.width / obj.height;
      updateObject(obj.id, { height: h, width: Math.max(20, Math.round(h * ratio)) }, true);
    } else {
      updateObject(obj.id, { height: h }, true);
    }
  };

  return (
    <div className="inspector-content">
      {/* Header: Name + Lock/Duplicate/Delete */}
      <div className="inspector-obj-header">
        <div className="obj-header-meta">
          <span className="obj-kind-pill">{isText ? "TEXT" : obj.isSvg ? "SVG" : "IMAGE"}</span>
          <strong className="obj-header-name">{obj.name || "Layer"}</strong>
        </div>

        <div className="obj-header-actions">
          <button
            type="button"
            className={`mini-icon-btn ${isLocked ? "active" : ""}`}
            onClick={() => updateObject(obj.id, { locked: !isLocked }, true)}
            title={isLocked ? "Unlock layer" : "Lock layer"}
            aria-label={isLocked ? "Unlock layer" : "Lock layer"}
          >
            {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
          <button
            type="button"
            className="mini-icon-btn"
            onClick={() => duplicateObject(obj.id)}
            title="Duplicate layer"
            aria-label="Duplicate layer"
          >
            <Copy size={13} />
          </button>
          <button
            type="button"
            className="mini-icon-btn danger"
            onClick={() => deleteObject(obj.id)}
            disabled={isLocked}
            title="Delete layer"
            aria-label="Delete layer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="locked-notice-bar">
          Layer is locked. Unlock it to move, transform, or delete.
        </div>
      )}

      {/* Text Specific Controls */}
      {isText && (
        <div className="prop-group">
          <span className="prop-group-title">TEXT CONTENT &amp; STYLE</span>

          <textarea
            className="studio-textarea"
            rows={3}
            disabled={isLocked}
            value={obj.text || ""}
            onChange={(e) => updateObject(obj.id, { text: e.target.value }, false)}
            onBlur={(e) => updateObject(obj.id, { text: e.target.value }, true)}
            aria-label="Text content"
          />

          <div className="prop-field-block">
            <label htmlFor="prop-font-family">Font Family</label>
            <select
              id="prop-font-family"
              className="studio-select"
              disabled={isLocked}
              value={obj.fontFamily || "Reenie Beanie"}
              onChange={(e) =>
                updateObject(obj.id, { fontFamily: e.target.value }, true)
              }
            >
              {EDITOR_FONTS.map((f) => (
                <option key={f.id} value={f.family}>
                  {f.label} — {f.role}
                </option>
              ))}
            </select>
          </div>

          <div className="prop-two-col">
            <div className="prop-num-field">
              <label htmlFor="prop-font-size">Size</label>
              <input
                id="prop-font-size"
                type="number"
                min={12}
                max={220}
                disabled={isLocked}
                value={Math.round(obj.fontSize || 42)}
                onChange={(e) =>
                  updateObject(
                    obj.id,
                    { fontSize: Math.max(12, Math.min(220, Number(e.target.value) || 24)) },
                    true
                  )
                }
              />
            </div>

            <div className="prop-num-field">
              <label htmlFor="prop-letter-spacing">Tracking</label>
              <input
                id="prop-letter-spacing"
                type="number"
                min={-4}
                max={24}
                step={0.5}
                disabled={isLocked}
                value={obj.letterSpacing ?? 0}
                onChange={(e) =>
                  updateObject(
                    obj.id,
                    { letterSpacing: Number(e.target.value) || 0 },
                    true
                  )
                }
              />
            </div>
          </div>

          {/* Bold, Italic, Alignment */}
          <div className="text-style-toolbar">
            <button
              type="button"
              className={`style-toggle-btn ${isBold ? "active" : ""}`}
              disabled={isLocked}
              onClick={() => toggleFontStyle("bold")}
              title="Bold"
              aria-label="Toggle bold"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              className={`style-toggle-btn ${isItalic ? "active" : ""}`}
              disabled={isLocked}
              onClick={() => toggleFontStyle("italic")}
              title="Italic"
              aria-label="Toggle italic"
            >
              <Italic size={14} />
            </button>

            <span className="style-divider" />

            {[
              { id: "left", Icon: AlignLeft, label: "Align left" },
              { id: "center", Icon: AlignCenter, label: "Align center" },
              { id: "right", Icon: AlignRight, label: "Align right" }
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                className={`style-toggle-btn ${obj.align === id ? "active" : ""}`}
                disabled={isLocked}
                onClick={() => updateObject(obj.id, { align: id }, true)}
                title={label}
                aria-label={label}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>

          {/* Text Color Swatches + Custom Color Picker */}
          <div className="prop-field-block">
            <div className="prop-label-row">
              <span>Ink Color</span>
              <input
                type="color"
                className="native-color-input"
                disabled={isLocked}
                value={obj.fill || "#2a211f"}
                onChange={(e) => updateObject(obj.id, { fill: e.target.value }, true)}
                aria-label="Custom text color"
              />
            </div>
            <div className="swatch-row">
              {EDITOR_COLOR_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  disabled={isLocked}
                  className={`color-dot-btn ${obj.fill === hex ? "active" : ""}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => updateObject(obj.id, { fill: hex }, true)}
                  aria-label={`Set ink color to ${hex}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transform Controls (Position, Dimensions, Rotation, Opacity) */}
      <div className="prop-group">
        <span className="prop-group-title">POSITION &amp; SIZE</span>

        <div className="prop-two-col">
          <div className="prop-num-field">
            <label htmlFor="prop-pos-x">X</label>
            <input
              id="prop-pos-x"
              type="number"
              disabled={isLocked}
              value={Math.round(obj.x || 0)}
              onChange={(e) =>
                updateObject(obj.id, { x: Math.round(Number(e.target.value) || 0) }, true)
              }
            />
          </div>
          <div className="prop-num-field">
            <label htmlFor="prop-pos-y">Y</label>
            <input
              id="prop-pos-y"
              type="number"
              disabled={isLocked}
              value={Math.round(obj.y || 0)}
              onChange={(e) =>
                updateObject(obj.id, { y: Math.round(Number(e.target.value) || 0) }, true)
              }
            />
          </div>
        </div>

        <div className="prop-size-row">
          <div className="prop-num-field">
            <label htmlFor="prop-size-w">W</label>
            <input
              id="prop-size-w"
              type="number"
              min={20}
              disabled={isLocked}
              value={Math.round(obj.width || 100)}
              onChange={(e) => handleWidthChange(e.target.value)}
            />
          </div>

          {!isText && (
            <>
              <button
                type="button"
                className={`ratio-lock-btn ${lockRatio ? "active" : ""}`}
                onClick={() => setLockRatio((prev) => !prev)}
                title={lockRatio ? "Aspect ratio locked" : "Aspect ratio unlocked"}
                aria-label="Toggle aspect ratio lock"
              >
                {lockRatio ? <Link2 size={13} /> : <Unlink2 size={13} />}
              </button>

              <div className="prop-num-field">
                <label htmlFor="prop-size-h">H</label>
                <input
                  id="prop-size-h"
                  type="number"
                  min={20}
                  disabled={isLocked}
                  value={Math.round(obj.height || 100)}
                  onChange={(e) => handleHeightChange(e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {/* Rotation */}
        <div className="prop-field-block">
          <div className="prop-label-row">
            <label htmlFor="prop-rotation">Rotation</label>
            <div className="rot-inline-actions">
              <span className="tabular">{Math.round(obj.rotation || 0)}°</span>
              <button
                type="button"
                className="mini-text-btn"
                disabled={isLocked}
                onClick={() =>
                  updateObject(obj.id, { rotation: ((obj.rotation || 0) + 15) % 360 }, true)
                }
                title="Rotate +15°"
              >
                <RotateCw size={12} /> +15°
              </button>
            </div>
          </div>
          <input
            id="prop-rotation"
            type="range"
            min={-180}
            max={180}
            step={1}
            disabled={isLocked}
            value={Math.round(obj.rotation || 0)}
            onChange={(e) =>
              updateObject(obj.id, { rotation: Number(e.target.value) }, false)
            }
            onPointerUp={(e) =>
              updateObject(obj.id, { rotation: Number(e.target.value) }, true)
            }
          />
        </div>

        {/* Opacity */}
        <div className="prop-field-block">
          <div className="prop-label-row">
            <label htmlFor="prop-opacity">Opacity</label>
            <span className="tabular">{Math.round((obj.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            id="prop-opacity"
            type="range"
            min={0.05}
            max={1}
            step={0.05}
            disabled={isLocked}
            value={obj.opacity ?? 1}
            onChange={(e) =>
              updateObject(obj.id, { opacity: parseFloat(e.target.value) }, false)
            }
            onPointerUp={(e) =>
              updateObject(obj.id, { opacity: parseFloat(e.target.value) }, true)
            }
          />
        </div>

        {/* Flip buttons for image/SVG assets */}
        {!isText && (
          <div className="prop-flip-row">
            <button
              type="button"
              className={`btn-editor-secondary ${obj.flipX ? "active" : ""}`}
              disabled={isLocked}
              onClick={() => updateObject(obj.id, { flipX: !obj.flipX }, true)}
            >
              <FlipHorizontal2 size={14} />
              <span>Flip H</span>
            </button>
            <button
              type="button"
              className={`btn-editor-secondary ${obj.flipY ? "active" : ""}`}
              disabled={isLocked}
              onClick={() => updateObject(obj.id, { flipY: !obj.flipY }, true)}
            >
              <FlipVertical2 size={14} />
              <span>Flip V</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
