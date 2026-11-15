import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="download-dialog-box" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="dialog-header">
            <h3>{title}</h3>
            <button className="btn-close-dialog" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        )}
        <div className="modal-content-body">{children}</div>
      </div>
    </div>
  );
}
