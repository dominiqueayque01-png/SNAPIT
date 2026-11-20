import { Check } from "lucide-react";
import { EDITOR_FRAMES, FRAME_COLOR_PRESETS } from "../../constants/editorFrames";
import { EDITOR_OVERLAYS } from "../../constants/editorOverlays";
import { useEditor } from "../../context/EditorContext";

export default function FrameOverlayPanel({ mode = "frames" }) {
  const { present, updateCanvasSettings, toggleOverlay } = useEditor();

  if (mode === "overlays") {
    return (
      <div className="studio-panel-content">
        <div className="panel-section-head">
          <h2>Film Overlays</h2>
          <span className="panel-meta tabular">
            {present.overlayIds.length} ACTIVE
          </span>
        </div>

        <p className="panel-helper">
          Layer film grain, warm light leaks, analog vignettes, and quartz date
          imprints over your composition.
        </p>

        <div className="overlay-card-list">
          {EDITOR_OVERLAYS.map((ov) => {
            const active = present.overlayIds.includes(ov.id);
            return (
              <button
                key={ov.id}
                type="button"
                className={`overlay-toggle-card ${active ? "active" : ""}`}
                onClick={() => toggleOverlay(ov.id)}
                aria-pressed={active}
              >
                <span
                  className="overlay-swatch"
                  style={{ background: ov.swatch }}
                  aria-hidden="true"
                />
                <span className="overlay-info">
                  <strong>{ov.name}</strong>
                  <small>{ov.description}</small>
                </span>
                <span className="overlay-check" aria-hidden="true">
                  {active && <Check size={14} />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="prop-field-block">
          <div className="prop-label-row">
            <label htmlFor="overlay-intensity">Overlay Intensity</label>
            <span className="tabular">{Math.round((present.overlayOpacity ?? 0.55) * 100)}%</span>
          </div>
          <input
            id="overlay-intensity"
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={present.overlayOpacity ?? 0.55}
            onChange={(e) =>
              updateCanvasSettings(
                { overlayOpacity: parseFloat(e.target.value) },
                false
              )
            }
            onPointerUp={(e) =>
              updateCanvasSettings(
                { overlayOpacity: parseFloat(e.target.value) },
                true
              )
            }
          />
        </div>
      </div>
    );
  }

  const supportsColor = [
    "classic-polaroid",
    "blush-polaroid",
    "pastel-double",
    "minimalist-mat",
    "scrapbook-washi"
  ].includes(present.frameId);

  const supportsCaption = [
    "classic-polaroid",
    "blush-polaroid",
    "scrapbook-washi"
  ].includes(present.frameId);

  return (
    <div className="studio-panel-content">
      <div className="panel-section-head">
        <h2>Polaroid Frames</h2>
        <span className="panel-meta tabular">{EDITOR_FRAMES.length} STYLES</span>
      </div>

      <div className="frame-preset-grid">
        {EDITOR_FRAMES.map((fr) => {
          const isSelected = present.frameId === fr.id;
          return (
            <button
              key={fr.id}
              type="button"
              className={`frame-preset-card ${isSelected ? "active" : ""}`}
              onClick={() =>
                updateCanvasSettings({
                  frameId: fr.id,
                  frameColor: fr.defaultColor,
                  frameTextColor: fr.textColor
                })
              }
            >
              <span
                className="frame-mini-box"
                style={{ backgroundColor: fr.previewBg }}
                aria-hidden="true"
              >
                <span className="frame-mini-window" />
              </span>
              <span className="frame-preset-name">{fr.name}</span>
              <span className="frame-preset-sub">{fr.subtitle}</span>
            </button>
          );
        })}
      </div>

      {supportsColor && (
        <div className="prop-field-block">
          <div className="prop-label-row">
            <span>Frame Paper Stock</span>
          </div>
          <div className="swatch-row">
            {FRAME_COLOR_PRESETS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`color-dot-btn ${present.frameColor === c.bg ? "active" : ""}`}
                style={{ backgroundColor: c.bg }}
                title={c.label}
                aria-label={`Set frame stock to ${c.label}`}
                onClick={() =>
                  updateCanvasSettings({
                    frameColor: c.bg,
                    frameTextColor: c.text
                  })
                }
              />
            ))}
          </div>
        </div>
      )}

      {supportsCaption && (
        <div className="prop-field-block">
          <div className="prop-label-row">
            <label htmlFor="polaroid-chin-caption">Polaroid Chin Note</label>
            <span className="tabular">{(present.frameCaption || "").length}/42</span>
          </div>
          <input
            id="polaroid-chin-caption"
            type="text"
            maxLength={42}
            className="studio-text-input"
            value={present.frameCaption || ""}
            onChange={(e) =>
              updateCanvasSettings({ frameCaption: e.target.value }, false)
            }
            onBlur={(e) =>
              updateCanvasSettings({ frameCaption: e.target.value }, true)
            }
            placeholder="Write a Polaroid chin caption..."
          />
        </div>
      )}
    </div>
  );
}
