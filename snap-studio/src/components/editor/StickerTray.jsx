import { useState } from "react";
import { STICKER_CATEGORIES } from "../../constants/stickers";

export default function StickerTray({ onAddSticker }) {
  const [activeTab, setActiveTab] = useState(STICKER_CATEGORIES[0].id);

  const currentCategory =
    STICKER_CATEGORIES.find((c) => c.id === activeTab) || STICKER_CATEGORIES[0];

  return (
    <div className="editor-panel-block">
      <div className="editor-subheading">
        <span>STAMPS &amp; MARKERS</span>
        <span className="subheading-meta">DRAGGABLE</span>
      </div>

      <div className="sticker-category-tabs">
        {STICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`sticker-tab-pill ${activeTab === cat.id ? "active" : ""}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="stickers-grid-palette">
        {currentCategory.stickers.map((st) => (
          <button
            key={st.id}
            type="button"
            className="sticker-palette-item"
            onClick={() => onAddSticker(st)}
            title={`Add ${st.label}`}
          >
            <span className="sticker-emoji">{st.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
