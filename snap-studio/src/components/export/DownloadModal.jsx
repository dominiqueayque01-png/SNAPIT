import { useState, useEffect } from "react";
import { Download, Share2, X, Sparkles, Check } from "lucide-react";
import { renderPhotoStrip } from "../../services/canvasCompositor";
import { downloadImage, shareImage } from "../../services/imageExporter";

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
  const [renderedImageUrl, setRenderedImageUrl] = useState(null);
  const [rendering, setRendering] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen || !photos.length) return;

    let isMounted = true;
    setRendering(true);
    setDownloaded(false);

    renderPhotoStrip({
      photos,
      mode,
      frame,
      filter,
      stickers,
      customText
    })
      .then(url => {
        if (isMounted) {
          setRenderedImageUrl(url);
          setRendering(false);
        }
      })
      .catch(err => {
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
    downloadImage(renderedImageUrl, `snap-studio-${Date.now()}.png`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleShare = () => {
    if (!renderedImageUrl) return;
    shareImage(renderedImageUrl, `snap-studio-${Date.now()}.png`);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="download-dialog-box" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-title-group">
            <Sparkles size={20} className="sparkle-gold" />
            <h3>Your Photo Strip is Ready!</h3>
          </div>
          <button className="btn-close-dialog" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-body-preview">
          {rendering ? (
            <div className="rendering-spinner-box">
              <div className="loading-spinner" />
              <p>Developing your photo strip...</p>
            </div>
          ) : (
            <div className="rendered-strip-wrapper">
              <img
                src={renderedImageUrl}
                alt="Final Rendered Strip"
                className="final-rendered-strip-img"
              />
            </div>
          )}
        </div>

        <div className="dialog-footer-actions">
          <button
            className="btn-download-primary"
            onClick={handleDownload}
            disabled={rendering}
          >
            {downloaded ? (
              <>
                <Check size={18} />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download High-Res PNG</span>
              </>
            )}
          </button>

          <button
            className="btn-share-secondary"
            onClick={handleShare}
            disabled={rendering}
          >
            <Share2 size={18} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
