import { SlidersHorizontal, Layers } from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import PropertiesPanel from "./PropertiesPanel";
import LayersPanel from "./LayersPanel";

export default function InspectorSidebar({
  activeTab,
  onSelectTab,
  onOpenSingleShotFull
}) {
  const { present, activeSlot, activeObjects } = useEditor();
  const baseCount = activeSlot
    ? 1
    : present.stripSlots.length > 0
    ? present.stripSlots.length
    : 1;

  return (
    <aside className="studio-right-sidebar" aria-label="Properties and layers inspector">
      <div className="inspector-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "properties"}
          className={`inspector-tab-btn ${activeTab === "properties" ? "active" : ""}`}
          onClick={() => onSelectTab("properties")}
        >
          <SlidersHorizontal size={14} />
          <span>Properties</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "layers"}
          className={`inspector-tab-btn ${activeTab === "layers" ? "active" : ""}`}
          onClick={() => onSelectTab("layers")}
        >
          <Layers size={14} />
          <span>Layers</span>
          <span className="tab-count tabular">{activeObjects.length + baseCount}</span>
        </button>
      </div>

      <div className="inspector-body">
        {activeTab === "properties" ? (
          <PropertiesPanel onOpenSingleShotFull={onOpenSingleShotFull} />
        ) : (
          <LayersPanel />
        )}
      </div>
    </aside>
  );
}
