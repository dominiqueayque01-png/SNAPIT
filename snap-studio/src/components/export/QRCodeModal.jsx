import { QrCode, X } from "lucide-react";

export default function QRCodeModal({ isOpen, onClose, shareUrl }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="download-dialog-box" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-title-group">
            <QrCode size={20} className="sparkle-gold" />
            <h3>Scan on Mobile</h3>
          </div>
          <button className="btn-close-dialog" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="dialog-body-preview" style={{ textAlign: "center", padding: "30px 20px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "16px" }}>
            Scan with your phone's camera to save your photo strip!
          </p>
          <div style={{ display: "inline-block", background: "#fff", padding: "16px", borderRadius: "12px", border: "1px solid #eee" }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl || window.location.href)}`}
              alt="QR Code"
              width={180}
              height={180}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
