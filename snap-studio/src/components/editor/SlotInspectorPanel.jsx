import { useRef, useState } from "react";
import {
  FlipHorizontal2,
  RotateCcw,
  Upload,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Film,
  Pencil
} from "lucide-react";
import { FILTERS } from "../../constants/filters";
import { FRAME_COLOR_PRESETS } from "../../constants/editorFrames";
import { validateAndProcessUpload } from "../../services/svgSanitizer";
import { useEditor } from "../../context/EditorContext";

export default function SlotInspectorPanel() {
  const {
    present,
    selectedSlotIndex,
    selectedSlot,
    activeSlotTab,
    activeSlot,
    selectSlot,
    setActiveSlotTab,
    updateSlot,
    applyFilterToAllSlots,
    swapSlots,
    updateStripLayout,
    flashStatus
  } = useEditor();

  const replaceInputRef = useRef(null);
  const [replaceError, setReplaceError] = useState("");

  if (!present.stripLayout || !present.stripSlots.length) return null;

  const isEditingSingleShot = activeSlotTab !== null && !!activeSlot;
  const activeIndex = isEditingSingleShot ? activeSlotTab : selectedSlotIndex ?? 0;
  const slot = isEditingSingleShot
    ? activeSlot
    : selectedSlot || present.stripSlots[activeIndex];
  const total = present.stripSlots.length;

  const handleReplaceSlotPhoto = async (file) => {
    if (!file) return;
    setReplaceError("");
    try {
      const processed = await validateAndProcessUpload(file);
      const url = URL.createObjectURL(processed.blob);
      updateSlot(
        activeIndex,
        {
          src: url,
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          brightness: 100,
          contrast: 100
        },
        true
      );
      flashStatus(`Replaced Shot ${slot.label} with "${processed.name}".`, "success");
    } catch (err) {
      setReplaceError(err.message || "Unsupported photo format.");
    }
  };

  const handleResetSlot = () => {
    updateSlot(
      activeIndex,
      {
        filterId: "normal",
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        flipX: false,
        brightness: 100,
        contrast: 100
      },
      true
    );
    flashStatus(`Reset Shot ${slot.label} filter & tone.`, "info");
  };

  // =========================================================================
  // VIEW A: INDIVIDUAL SHOT EDITING TAB (Shot 01A .. 04A)
  // =========================================================================
  if (isEditingSingleShot) {
    return (
      <div className="inspector-content">
        {/* Active Shot Navigation Header */}
        <div className="prop-group">
          <div className="prop-label-row">
            <span className="prop-group-title">EDITING SHOT {slot.label}</span>
            <span className="panel-meta tabular">
              {activeIndex + 1} / {total}
            </span>
          </div>

          <div className="slot-order-actions">
            <button
              type="button"
              className="btn-editor-secondary"
              disabled={activeIndex <= 0}
              onClick={() => setActiveSlotTab(activeIndex - 1)}
              title="Previous shot tab"
            >
              <ChevronLeft size={13} />
              <span>Prev Shot</span>
            </button>
            <button
              type="button"
              className="btn-editor-secondary"
              disabled={activeIndex >= total - 1}
              onClick={() => setActiveSlotTab(activeIndex + 1)}
              title="Next shot tab"
            >
              <span>Next Shot</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <button
            type="button"
            className="btn-editor-primary full-width"
            onClick={() => setActiveSlotTab(null)}
          >
            <Film size={14} />
            <span>Preview Final Strip</span>
          </button>
        </div>

        {/* Per-Shot Film Stock Filter */}
        <div className="prop-group">
          <div className="prop-label-row">
            <span className="prop-group-title">SHOT {slot.label} FILTER</span>
            <button
              type="button"
              className="mini-text-btn"
              onClick={() => {
                applyFilterToAllSlots(slot.filterId || "normal");
                flashStatus("Applied filter to all shots in strip.", "success");
              }}
              title="Apply this shot's filter to every shot"
            >
              <Sparkles size={11} />
              <span>All Shots</span>
            </button>
          </div>

          <div className="bg-filter-grid">
            {FILTERS.map((f) => {
              const active = (slot.filterId || "normal") === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`bg-filter-chip ${active ? "active" : ""}`}
                  onClick={() => updateSlot(activeIndex, { filterId: f.id }, true)}
                >
                  <span
                    className="bg-filter-preview"
                    style={{ filter: f.css }}
                    aria-hidden="true"
                  />
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Per-Shot Tone & Framing */}
        <div className="prop-group">
          <div className="prop-label-row">
            <span className="prop-group-title">TONE &amp; FRAMING</span>
            <button
              type="button"
              className="mini-text-btn"
              onClick={handleResetSlot}
              title="Reset this shot's adjustments"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
          </div>

          <div className="prop-field-block">
            <div className="prop-label-row">
              <label htmlFor="slot-brightness">Exposure</label>
              <span className="tabular">{slot.brightness ?? 100}%</span>
            </div>
            <input
              id="slot-brightness"
              type="range"
              min={70}
              max={135}
              step={1}
              value={slot.brightness ?? 100}
              onChange={(e) =>
                updateSlot(activeIndex, { brightness: Number(e.target.value) }, false)
              }
              onPointerUp={(e) =>
                updateSlot(activeIndex, { brightness: Number(e.target.value) }, true)
              }
            />
          </div>

          <div className="prop-field-block">
            <div className="prop-label-row">
              <label htmlFor="slot-contrast">Contrast</label>
              <span className="tabular">{slot.contrast ?? 100}%</span>
            </div>
            <input
              id="slot-contrast"
              type="range"
              min={70}
              max={145}
              step={1}
              value={slot.contrast ?? 100}
              onChange={(e) =>
                updateSlot(activeIndex, { contrast: Number(e.target.value) }, false)
              }
              onPointerUp={(e) =>
                updateSlot(activeIndex, { contrast: Number(e.target.value) }, true)
              }
            />
          </div>

          <div className="prop-field-block">
            <div className="prop-label-row">
              <label htmlFor="slot-zoom">Crop Zoom</label>
              <span className="tabular">{(slot.zoom || 1).toFixed(2)}×</span>
            </div>
            <input
              id="slot-zoom"
              type="range"
              min={1}
              max={2.4}
              step={0.05}
              value={slot.zoom || 1}
              onChange={(e) =>
                updateSlot(activeIndex, { zoom: parseFloat(e.target.value) }, false)
              }
              onPointerUp={(e) =>
                updateSlot(activeIndex, { zoom: parseFloat(e.target.value) }, true)
              }
            />
          </div>

          <div className="prop-two-col">
            <div className="prop-field-block">
              <div className="prop-label-row">
                <label htmlFor="slot-pan-x">Pan X</label>
                <span className="tabular">{Math.round(slot.offsetX || 0)}</span>
              </div>
              <input
                id="slot-pan-x"
                type="range"
                min={-100}
                max={100}
                step={2}
                value={slot.offsetX || 0}
                onChange={(e) =>
                  updateSlot(activeIndex, { offsetX: Number(e.target.value) }, false)
                }
                onPointerUp={(e) =>
                  updateSlot(activeIndex, { offsetX: Number(e.target.value) }, true)
                }
              />
            </div>

            <div className="prop-field-block">
              <div className="prop-label-row">
                <label htmlFor="slot-pan-y">Pan Y</label>
                <span className="tabular">{Math.round(slot.offsetY || 0)}</span>
              </div>
              <input
                id="slot-pan-y"
                type="range"
                min={-100}
                max={100}
                step={2}
                value={slot.offsetY || 0}
                onChange={(e) =>
                  updateSlot(activeIndex, { offsetY: Number(e.target.value) }, false)
                }
                onPointerUp={(e) =>
                  updateSlot(activeIndex, { offsetY: Number(e.target.value) }, true)
                }
              />
            </div>
          </div>

          <div className="prop-flip-row">
            <button
              type="button"
              className={`btn-editor-secondary ${slot.flipX ? "active" : ""}`}
              onClick={() => updateSlot(activeIndex, { flipX: !slot.flipX }, true)}
            >
              <FlipHorizontal2 size={13} />
              <span>Mirror</span>
            </button>

            <button
              type="button"
              className="btn-editor-secondary"
              onClick={() => replaceInputRef.current?.click()}
            >
              <Upload size={13} />
              <span>Replace</span>
            </button>
          </div>

          <input
            ref={replaceInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              handleReplaceSlotPhoto(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {replaceError && (
            <div className="panel-error-box" role="alert">
              <AlertCircle size={14} />
              <span>{replaceError}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: FINAL STRIP OUTPUT TAB (Combined 3-Cut / 4-Strip / 2x2)
  // =========================================================================
  return (
    <div className="inspector-content">
      {/* Final Strip Shot Directory & Order */}
      <div className="prop-group">
        <div className="prop-label-row">
          <span className="prop-group-title">FINAL STRIP SHOTS</span>
          <span className="panel-meta tabular">{total} SHOTS</span>
        </div>

        <div className="slot-picker-grid" role="group" aria-label="Polaroid strip shots">
          {present.stripSlots.map((s) => {
            const filterMeta =
              FILTERS.find((f) => f.id === (s.filterId || "normal")) || FILTERS[0];
            return (
              <button
                key={s.id}
                type="button"
                className={`slot-picker-pill ${s.index === activeIndex ? "active" : ""}`}
                onClick={() => selectSlot(s.index)}
                onDoubleClick={() => setActiveSlotTab(s.index)}
                title={`Select Shot ${s.label} (double-click to edit)`}
              >
                <span className="slot-pill-thumb">
                  {s.src && (
                    <img
                      src={s.src}
                      alt={`Shot ${s.label}`}
                      style={{ filter: filterMeta.css }}
                    />
                  )}
                </span>
                <span className="tabular">{s.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn-editor-primary full-width"
          onClick={() => setActiveSlotTab(activeIndex)}
        >
          <Pencil size={13} />
          <span>Edit Shot {slot.label} Tab</span>
        </button>

        <div className="slot-order-actions">
          <button
            type="button"
            className="btn-editor-secondary"
            disabled={activeIndex <= 0}
            onClick={() => swapSlots(activeIndex, activeIndex - 1)}
            title="Swap with previous shot"
          >
            <ArrowUp size={13} />
            <span>Swap Earlier</span>
          </button>
          <button
            type="button"
            className="btn-editor-secondary"
            disabled={activeIndex >= total - 1}
            onClick={() => swapSlots(activeIndex, activeIndex + 1)}
            title="Swap with next shot"
          >
            <ArrowDown size={13} />
            <span>Swap Later</span>
          </button>
        </div>
      </div>

      {/* Polaroid Strip Paper & Chin Caption */}
      <div className="prop-group">
        <span className="prop-group-title">STRIP PAPER &amp; CHIN NOTE</span>

        <div className="swatch-row">
          {FRAME_COLOR_PRESETS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`color-dot-btn ${
                present.stripLayout.paperColor === c.bg ? "active" : ""
              }`}
              style={{ backgroundColor: c.bg }}
              title={c.label}
              aria-label={`Set strip paper to ${c.label}`}
              onClick={() =>
                updateStripLayout({
                  paperColor: c.bg,
                  textColor: c.text
                })
              }
            />
          ))}
        </div>

        <input
          type="text"
          maxLength={42}
          className="studio-text-input"
          value={present.stripLayout.caption || ""}
          onChange={(e) =>
            updateStripLayout({ caption: e.target.value }, false)
          }
          onBlur={(e) =>
            updateStripLayout({ caption: e.target.value }, true)
          }
          placeholder="Write Polaroid strip chin note..."
          aria-label="Polaroid strip chin note"
        />
      </div>
    </div>
  );
}
