import { Film, LayoutGrid, Sparkles } from "lucide-react";
import { FILTERS } from "../../constants/filters";
import { useEditor } from "../../context/EditorContext";

function getStripOutputLabel(mode) {
  if (mode === "strip-3") return "Final 3-Cut";
  if (mode === "grid-4") return "Final 2×2";
  return "Final 4-Strip";
}

export default function StripTabsBar() {
  const { present, activeSlotTab, setActiveSlotTab } = useEditor();

  if (!present.stripLayout || !present.stripSlots.length) return null;

  const isGrid = present.stripLayout.mode === "grid-4";
  const finalLabel = getStripOutputLabel(present.stripLayout.mode);

  return (
    <div
      className="strip-tabs-bar"
      role="tablist"
      aria-label="Individual shot tabs and final Polaroid strip output"
    >
      <div className="strip-tabs-shots">
        {present.stripSlots.map((slot) => {
          const isActive = activeSlotTab === slot.index;
          const filterMeta =
            FILTERS.find((f) => f.id === (slot.filterId || "normal")) || FILTERS[0];
          const layerCount = slot.objects?.length || 0;

          return (
            <button
              key={slot.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`strip-shot-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveSlotTab(slot.index)}
              title={`Edit Shot ${slot.label} (${filterMeta.name} filter)`}
            >
              <span className="strip-tab-thumb">
                {slot.src && (
                  <img
                    src={slot.src}
                    alt={`Shot ${slot.label}`}
                    style={{
                      filter: filterMeta.css,
                      transform: slot.flipX ? "scaleX(-1)" : undefined
                    }}
                  />
                )}
              </span>
              <span className="strip-tab-meta">
                <span className="strip-tab-title tabular">Shot {slot.label}</span>
                <span className="strip-tab-filter">{filterMeta.name}</span>
              </span>
              {layerCount > 0 && (
                <span
                  className="strip-tab-badge tabular"
                  title={`${layerCount} sticker/text layer${layerCount > 1 ? "s" : ""}`}
                >
                  <Sparkles size={9} />
                  {layerCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="strip-tabs-divider" aria-hidden="true" />

      <button
        type="button"
        role="tab"
        aria-selected={activeSlotTab === null}
        className={`strip-final-tab ${activeSlotTab === null ? "active" : ""}`}
        onClick={() => setActiveSlotTab(null)}
        title={`View combined ${finalLabel} output`}
      >
        {isGrid ? <LayoutGrid size={14} /> : <Film size={14} />}
        <span>{finalLabel}</span>
      </button>
    </div>
  );
}
