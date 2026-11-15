export default function DeviceSelector({ devices = [], activeDeviceId, onSelectDevice }) {
  if (devices.length <= 1) return null;

  return (
    <div className="device-selector-wrapper">
      <select
        value={activeDeviceId}
        onChange={e => onSelectDevice(e.target.value)}
        className="device-select-dropdown"
      >
        {devices.map(d => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
          </option>
        ))}
      </select>
    </div>
  );
}
