import { FRAMES } from "../../constants/frames";

export default function FramePicker({ selectedFrame, onSelectFrame }) {
  return (
    <div className="frame-picker-component">
      <div className="editor-subheading">
        <span>FRAMES & COLORS ♡</span>
      </div>

      <div className="frames-grid">
        {FRAMES.map(fr => {
          const isSelected = selectedFrame.id === fr.id;
          return (
            <button
              key={fr.id}
              className={`frame-option-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectFrame(fr)}
            >
              <span
                className="frame-color-circle"
                style={{
                  backgroundColor: fr.bg,
                  borderColor: fr.borderColor || "#ddd"
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
