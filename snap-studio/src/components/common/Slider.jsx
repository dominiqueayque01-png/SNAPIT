export default function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange
}) {
  return (
    <div className="snap-slider-field">
      {label && (
        <div className="slider-label-row">
          <span>{label}</span>
          <span>{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="snap-range-input"
      />
    </div>
  );
}
