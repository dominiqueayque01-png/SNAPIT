import { Camera, Sparkles, Wand2, RotateCcw } from "lucide-react";

export default function CameraControls({
  capturing,
  hasPhotos,
  onCapture,
  onRetake,
  onOpenEditor,
  totalPhotos,
  currentCount
}) {
  return (
    <div className="camera-controls-bar">
      {hasPhotos && (
        <button
          className="btn-control-secondary"
          onClick={onRetake}
          disabled={capturing}
          title="Restart Session"
        >
          <RotateCcw size={18} />
          <span>Retake</span>
        </button>
      )}

      <button
        className={`btn-shutter-main ${capturing ? "capturing" : ""}`}
        onClick={onCapture}
        disabled={capturing}
      >
        <div className="shutter-inner-ring">
          <Camera size={26} className="shutter-icon" />
        </div>
        <span className="shutter-label">
          {capturing
            ? `CAPTURING ${currentCount}/${totalPhotos}...`
            : "TAKE PHOTOS"}
        </span>
      </button>

      {hasPhotos && (
        <button
          className="btn-control-primary"
          onClick={onOpenEditor}
          disabled={capturing}
        >
          <Wand2 size={18} />
          <span>Decorate ✦</span>
        </button>
      )}
    </div>
  );
}
