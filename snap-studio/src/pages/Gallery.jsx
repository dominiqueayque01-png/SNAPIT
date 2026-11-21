import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Trash2,
  Download,
  Camera,
  FolderOpen,
  Printer,
  X,
  Eye,
  Sparkles,
  Pencil,
  QrCode,
  Cloud
} from "lucide-react";
import { useBooth } from "../context/BoothContext";
import useAudio from "../hooks/useAudio";
import { getSavedStrips, deleteSavedStrip } from "../services/storage";
import { fetchServerStrips, deleteServerStrip } from "../services/api";
import { downloadImage } from "../services/imageExporter";
import QRCodeModal from "../components/export/QRCodeModal";

export default function Gallery() {
  const { setCurrentView, loadSampleRoll, mode, openInEditor } = useBooth();
  const { playButtonClick } = useAudio();
  const [gallery, setGallery] = useState(() => getSavedStrips());
  const [cloudOnline, setCloudOnline] = useState(false);
  const [lightboxItem, setLightboxItem] = useState(null);
  const [qrItem, setQrItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    let active = true;
    const loadCloud = async () => {
      try {
        const res = await fetchServerStrips({ limit: 40 });
        if (!active) return;
        setCloudOnline(true);
        const localItems = getSavedStrips().map((item) => ({
          ...item,
          source: "local"
        }));
        const merged = [...res.items, ...localItems];
        setGallery(merged);
      } catch {
        if (!active) return;
        setCloudOnline(false);
      }
    };
    loadCloud();
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (item) => {
    playButtonClick();
    if (item.source === "cloud") {
      try {
        await deleteServerStrip(item.id);
      } catch {
        // ignore network error on delete
      }
      setGallery((prev) => prev.filter((s) => s.id !== item.id));
    } else {
      deleteSavedStrip(item.id);
      setGallery((prev) => prev.filter((s) => s.id !== item.id));
    }
    setDeleteConfirmId(null);
    if (lightboxItem?.id === item.id) {
      setLightboxItem(null);
    }
  };

  const handlePrint = (imageUrl) => {
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
          <img src="${imageUrl}" onload="window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="editor-page-container">
      <header className="editor-nav-header">
        <div className="gallery-nav-group">
          <button
            type="button"
            className="btn-nav-back"
            onClick={() => {
              playButtonClick();
              setCurrentView("landing");
            }}
          >
            <ArrowLeft size={16} />
            <span>Folio</span>
          </button>
          <button
            type="button"
            className="btn-nav-back"
            onClick={() => {
              playButtonClick();
              setCurrentView("booth");
            }}
          >
            <Camera size={16} />
            <span>Booth Desk</span>
          </button>
        </div>

        <div className="editor-header-title">
          <h1>{cloudOnline ? "STUDIO ARCHIVE" : "LOCAL ARCHIVE"}</h1>
        </div>

        <div className="gallery-count-badge tabular" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {cloudOnline && <Cloud size={13} />}
          <span>{String(gallery.length).padStart(2, "0")} PRINTS</span>
        </div>
      </header>

      <main className="gallery-archive-main">
        {gallery.length === 0 ? (
          <div className="gallery-empty-archive">
            <FolderOpen size={36} strokeWidth={1.5} />
            <h2>Your archival sleeve is empty</h2>
            <p>
              Prints you save from the Darkroom stay privately in this browser&apos;s
              local storage—zero cloud accounts, zero uploads.
            </p>
            <div className="gallery-empty-actions">
              <button
                type="button"
                className="btn-save-strip"
                onClick={() => {
                  playButtonClick();
                  setCurrentView("booth");
                }}
              >
                <Camera size={16} />
                <span>Open Camera Booth</span>
              </button>
              <button
                type="button"
                className="btn-empty-demo"
                onClick={() => {
                  playButtonClick();
                  loadSampleRoll(mode);
                  setCurrentView("editor");
                }}
              >
                <Sparkles size={16} />
                <span>Try Sample Roll in Darkroom</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="gallery-archive-grid">
            {gallery.map((item, idx) => {
              const isConfirming = deleteConfirmId === item.id;
              const dateStr = item.date
                ? new Date(item.date).toISOString().slice(0, 10).replace(/-/g, ".")
                : "LOCAL";

              return (
                <article key={item.id} className="archive-print-card">
                  <div className="archive-print-meta tabular">
                    <span>PRINT {String(gallery.length - idx).padStart(2, "0")}</span>
                    <span>{dateStr}</span>
                  </div>

                  <div
                    className="archive-print-mat"
                    onClick={() => {
                      playButtonClick();
                      setLightboxItem(item);
                    }}
                    title="Click to view full-size print"
                  >
                    <img
                      src={item.thumbUrl || item.imageUrl}
                      alt={item.caption || "Saved Polaroid strip"}
                      className="archive-card-thumb"
                    />
                    <span className="archive-inspect-overlay">
                      <Eye size={16} />
                      <span>Inspect</span>
                    </span>
                  </div>

                  {isConfirming ? (
                    <div className="archive-confirm-delete-row">
                      <span>Remove?</span>
                      <button
                        type="button"
                        className="btn-confirm-del-yes"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        className="btn-confirm-del-no"
                        onClick={() => setDeleteConfirmId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="archive-print-actions">
                      <button
                        type="button"
                        className="btn-archive-action"
                        onClick={() => {
                          playButtonClick();
                          openInEditor({ type: "gallery", imageUrl: item.imageUrl });
                        }}
                        title="Open in Interactive Photo Editor"
                      >
                        <Pencil size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-archive-action"
                        onClick={() => {
                          playButtonClick();
                          downloadImage(item.imageUrl, `snap-studio-${item.id}.png`);
                        }}
                      >
                        <Download size={14} />
                        <span>PNG</span>
                      </button>
                      {item.shareUrl && (
                        <button
                          type="button"
                          className="btn-archive-action"
                          onClick={() => {
                            playButtonClick();
                            setQrItem(item);
                          }}
                          title="Mobile QR Download"
                          aria-label="Mobile QR Download"
                        >
                          <QrCode size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-archive-action print-btn"
                        onClick={() => handlePrint(item.imageUrl)}
                        title="Print this keepsake"
                        aria-label="Print keepsake"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-archive-delete"
                        onClick={() => setDeleteConfirmId(item.id)}
                        aria-label="Delete saved print"
                        title="Remove from local album"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Full-size Archival Lightbox Modal */}
      {lightboxItem && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="lightbox-dialog-box"
            role="dialog"
            aria-modal="true"
            aria-label="Inspect print keepsake"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox-header">
              <div className="lightbox-meta tabular">
                <span>LOCAL ARCHIVE</span>
                <span>
                  {lightboxItem.date
                    ? new Date(lightboxItem.date).toISOString().slice(0, 10).replace(/-/g, ".")
                    : "LOCAL"}
                </span>
                {lightboxItem.caption && <span>· &ldquo;{lightboxItem.caption}&rdquo;</span>}
              </div>
              <button
                type="button"
                className="btn-close-dialog"
                onClick={() => setLightboxItem(null)}
                aria-label="Close lightbox"
              >
                <X size={18} />
              </button>
            </div>

            <div className="lightbox-body">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.caption || "High-resolution archival print"}
                className="lightbox-full-img print-develop-enter"
              />
            </div>

            <div className="lightbox-footer">
              <button
                type="button"
                className="btn-download-primary"
                onClick={() => {
                  playButtonClick();
                  downloadImage(lightboxItem.imageUrl, `snap-studio-${lightboxItem.id}.png`);
                }}
              >
                <Download size={16} />
                <span>Download High-Res PNG</span>
              </button>
              <button
                type="button"
                className="btn-share-secondary"
                onClick={() => handlePrint(lightboxItem.imageUrl)}
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      )}
      <QRCodeModal
        isOpen={!!qrItem}
        onClose={() => setQrItem(null)}
        shareUrl={qrItem?.shareUrl}
        qrDataUrl={qrItem?.qrEndpoint}
        shortCode={qrItem?.shortCode}
      />
    </div>
  );
}
