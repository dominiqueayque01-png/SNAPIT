import { RotateCcw } from "lucide-react";

export default function RetakeControls({ onRetake, disabled }) {
  return (
    <button
      className="btn-control-secondary"
      onClick={onRetake}
      disabled={disabled}
      title="Clear photos and restart session"
    >
      <RotateCcw size={16} />
      <span>Retake Session</span>
    </button>
  );
}
