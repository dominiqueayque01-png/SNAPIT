import { BOOTH_MODES } from "../../constants/modes";

export default function ModeSelector({ currentMode, onSelectMode, disabled }) {
  return (
    <div className="mode-selector-tabs">
      {BOOTH_MODES.map(m => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            className={`mode-tab-pill ${isActive ? "active" : ""}`}
            onClick={() => onSelectMode(m.id)}
            disabled={disabled}
          >
            <span className="mode-tab-title">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
