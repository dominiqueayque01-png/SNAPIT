import { useState } from "react";
import { QrCode, X, Copy, Check, ExternalLink } from "lucide-react";

export default function QRCodeModal({ isOpen, onClose, shareUrl, qrDataUrl, shortCode }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = shareUrl || window.location.href;
  const qrSrc =
    qrDataUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div
        className="download-dialog-box"
        role="dialog"
        aria-modal="true"
        aria-label="Scan QR code on mobile"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <div className="dialog-title-group">
            <QrCode size={18} />
            <h3>{shortCode ? `MOBILE PRINT · ${shortCode}` : "SCAN ON MOBILE"}</h3>
          </div>
          <button
            type="button"
            className="btn-close-dialog"
            onClick={onClose}
            aria-label="Close QR dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="dialog-body-preview"
          style={{ textAlign: "center", padding: "26px 22px", flexDirection: "column", gap: "14px" }}
        >
          <p style={{ fontSize: "13px", color: "var(--ink-secondary)", margin: 0, maxWidth: "320px" }}>
            Scan this QR code with your phone camera to view and download your high-resolution keepsake strip.
          </p>

          <div
            style={{
              display: "inline-block",
              background: "#fdfbf7",
              padding: "14px",
              borderRadius: "8px",
              border: "1.5px solid var(--ink-rule-strong)",
              boxShadow: "0 8px 20px rgba(42, 33, 31, 0.14)"
            }}
          >
            <img
              src={qrSrc}
              alt="Mobile Download QR Code"
              width={200}
              height={200}
              style={{ display: "block" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              flexWrap: "wrap"
            }}
          >
            <button
              type="button"
              className="btn-editor-secondary"
              onClick={handleCopy}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Link Copied" : "Copy Link"}</span>
            </button>
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-editor-secondary"
              style={{ textDecoration: "none" }}
            >
              <ExternalLink size={14} />
              <span>Open Page</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
