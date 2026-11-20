import { Plus } from "lucide-react";
import { EDITOR_FONTS, TEXT_PRESETS } from "../../constants/editorFonts";
import { useEditor } from "../../context/EditorContext";

export default function TextToolPanel() {
  const { addTextObject } = useEditor();

  return (
    <div className="studio-panel-content">
      <div className="panel-section-head">
        <h2>Typography</h2>
        <span className="panel-meta">MULTI-LAYER</span>
      </div>

      <button
        type="button"
        className="btn-editor-primary full-width"
        onClick={() =>
          addTextObject({
            label: "Custom Note",
            text: "Your caption here",
            fontFamily: "Reenie Beanie",
            fontSize: 52,
            fill: "#2a211f"
          })
        }
      >
        <Plus size={15} />
        <span>Add Text Box</span>
      </button>

      <div className="panel-sub-block">
        <span className="sub-label">STUDIO PRESETS</span>
        <div className="text-preset-stack">
          {TEXT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="text-preset-card"
              onClick={() => addTextObject(preset)}
            >
              <span
                className="preset-preview-line"
                style={{
                  fontFamily: preset.fontFamily,
                  fontWeight: preset.fontStyle.includes("bold") ? 700 : 400
                }}
              >
                {preset.text}
              </span>
              <span className="preset-preview-meta">
                {preset.label} · {preset.fontFamily}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="panel-sub-block">
        <span className="sub-label">STUDIO TYPEFACES</span>
        <div className="font-specimen-list">
          {EDITOR_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              className="font-specimen-btn"
              onClick={() =>
                addTextObject({
                  label: font.label,
                  text: font.sample,
                  fontFamily: font.family,
                  fontSize: font.id === "reenie-beanie" ? 56 : 42,
                  fill: "#2a211f"
                })
              }
            >
              <strong style={{ fontFamily: font.family }}>{font.sample}</strong>
              <small>{font.label} — {font.role}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
