import { FILTERS } from "../../constants/filters";

export default function FilterBar({ selectedFilter, onSelectFilter }) {
  return (
    <div className="filter-bar-component">
      <div className="editor-subheading">
        <span>FILTERS ✦</span>
      </div>

      <div className="filter-scroll-row">
        {FILTERS.map(f => {
          const isSelected = selectedFilter.id === f.id;
          return (
            <button
              key={f.id}
              className={`filter-chip ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectFilter(f)}
            >
              <div
                className="filter-sample-swatch"
                style={{ filter: f.css }}
              >
                <span>✿</span>
              </div>
              <span className="filter-name">{f.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
