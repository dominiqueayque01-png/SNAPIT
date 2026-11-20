import { PenLine, X } from "lucide-react";

const PRESET_PHRASES = [
  "sunday light, desk roll",
  "late afternoon proof",
  "frame 04 — keeper",
  "quiet studio notes",
  "analog keepsake",
  "golden hour roll"
];

export default function TextCustomizer({ customText, onChangeText }) {
  const isNearLimit = customText.length >= 30;

  return (
    <div className="editor-panel-block">
      <div className="editor-subheading">
        <span>CHIN INSCRIPTION</span>
        <span className={`subheading-meta tabular ${isNearLimit ? "meta-warning" : ""}`}>
          {customText.length}/36
        </span>
      </div>

      <div className="caption-input-wrapper">
        <PenLine size={15} className="caption-input-icon" />
        <input
          type="text"
          className="caption-text-input"
          value={customText}
          maxLength={36}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Write a handwritten chin note..."
        />
        {customText && (
          <button
            type="button"
            className="btn-clear-caption"
            onClick={() => onChangeText("")}
            title="Clear caption"
            aria-label="Clear caption"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="preset-phrases-row">
        {PRESET_PHRASES.map((phrase, i) => {
          const isSelected = customText === phrase;
          return (
            <button
              key={i}
              type="button"
              className={`preset-phrase-chip ${isSelected ? "selected" : ""}`}
              onClick={() => onChangeText(phrase)}
            >
              {phrase}
            </button>
          );
        })}
      </div>
    </div>
  );
}
