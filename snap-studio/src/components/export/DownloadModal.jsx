import { useState, useEffect } from "react";
import { Download, Share2, X, Check, BookmarkPlus, Film, Printer, ArrowRight } from "lucide-react";
import { renderPhotoStrip } from "../../services/canvasCompositor";
import { downloadImage, shareImage } from "../../services/imageExporter";
import { saveStripToGallery } from "../../services/storage";
import { useBooth } from "../../context/BoothContext";
import useAudio from "../../hooks/useAudio";

export default function DownloadModal({
  isOpen,
  onClose,
  photos,
  mode,
  frame,
  filter,
  stickers,
  customText
}) {
  const { setCurrentView } = useBooth();
  const { playButtonClick } = useAudio();
  const [renderedImageUrl, setRenderedImageUrl] = useState(null);
  const [rendering, setRendering] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const [savedToAlbum, setSavedToAlbum] = useState(false);

  useEffect(() => {
    if (!isOpen || !photos.length) return;

    let isMounted = true;
    setRendering(true);
    setDownloaded(false);
    setSavedToAlbum(false);

    renderPhotoStrip({
      photos,
      mode,
      frame,
      filter,
      stickers,
      customText
    })
      .then((url) => {
        if (isMounted) {
          setRenderedImageUrl(url);
          setRendering(false);
        }
      })
      .catch((err) => {
        console.error("Rendering failed", err);
        if (isMounted) setRendering(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, photos, mode, frame, filter, stickers, customText]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!renderedImageUrl) return;
    playButtonClick();
    downloadImage(renderedImageUrl, `snap-studio-${Date.now()}.png`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleSaveAlbum = () => {
    if (!renderedImageUrl || savedToAlbum) return;
    playButtonClick();
    saveStripToGallery({
      imageUrl: renderedImageUrl,
      mode,
      caption: customText,
      filter: filter?.name || "Natural 400"
    });
    setSavedToAlbum(true);
  };

  const handleShare = () => {
    if (!renderedImageUrl) return;
    playButtonClick();
    shareImage(renderedImageUrl, `snap-studio-${Date.now()}.png`);
  };

  const handlePrint = () => {
    if (!renderedImageUrl) return;
    playButtonClick();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print SNAP! STUDIO Keepsake</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
            img { max-height: 96vh; max-width: 96vw; object-fit: contain; }
            @media print { body { margin: 0; padding: 0; } img { width: 100%; max-width: 500px; } }
          </style>
        </head>
        <body>
          <img src="${renderedImageUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleGoToAlbum = () => {
    playButtonClick();
    onClose();
    setCurrentView("gallery");
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="download-dialog-box"
        role="dialog"
        aria-modal="true"
        aria-label="Export developed print"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <div className="dialog-title-group">
            <Film size={18} />
            <h3>DEVELOPED PRINT READY</h3>
          </div>
          <button
            type="button"
            className="btn-close-dialog"
            onClick={onClose}
            aria-label="Close export dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dialog-body-preview">
          {rendering ? (
            <div className="rendering-spinner-box">
              <div className="loading-spinner" />
              <p>Developing high-resolution archival print...</p>
            </div>
          ) : (
            <div className="rendered-strip-wrapper">
              <img
                src={renderedImageUrl}
                alt="Developed Polaroid strip"
                className="final-rendered-strip-img print-develop-enter"
              />
            </div>
          )}
        </div>

        <div className="dialog-footer-actions">
          <button
            type="button"
            className="btn-download-primary"
            onClick={handleDownload}
            disabled={rendering}
          >
            {downloaded ? (
              <>
                <Check size={16} />
                <span>Downloaded PNG</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download PNG</span>
              </>
            )}
          </button>

          <button
            type="button"
            className={`btn-share-secondary ${savedToAlbum ? "saved-active" : ""}`}
            onClick={savedToAlbum ? handleGoToAlbum : handleSaveAlbum}
            disabled={rendering}
            title={savedToAlbum ? "View in local album" : "Save to private browser archive"}
          >
            {savedToAlbum ? (
              <>
                <Check size={16} />
                <span>In Album · View</span>
                <ArrowRight size={13} />
              </>
            ) : (
              <>
                <BookmarkPlus size={16} />
                <span>Save to Album</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-share-secondary"
            onClick={handlePrint}
            disabled={rendering}
            title="Send print to printer"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>

          <button
            type="button"
            className="btn-share-secondary"
            onClick={handleShare}
            disabled={rendering}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
