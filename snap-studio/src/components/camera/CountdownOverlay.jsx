export default function CountdownOverlay({ countdown }) {
  if (countdown === null) return null;

  return (
    <div className="countdown-overlay">
      <div
        key={String(countdown)}
        className={`countdown-bubble ${typeof countdown === "string" ? "smile" : ""}`}
      >
        {countdown}
      </div>
    </div>
  );
}
