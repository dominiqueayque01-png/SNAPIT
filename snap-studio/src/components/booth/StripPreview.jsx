import { SlidersHorizontal, Download, RotateCcw, Eye, Sparkles, Pencil } from "lucide-react";

export default function StripPreview({
  photos,
  mode,
  totalSlots = 4,
  selectedPreviewIndex,
  onSelectFrame,
  onOpenEditor,
  onEditSingle,
  onRetake,
  onDownloadSingle,
  onLoadSampleRoll
}) {
  const isComplete = photos.length >= totalSlots;
  const isGrid = mode === "grid-4";
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

  return (
    <div className="contact-strip-board">
      <div className="contact-sheet-header">
        <span>CONTACT STRIP PROOF</span>
        <span className="tabular">
          {String(photos.length).padStart(2, "0")}/{String(totalSlots).padStart(2, "0")} EXP
        </span>
      </div>

      <div className={`archival-photo-strip ${isGrid ? "mode-grid" : "mode-strip"}`}>
        <div className="strip-top-stamp">
          <span>SNAP! STUDIO</span>
          <span className="tabular">{dateStr}</span>
        </div>

        <div className={`strip-frames-grid ${isGrid ? "grid-2x2" : "col-vertical"}`}>
          {Array.from({ length: totalSlots }).map((_, index) => {
            const photo = photos[index];
            const frameCode = `${String(index + 1).padStart(2, "0")}A`;
            const isSelected = selectedPreviewIndex === index;

            return (
              <div
                key={index}
                className={`strip-frame-slot ${photo ? "filled" : "empty"} ${
                  isSelected ? "selected-preview" : ""
                }`}
                onClick={() => {
                  if (photo && onSelectFrame) {
                    onSelectFrame(index);
                  }
                }}
                title={photo ? `Click to inspect frame ${frameCode} on desk` : undefined}
                role={photo ? "button" : undefined}
                tabIndex={photo ? 0 : undefined}
                onKeyDown={(e) => {
                  if (photo && onSelectFrame && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelectFrame(index);
                  }
                }}
              >
                {photo ? (
                  <div className="strip-slot-photo">
                    <img
                      key={photo}
                      src={photo}
                      alt={`Exposure ${frameCode}`}
                      className="strip-slot-img print-develop-enter"
                    />
                    <span className="strip-frame-index tabular">{frameCode}</span>
                    {isSelected && (
                      <span className="strip-slot-badge" title="Active on instant print tray">
                        <Eye size={11} />
                      </span>
                    )}
                    {onEditSingle && (
                      <button
                        type="button"
                        className="btn-slot-edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSingle(index);
                        }}
                        title={`Edit frame ${frameCode} in Photo Editor`}
                        aria-label={`Edit frame ${frameCode}`}
                      >
                        <Pencil size={12} />
                      </button>
                    )}
                    {onDownloadSingle && (
                      <button
                        type="button"
                        className="btn-slot-download"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadSingle(photo, index);
                        }}
                        title={`Download frame ${frameCode}`}
                        aria-label={`Download frame ${frameCode}`}
                      >
                        <Download size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="strip-slot-empty">
                    <span className="slot-empty-index tabular">{frameCode}</span>
                    <span className="slot-empty-label">UNEXPOSED</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="strip-chin-footer">
          <p className="strip-chin-hand">sunday light, desk roll</p>
          <span className="strip-chin-code tabular">ISO 640 · LOCAL</span>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="strip-desk-actions">
          <button
            type="button"
            className={`btn-strip-primary ${isComplete ? "btn-pulse-ready" : ""}`}
            onClick={onOpenEditor}
          >
            <SlidersHorizontal size={15} />
            <span>{isComplete ? "Tone & Export Strip" : "Edit Partial Roll"}</span>
          </button>

          <button
            type="button"
            className="btn-strip-secondary"
            onClick={onRetake}
          >
            <RotateCcw size={14} />
            <span>Retake</span>
          </button>
        </div>
      ) : (
        onLoadSampleRoll && (
          <div className="strip-demo-helper">
            <button
              type="button"
              className="btn-strip-demo-hint"
              onClick={onLoadSampleRoll}
            >
              <Sparkles size={13} />
              <span>Load sample exposures to test</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}
