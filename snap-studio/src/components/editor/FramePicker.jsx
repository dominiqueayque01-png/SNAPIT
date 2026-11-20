import { FRAMES } from "../../constants/frames";

export default function FramePicker({ selectedFrame, onSelectFrame }) {
  return (
    <div className="editor-panel-block">
      <div className="editor-subheading">
        <span>PAPER STOCK</span>
        <span className="subheading-meta tabular">{FRAMES.length} BORDERS</span>
      </div>

      <div className="frames-grid">
        {FRAMES.map((fr) => {
          const isSelected = selectedFrame.id === fr.id;
          return (
            <button
              key={fr.id}
              type="button"
              className={`frame-option-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectFrame(fr)}
            >
              <span
                className="frame-color-swatch"
                style={{
                  backgroundColor: fr.bg,
                  borderColor: fr.borderColor || "#c9c2b6"
                }}
              />
              <span className="frame-name">{fr.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
