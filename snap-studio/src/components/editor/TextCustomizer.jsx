import { Sparkles } from "lucide-react";

const PRESET_PHRASES = [
  "my little moment ✿",
  "best day ever! ✨",
  "sweet memories ♡",
  "polaroid vibes ✦",
  "forever & always 🤍",
  "girls night out 🎀"
];

export default function TextCustomizer({ customText, onChangeText }) {
  return (
    <div className="text-customizer-component">
      <div className="editor-subheading">
        <span>CUSTOM CAPTION ✍️</span>
      </div>

      <div className="caption-input-wrapper">
        <input
          type="text"
          className="caption-text-input"
          value={customText}
          maxLength={36}
          onChange={e => onChangeText(e.target.value)}
          placeholder="Write your cute message..."
        />
        <Sparkles size={16} className="input-sparkle-icon" />
      </div>

      <div className="preset-phrases-row">
        {PRESET_PHRASES.map((phrase, i) => (
          <button
            key={i}
            className="preset-phrase-chip"
            onClick={() => onChangeText(phrase)}
          >
            {phrase}
          </button>
        ))}
      </div>
    </div>
  );
}
