import { useRef, useState } from "react";
import { Upload, Film, Check, AlertCircle } from "lucide-react";
import { FILTERS } from "../../constants/filters";
import { BACKDROP_SWATCHES } from "../../constants/editorFonts";
import { validateAndProcessUpload } from "../../services/svgSanitizer";
import { useBooth } from "../../context/BoothContext";
import { useEditor } from "../../context/EditorContext";

export default function BackgroundPanel({ onSelectBoothStrip, onSelectSinglePhoto }) {
  const { photos, mode } = useBooth();
  const {
    present,
    activeSlotTab,
    activeSlot,
    updateSlot,
    applyFilterToAllSlots,
    updateCanvasSettings,
    swapBackground,
    flashStatus
  } = useEditor();
  const fileRef = useRef(null);
  const [uploadError, setUploadError] = useState("");

  const handleImportBackground = async (file) => {
    if (!file) return;
    setUploadError("");
    try {
      const processed = await validateAndProcessUpload(file);
      const url = URL.createObjectURL(processed.blob);
      swapBackground({
        backgroundSrc: url,
        docWidth: processed.width,
        docHeight: processed.height,
        backgroundLabel: processed.name
      });
      flashStatus(`Loaded "${processed.name}" (${processed.width}×${processed.height}).`, "success");
    } catch (err) {
      setUploadError(err.message || "Could not load photograph.");
    }
  };

  return (
    <div className="studio-panel-content">
      <div className="panel-section-head">
        <h2>Photo &amp; Backdrop</h2>
        <span className="panel-meta">LOCKED BASE</span>
      </div>

      {/* Captured Booth Photos Switcher */}
      {photos.length > 0 && (
        <div className="panel-sub-block">
          <span className="sub-label">CAPTURED BOOTH ROLL</span>
          <div className="captured-source-grid">
            <button
              type="button"
              className="source-strip-btn"
              onClick={onSelectBoothStrip}
            >
              <Film size={14} />
              <span>Full {mode.toUpperCase()} Composition ({photos.length})</span>
            </button>

            <div className="captured-thumbs-row">
              {photos.map((src, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="captured-thumb-btn"
                  onClick={() => onSelectSinglePhoto(src, idx)}
                  title={`Edit raw photo #${idx + 1} at native resolution`}
                >
                  <img src={src} alt={`Captured pose ${idx + 1}`} />
                  <span className="tabular">0{idx + 1}A</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Import custom background photo */}
      <div className="panel-sub-block">
        <span className="sub-label">REPLACE PHOTOGRAPH</span>
        <button
          type="button"
          className="btn-editor-secondary full-width"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={14} />
          <span>Load Local Photo</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            handleImportBackground(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {uploadError && (
          <div className="panel-error-box" role="alert">
            <AlertCircle size={14} />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Film Stock Filter Grading */}
      <div className="panel-sub-block">
        <span className="sub-label">
          {activeSlot
            ? `SHOT ${activeSlot.label} FILM FILTER`
            : present.stripLayout
            ? "ALL SHOTS FILM FILTER"
            : "FILM STOCK GRADE"}
        </span>
        <div className="bg-filter-grid">
          {FILTERS.map((f) => {
            const currentFilterId = activeSlot
              ? activeSlot.filterId || "normal"
              : present.photoFilterId;
            const active = currentFilterId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                className={`bg-filter-chip ${active ? "active" : ""}`}
                onClick={() => {
                  if (activeSlot && activeSlotTab !== null) {
                    updateSlot(activeSlotTab, { filterId: f.id }, true);
                  } else if (present.stripLayout && present.stripSlots.length > 0) {
                    applyFilterToAllSlots(f.id);
                    flashStatus(`Applied ${f.name} filter to all shots.`, "success");
                  } else {
                    updateCanvasSettings({ photoFilterId: f.id });
                  }
                }}
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

      {/* Canvas Backdrop & Transparency */}
      <div className="panel-sub-block">
        <div className="prop-label-row">
          <span className="sub-label">CANVAS BACKDROP</span>
          <label className="inline-check-label">
            <input
              type="checkbox"
              checked={!!present.transparentBg}
              onChange={(e) =>
                updateCanvasSettings({ transparentBg: e.target.checked })
              }
            />
            <span>Transparent PNG</span>
          </label>
        </div>

        {!present.transparentBg && (
          <div className="swatch-row">
            {BACKDROP_SWATCHES.map((sw) => (
              <button
                key={sw.id}
                type="button"
                className={`color-dot-btn ${present.backgroundColor === sw.color ? "active" : ""}`}
                style={{ backgroundColor: sw.color }}
                title={sw.label}
                aria-label={`Set backdrop to ${sw.label}`}
                onClick={() => updateCanvasSettings({ backgroundColor: sw.color })}
              >
                {present.backgroundColor === sw.color && (
                  <Check size={11} className="swatch-check-mark" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
