import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { EDITOR_STICKER_PACKS, ALL_EDITOR_STICKERS } from "../../constants/editorStickers";
import { useEditor } from "../../context/EditorContext";

export default function StickerLibraryPanel() {
  const { addStickerOrImage } = useEditor();
  const [activeCategory, setActiveCategory] = useState(EDITOR_STICKER_PACKS[0].id);
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return ALL_EDITOR_STICKERS.filter((item) =>
        item.label.toLowerCase().includes(q)
      );
    }
    const pack =
      EDITOR_STICKER_PACKS.find((p) => p.id === activeCategory) ||
      EDITOR_STICKER_PACKS[0];
    return pack.items;
  }, [activeCategory, query]);

  return (
    <div className="studio-panel-content">
      <div className="panel-section-head">
        <h2>Stickers &amp; Decor</h2>
        <span className="panel-meta tabular">{ALL_EDITOR_STICKERS.length} SVG</span>
      </div>

      <div className="panel-search-box">
        <Search size={14} className="search-icon" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stickers, film, washi..."
          aria-label="Search stickers"
        />
      </div>

      {!query.trim() && (
        <div className="category-pill-wrap" role="tablist" aria-label="Sticker categories">
          {EDITOR_STICKER_PACKS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === pack.id}
              className={`cat-pill ${activeCategory === pack.id ? "active" : ""}`}
              onClick={() => setActiveCategory(pack.id)}
            >
              {pack.label}
            </button>
          ))}
        </div>
      )}

      {visibleItems.length === 0 ? (
        <div className="panel-empty-box">
          <p>No decorative assets match &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <div className="sticker-svg-grid">
          {visibleItems.map((st) => (
            <button
              key={st.id}
              type="button"
              className="sticker-svg-card"
              onClick={() =>
                addStickerOrImage({
                  src: st.src,
                  name: st.label,
                  width: st.width,
                  height: st.height,
                  isSvg: true
                })
              }
              title={`Add ${st.label} to canvas`}
            >
              <div className="sticker-svg-thumb">
                <img src={st.src} alt={st.label} loading="lazy" />
              </div>
              <span className="sticker-svg-name">{st.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
