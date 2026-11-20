import {
  Sticker,
  Frame,
  Sparkles,
  Type,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import StickerLibraryPanel from "./StickerLibraryPanel";
import FrameOverlayPanel from "./FrameOverlayPanel";
import TextToolPanel from "./TextToolPanel";
import UploadPanel from "./UploadPanel";
import BackgroundPanel from "./BackgroundPanel";

const RAIL_TABS = [
  { id: "stickers", label: "Stickers", Icon: Sticker },
  { id: "frames", label: "Frames", Icon: Frame },
  { id: "overlays", label: "Overlays", Icon: Sparkles },
  { id: "text", label: "Text", Icon: Type },
  { id: "uploads", label: "Uploads", Icon: Upload },
  { id: "backgrounds", label: "Photo", Icon: ImageIcon }
];

export default function AssetSidebar({
  activeTab,
  onSelectTab,
  onSelectBoothStrip,
  onSelectSinglePhoto
}) {
  return (
    <aside className="studio-left-sidebar" aria-label="Creative asset tools">
      <nav className="studio-icon-rail" aria-label="Editor tool categories">
        {RAIL_TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            className={`rail-tab-btn ${activeTab === id ? "active" : ""}`}
            onClick={() => onSelectTab(id)}
            aria-pressed={activeTab === id}
            title={label}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="studio-asset-drawer">
        {activeTab === "stickers" && <StickerLibraryPanel />}
        {activeTab === "frames" && <FrameOverlayPanel mode="frames" />}
        {activeTab === "overlays" && <FrameOverlayPanel mode="overlays" />}
        {activeTab === "text" && <TextToolPanel />}
        {activeTab === "uploads" && <UploadPanel />}
        {activeTab === "backgrounds" && (
          <BackgroundPanel
            onSelectBoothStrip={onSelectBoothStrip}
            onSelectSinglePhoto={onSelectSinglePhoto}
          />
        )}
      </div>
    </aside>
  );
}
