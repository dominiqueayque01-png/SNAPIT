import { Wand2, Download, RotateCcw } from "lucide-react";

export default function StripPreview({
  photos,
  mode,
  totalSlots = 4,
  onOpenEditor,
  onRetake,
  onDownloadSingle
}) {
  const isComplete = photos.length >= totalSlots;
  const isGrid = mode === "grid-4";
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  return (
    <div className="scrapbook-strip-board">
      {/* Vintage Handwritten Letter Paper Backdrop (matching design.png) */}
      <div className="vintage-letter-sheet">
        <div className="vintage-letter-content">
          <p className="cursive-line">i take this opportunity to thank</p>
          <p className="cursive-line">you a few lines to inquire after</p>
          <p className="cursive-line">health i hope you are in good</p>
          <p className="cursive-line">i miss you dearly and hope</p>
          <p className="cursive-line">we will be together again soon</p>
          <p className="cursive-line">a friend of ours came to visit</p>
          <p className="cursive-line">with love & memories forever</p>
          <p className="cursive-line">always in my heart ✿</p>
        </div>
      </div>

      {/* Tilted Photo Strip (as in design.png) */}
      <div className={`scrapbook-photo-strip ${isGrid ? "mode-grid" : "mode-strip"}`}>
        {/* Washi Tape Accent at Top */}
        <div className="washi-tape-strip" />

        {/* Strip Header Branding */}
        <div className="strip-header-brand-clean">
          <span>SNAP! STUDIO ✦</span>
        </div>

        {/* Photo Slots Container */}
        <div className={`strip-slots-grid ${isGrid ? "grid-2x2" : "col-vertical"}`}>
          {Array.from({ length: totalSlots }).map((_, index) => {
            const photo = photos[index];
            return (
              <div
                key={index}
                className={`scrapbook-slot-frame ${photo ? "filled" : "empty"}`}
              >
                {photo ? (
                  <div className="slot-photo-wrapper">
                    <img src={photo} alt={`Snap #${index + 1}`} />
                    {onDownloadSingle && (
                      <button
                        className="btn-quick-save"
                        onClick={() => onDownloadSingle(photo, index)}
                        title="Download this snap"
                      >
                        <Download size={13} />
                      </button>
                    )}
                  </div>
                ) : (
                  /* Cute Sky & Meadow Graphic Placeholder (matches design.png!) */
                  <div className="empty-landscape-placeholder">
                    <div className="placeholder-sky">
                      <div className="cloud-shape" />
                    </div>
                    <div className="placeholder-hill" />
                    <span className="slot-pose-number">#{index + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Strip Footer Branding */}
        <div className="strip-footer-clean">
          <p className="handwritten-caption">my little moment ✿</p>
          <span className="handwritten-date">{dateStr}</span>
        </div>
      </div>

      {/* Action Buttons Under the Strip */}
      {photos.length > 0 && (
        <div className="strip-scrapbook-actions">
          <button className="btn-washi-primary" onClick={onOpenEditor}>
            <Wand2 size={16} />
            <span>{isComplete ? "Decorate & Save ✦" : "Customize Strip"}</span>
          </button>

          <button className="btn-washi-secondary" onClick={onRetake}>
            <RotateCcw size={14} />
            <span>Retake</span>
          </button>
        </div>
      )}
    </div>
  );
}
