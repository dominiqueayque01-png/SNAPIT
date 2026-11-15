import { useState, useRef } from "react";
import { ArrowLeft, Download, RotateCcw, Sparkles } from "lucide-react";
import { useBooth } from "../context/BoothContext";
import FilterBar from "../components/editor/FilterBar";
import FramePicker from "../components/editor/FramePicker";
import StickerTray from "../components/editor/StickerTray";
import TextCustomizer from "../components/editor/TextCustomizer";
import StickerCanvas from "../components/editor/StickerCanvas";
import DownloadModal from "../components/export/DownloadModal";

export default function Editor() {
  const {
    photos,
    mode,
    selectedFilter,
    setSelectedFilter,
    selectedFrame,
    setSelectedFrame,
    stickers,
    addSticker,
    updateSticker,
    removeSticker,
    clearPhotos,
    customText,
    setCustomText,
    setCurrentView
  } = useBooth();

  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const stripContainerRef = useRef(null);

  const isGrid = mode === "grid-4";
  const dateFormatted = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return (
    <div className="editor-page-container">
      {/* Editor Header Navigation */}
      <header className="editor-nav-header">
        <button
          className="btn-nav-back"
          onClick={() => setCurrentView("booth")}
        >
          <ArrowLeft size={18} />
          <span>Back to Camera</span>
        </button>

        <div className="editor-header-title">
          <h2>DECORATE YOUR STRIP ✦</h2>
        </div>

        <button
          className="btn-save-strip"
          onClick={() => setIsDownloadOpen(true)}
        >
          <Download size={18} />
          <span>Save & Download</span>
        </button>
      </header>

      {/* Editor Workspace: Preview Left, Tools Right */}
      <main className="editor-workspace-layout">
        {/* Preview Board */}
        <section className="strip-canvas-board">
          <div
            ref={stripContainerRef}
            className={`editor-strip-preview ${isGrid ? "grid-mode" : "strip-mode"}`}
            style={{
              backgroundColor: selectedFrame.bg,
              borderColor: selectedFrame.borderColor || "transparent"
            }}
          >
            {/* Header branding */}
            <div
              className="strip-brand-top"
              style={{ color: selectedFrame.textColor }}
            >
              <span>SNAP! STUDIO ✦</span>
            </div>

            {/* Photos Layout */}
            <div
              className={`strip-photos-layout ${isGrid ? "layout-grid" : "layout-col"}`}
            >
              {photos.map((src, idx) => (
                <div key={idx} className="editor-photo-frame">
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    style={{ filter: selectedFilter.css }}
                  />
                </div>
              ))}
            </div>

            {/* Interactive Sticker Overlay */}
            <StickerCanvas
              stickers={stickers}
              onUpdateSticker={updateSticker}
              onRemoveSticker={removeSticker}
              containerRef={stripContainerRef}
            />

            {/* Footer with caption & date */}
            <div
              className="strip-brand-bottom"
              style={{ color: selectedFrame.textColor }}
            >
              <p className="strip-custom-caption">{customText}</p>
              <span className="strip-custom-date">
                {dateFormatted} ✦ SNAP!
              </span>
            </div>
          </div>

          <div className="canvas-hint-banner">
            <Sparkles size={16} />
            <span>Click any sticker to select, drag to reposition, rotate, or resize!</span>
          </div>
        </section>

        {/* Customization Tool Panels */}
        <aside className="editor-tools-sidebar">
          <FilterBar
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />

          <FramePicker
            selectedFrame={selectedFrame}
            onSelectFrame={setSelectedFrame}
          />

          <TextCustomizer
            customText={customText}
            onChangeText={setCustomText}
          />

          <StickerTray onAddSticker={addSticker} />
        </aside>
      </main>

      {/* Download / Export Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        photos={photos}
        mode={mode}
        frame={selectedFrame}
        filter={selectedFilter}
        stickers={stickers}
        customText={customText}
      />
    </div>
  );
}
