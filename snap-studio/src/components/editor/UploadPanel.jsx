import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Trash2, AlertCircle, ImagePlus } from "lucide-react";
import { validateAndProcessUpload } from "../../services/svgSanitizer";
import {
  saveAssetRecord,
  listUploadedAssets,
  deleteAssetRecord
} from "../../services/assetDb";
import { useEditor } from "../../context/EditorContext";

export default function UploadPanel() {
  const { addStickerOrImage, flashStatus } = useEditor();
  const fileInputRef = useRef(null);
  const urlMapRef = useRef(new Map());

  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const loadStoredUploads = useCallback(async () => {
    const records = await listUploadedAssets();
    const mapped = records.map((rec) => {
      let url = urlMapRef.current.get(rec.id);
      if (!url && rec.blob) {
        url = URL.createObjectURL(rec.blob);
        urlMapRef.current.set(rec.id, url);
      }
      return { ...rec, url };
    });
    setUploads(mapped);
  }, []);

  useEffect(() => {
    loadStoredUploads();
    const mapRef = urlMapRef;
    return () => {
      for (const u of mapRef.current.values()) {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      }
      mapRef.current.clear();
    };
  }, [loadStoredUploads]);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setErrorMsg("");
    setLoading(true);
    let addedCount = 0;

    for (const file of files) {
      try {
        const processed = await validateAndProcessUpload(file);
        const saved = await saveAssetRecord({
          kind: "upload",
          name: processed.name,
          mimeType: processed.mimeType,
          isSvg: processed.isSvg,
          width: processed.width,
          height: processed.height,
          blob: processed.blob
        });
        const url = URL.createObjectURL(processed.blob);
        urlMapRef.current.set(saved.id, url);
        addedCount += 1;
      } catch (err) {
        setErrorMsg(err.message || "Failed to process uploaded file.");
      }
    }

    await loadStoredUploads();
    setLoading(false);

    if (addedCount > 0) {
      flashStatus(
        addedCount === 1
          ? "Asset uploaded and sanitized. Click to place on canvas."
          : `${addedCount} assets uploaded safely.`,
        "success"
      );
    }
  };

  const handleDeleteUpload = async (e, rec) => {
    e.stopPropagation();
    await deleteAssetRecord(rec.id);
    const url = urlMapRef.current.get(rec.id);
    if (url) {
      URL.revokeObjectURL(url);
      urlMapRef.current.delete(rec.id);
    }
    setUploads((prev) => prev.filter((item) => item.id !== rec.id));
  };

  return (
    <div className="studio-panel-content">
      <div className="panel-section-head">
        <h2>Custom Uploads</h2>
        <span className="panel-meta">PNG · SVG · JPG · WEBP</span>
      </div>

      <div
        className={`upload-dropzone ${isDraggingOver ? "drag-over" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <Upload size={22} />
        <strong>{loading ? "Validating & sanitizing..." : "Drop or browse assets"}</strong>
        <small>Transparent PNG, safe SVG, JPEG, WebP · Max 15 MB</small>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.svg,.jpg,.jpeg,.webp,image/png,image/svg+xml,image/jpeg,image/webp"
          multiple
          hidden
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {errorMsg && (
        <div className="panel-error-box" role="alert">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {uploads.length === 0 ? (
        <div className="panel-empty-box">
          <ImagePlus size={20} />
          <p>
            Uploaded stickers, transparent PNGs, and sanitized SVGs stay locally
            in your browser&apos;s IndexedDB library.
          </p>
        </div>
      ) : (
        <div className="uploaded-assets-grid">
          {uploads.map((item) => (
            <div
              key={item.id}
              className="uploaded-asset-card"
              onClick={() =>
                addStickerOrImage({
                  src: item.url,
                  name: item.name,
                  width: item.width,
                  height: item.height,
                  assetId: item.id,
                  isSvg: item.isSvg
                })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addStickerOrImage({
                    src: item.url,
                    name: item.name,
                    width: item.width,
                    height: item.height,
                    assetId: item.id,
                    isSvg: item.isSvg
                  });
                }
              }}
              title={`Add "${item.name}" to canvas`}
            >
              <div className="uploaded-thumb-checker">
                <img src={item.url} alt={item.name} />
                {item.isSvg && <span className="asset-type-badge">SVG</span>}
              </div>
              <div className="uploaded-card-foot">
                <span className="uploaded-name">{item.name}</span>
                <button
                  type="button"
                  className="btn-delete-upload"
                  onClick={(e) => handleDeleteUpload(e, item)}
                  title="Remove uploaded asset"
                  aria-label={`Delete ${item.name}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
