export default function Tabs({ items = [], activeId, onChange }) {
  return (
    <div className="mode-selector-tabs">
      {items.map(item => (
        <button
          key={item.id}
          className={`mode-tab-pill ${activeId === item.id ? "active" : ""}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
