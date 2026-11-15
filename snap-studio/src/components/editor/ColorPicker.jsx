export default function ColorPicker({ label, color, onChange, presets = [] }) {
  return (
    <div className="color-picker-component">
      {label && <label className="color-picker-label">{label}</label>}
      <div className="color-picker-controls">
        <input
          type="color"
          value={color}
          onChange={e => onChange(e.target.value)}
          className="color-input-native"
        />
        {presets.map(c => (
          <button
            key={c}
            type="button"
            className="preset-color-dot"
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
}
