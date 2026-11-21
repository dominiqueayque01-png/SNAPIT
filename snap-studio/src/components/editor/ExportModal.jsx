import { useState, useEffect } from "react";
import { Download, Share2, X, Check, BookmarkPlus, Film, QrCode, Cloud } from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { exportKonvaComposition } from "../../services/konvaExporter";
import { downloadImage, shareImage } from "../../services/imageExporter";
import { saveStripToGallery } from "../../services/storage";
import { uploadStripToServer } from "../../services/api";
import QRCodeModal from "../export/QRCodeModal";

export default function ExportModal({ isOpen, onClose }) {
  const {
    present,
    stageRef,
    setIsExportingHidden,
    flashStatus
  } = useEditor();

  const [format, setFormat] = useState("image/png");
  const [jpegQuality, setJpegQuality] = useState(0.92);
  const [pixelRatio, setPixelRatio] = useState(1);
  const [exportState, setExportState] = useState({
    url: null,
    rendering: false,
    error: ""
  });
  const [downloaded, setDownloaded] = useState(false);
  const [savedToAlbum, setSavedToAlbum] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);
  const [cloudRecord, setCloudRecord] = useState(null);
  const [isQrOpen, setIsQrOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setSavedToAlbum(false);
      setDownloaded(false);
      setCloudRecord(null);
      setIsQrOpen(false);
      setExportState({ url: null, rendering: true, error: "" });

      try {
        const url = await exportKonvaComposition({
          stageRef,
          docWidth: present.docWidth,
          docHeight: present.docHeight,
          mimeType: format,
          quality: jpegQuality,
          pixelRatio,
          onBeforeExport: () => setIsExportingHidden(true),
          onAfterExport: () => setIsExportingHidden(false)
        });
        if (!cancelled) {
          setExportState({ url, rendering: false, error: "" });
        }
      } catch (err) {
        if (!cancelled) {
          setExportState({
            url: null,
            rendering: false,
            error: err.message || "Failed to generate export image."
          });
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    stageRef,
    present.docWidth,
    present.docHeight,
    format,
    jpegQuality,
    pixelRatio,
    setIsExportingHidden
  ]);

  const { url: previewUrl, rendering, error: errorMsg } = exportState;

  if (!isOpen) return null;

  const ext = format === "image/jpeg" ? "jpg" : "png";
  const outWidth = Math.round(present.docWidth * pixelRatio);
  const outHeight = Math.round(present.docHeight * pixelRatio);

  const handleDownload = () => {
    if (!previewUrl) return;
    downloadImage(previewUrl, `snap-studio-${Date.now()}.${ext}`);
    setDownloaded(true);
    flashStatus(`Downloaded ${ext.toUpperCase()} (${outWidth}×${outHeight}px).`, "success");
    setTimeout(() => setDownloaded(false), 2600);
  };

  const syncStripToBackend = async () => {
    if (cloudRecord) return cloudRecord;
    setSyncingCloud(true);
    try {
      const uploaded = await uploadStripToServer({
        dataUrl: previewUrl,
        mode: present.stripLayout?.mode || "custom-edit",
        title: present.title || "SNAP! Studio Print",
        caption: present.stripLayout?.caption || present.frameCaption || "",
        paperColor: present.stripLayout?.paperColor || present.frameColor || "#fdfbf7",
        textColor: present.stripLayout?.textColor || present.frameTextColor || "#2a211f",
        filterId: present.photoFilterId || "normal"
      });
      setCloudRecord(uploaded);
      return uploaded;
    } finally {
      setSyncingCloud(false);
    }
  };

  const handleSaveAlbum = async () => {
    if (!previewUrl || savedToAlbum || syncingCloud) return;
    try {
      await syncStripToBackend();
      setSavedToAlbum(true);
      flashStatus("Saved to Cloud Archive & ready for mobile QR!", "success");
    } catch {
      // Graceful offline fallback to browser localStorage
      saveStripToGallery({
        imageUrl: previewUrl,
        mode: present.stripLayout?.mode || "custom-edit",
        caption: present.stripLayout?.caption || present.frameCaption || present.title
      });
      setSavedToAlbum(true);
      flashStatus("Backend offline — saved locally to this browser.", "info");
    }
  };

  const handleOpenQr = async () => {
    if (!previewUrl || syncingCloud) return;
    try {
      await syncStripToBackend();
      setSavedToAlbum(true);
      setIsQrOpen(true);
    } catch (err) {
      flashStatus(
        err.message || "Start the backend server to generate mobile QR download links.",
        "error"
      );
    }
  };

  const handleShare = () => {
    if (!previewUrl) return;
    shareImage(previewUrl, `snap-studio-${Date.now()}.${ext}`);
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="download-dialog-box export-studio-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Export high-resolution composition"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <div className="dialog-title-group">
            <Film size={18} />
            <h3>EXPORT COMPOSITION</h3>
          </div>
          <button
            type="button"
            className="btn-close-dialog"
            onClick={onClose}
            aria-label="Close export modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dialog-body-preview">
          {rendering ? (
            <div className="rendering-spinner-box">
              <div className="loading-spinner" />
              <p>Rendering {outWidth} × {outHeight} px print...</p>
            </div>
          ) : errorMsg ? (
            <div className="panel-error-box">{errorMsg}</div>
          ) : (
            <div className="rendered-strip-wrapper">
              <img
                src={previewUrl}
                alt="Final high-resolution composition preview"
                className="final-rendered-strip-img print-develop-enter"
              />
            </div>
          )}
        </div>

        <div className="export-settings-bar">
          <div className="export-setting-item">
            <span>Format</span>
            <div className="export-pill-group">
              <button
                type="button"
                className={`export-pill ${format === "image/png" ? "active" : ""}`}
                onClick={() => setFormat("image/png")}
              >
                PNG {present.transparentBg ? "(Alpha)" : ""}
              </button>
              <button
                type="button"
                className={`export-pill ${format === "image/jpeg" ? "active" : ""}`}
                onClick={() => setFormat("image/jpeg")}
              >
                JPEG
              </button>
            </div>
          </div>

          <div className="export-setting-item">
            <span>Resolution</span>
            <div className="export-pill-group">
              <button
                type="button"
                className={`export-pill tabular ${pixelRatio === 1 ? "active" : ""}`}
                onClick={() => setPixelRatio(1)}
              >
                1× ({present.docWidth}×{present.docHeight})
              </button>
              <button
                type="button"
                className={`export-pill tabular ${pixelRatio === 2 ? "active" : ""}`}
                onClick={() => setPixelRatio(2)}
              >
                2× Print
              </button>
            </div>
          </div>

          {format === "image/jpeg" && (
            <div className="export-setting-item">
              <span>JPEG Quality ({Math.round(jpegQuality * 100)}%)</span>
              <input
                type="range"
                min={0.65}
                max={1}
                step={0.03}
                value={jpegQuality}
                onChange={(e) => setJpegQuality(parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className="dialog-footer-actions">
          <button
            type="button"
            className="btn-download-primary"
            onClick={handleDownload}
            disabled={rendering || !previewUrl}
          >
            {downloaded ? (
              <>
                <Check size={16} />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download {ext.toUpperCase()}</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-share-secondary"
            onClick={handleSaveAlbum}
            disabled={rendering || !previewUrl || savedToAlbum || syncingCloud}
          >
            {savedToAlbum ? (
              cloudRecord ? <Cloud size={16} /> : <Check size={16} />
            ) : (
              <BookmarkPlus size={16} />
            )}
            <span>
              {syncingCloud
                ? "Syncing..."
                : savedToAlbum
                ? cloudRecord
                  ? "Cloud Saved"
                  : "In Album"
                : "Save to Album"}
            </span>
          </button>

          <button
            type="button"
            className="btn-share-secondary"
            onClick={handleOpenQr}
            disabled={rendering || !previewUrl || syncingCloud}
            title="Generate scannable mobile download QR code"
          >
            <QrCode size={16} />
            <span>Mobile QR</span>
          </button>

          <button
            type="button"
            className="btn-share-secondary"
            onClick={handleShare}
            disabled={rendering || !previewUrl}
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>

      <QRCodeModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        shareUrl={cloudRecord?.shareUrl}
        qrDataUrl={cloudRecord?.qrDataUrl || cloudRecord?.qrEndpoint}
        shortCode={cloudRecord?.shortCode}
      />
    </div>
  );
}
