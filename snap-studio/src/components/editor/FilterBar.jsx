import { FILTERS } from "../../constants/filters";

export default function FilterBar({ selectedFilter, onSelectFilter }) {
  return (
    <div className="editor-panel-block">
      <div className="editor-subheading">
        <span>FILM STOCKS</span>
        <span className="subheading-meta tabular">{FILTERS.length} TINTS</span>
      </div>

      <div className="filter-grid">
        {FILTERS.map((f) => {
          const isSelected = selectedFilter.id === f.id;
          return (
            <button
              key={f.id}
              type="button"
              className={`filter-chip ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectFilter(f)}
            >
              <span
                className="filter-sample-swatch"
                style={{ filter: f.css }}
                aria-hidden="true"
              />
              <span className="filter-name">{f.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
