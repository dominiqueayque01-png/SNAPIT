import {
  ArrowLeft,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Trash2,
  Copy,
  Save,
  FolderOpen,
  Download
} from "lucide-react";
import { useEditor } from "../../context/EditorContext";

export default function EditorToolbar({
  onBackToBooth,
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onResetView,
  onOpenExport
}) {
  const {
    present,
    selectedObject,
    zoom,
    canUndo,
    canRedo,
    savedProjectAvailable,
    undo,
    redo,
    deleteObject,
    duplicateObject,
    saveProject,
    restoreProject
  } = useEditor();

  return (
    <header className="studio-toolbar" role="toolbar" aria-label="Photo editor toolbar">
      <div className="toolbar-group toolbar-left">
        <button
          type="button"
          className="tb-btn tb-back"
          onClick={onBackToBooth}
          title="Return to Camera Booth"
        >
          <ArrowLeft size={15} />
          <span>Booth</span>
        </button>
        <div className="toolbar-title-wrap">
          <span className="toolbar-brand">SNAP! DARKROOM</span>
        </div>
      </div>

      <div className="toolbar-group toolbar-center">
        {/* Undo / Redo */}
        <div className="tb-cluster">
          <button
            type="button"
            className="tb-icon-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            type="button"
            className="tb-icon-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 size={15} />
          </button>
        </div>

        {/* Zoom & Viewport */}
        <div className="tb-cluster">
          <button
            type="button"
            className="tb-icon-btn"
            onClick={onZoomOut}
            title="Zoom Out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <span className="tb-zoom-readout tabular">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="tb-icon-btn"
            onClick={onZoomIn}
            title="Zoom In (+)"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="tb-icon-btn"
            onClick={onFitScreen}
            title="Fit to Screen (Ctrl+0)"
            aria-label="Fit to screen"
          >
            <Maximize2 size={14} />
          </button>
          <button
            type="button"
            className="tb-icon-btn"
            onClick={onResetView}
            title="Reset View (100%)"
            aria-label="Reset view"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Selected Object Quick Actions */}
        <div className="tb-cluster">
          <button
            type="button"
            className="tb-icon-btn"
            onClick={() => selectedObject && duplicateObject(selectedObject.id)}
            disabled={!selectedObject}
            title="Duplicate Selected (Ctrl+D)"
            aria-label="Duplicate selected object"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            className="tb-icon-btn tb-danger"
            onClick={() => selectedObject && deleteObject(selectedObject.id)}
            disabled={!selectedObject || selectedObject.locked}
            title="Delete Selected (Del)"
            aria-label="Delete selected object"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="toolbar-group toolbar-right">
        {savedProjectAvailable && (
          <button
            type="button"
            className="tb-btn"
            onClick={restoreProject}
            title="Restore last saved local project"
          >
            <FolderOpen size={14} />
            <span className="tb-label-hide-sm">Restore</span>
          </button>
        )}

        <button
          type="button"
          className="tb-btn"
          onClick={saveProject}
          title="Save project locally in browser"
        >
          <Save size={14} />
          <span className="tb-label-hide-sm">Save</span>
        </button>

        <button
          type="button"
          className="tb-btn tb-primary"
          onClick={onOpenExport}
          title={
            present.stripLayout
              ? "Export combined final Polaroid strip"
              : "Export high-resolution PNG or JPEG"
          }
        >
          <Download size={14} />
          <span>{present.stripLayout ? "Export Strip" : "Export"}</span>
        </button>
      </div>
    </header>
  );
}
