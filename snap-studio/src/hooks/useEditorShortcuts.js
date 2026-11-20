import { useEffect } from "react";

/**
 * Keyboard shortcuts for the interactive Konva photo editor.
 * Ignores shortcuts when typing inside inputs, textareas, or contentEditable nodes.
 */
export default function useEditorShortcuts({
  selectedObject,
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onDeselect,
  onNudge,
  onZoomIn,
  onZoomOut,
  onFitView
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "z" && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      if ((mod && key === "z" && e.shiftKey) || (mod && key === "y")) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      if (mod && key === "d") {
        if (selectedObject) {
          e.preventDefault();
          onDuplicate?.(selectedObject.id);
        }
        return;
      }

      if (key === "delete" || key === "backspace") {
        if (selectedObject && !selectedObject.locked) {
          e.preventDefault();
          onDelete?.(selectedObject.id);
        }
        return;
      }

      if (key === "escape") {
        onDeselect?.();
        return;
      }

      if (key === "=" || key === "+") {
        e.preventDefault();
        onZoomIn?.();
        return;
      }

      if (key === "-") {
        e.preventDefault();
        onZoomOut?.();
        return;
      }

      if (key === "0" && mod) {
        e.preventDefault();
        onFitView?.();
        return;
      }

      // Keyboard nudging (WCAG 2.2 single-pointer/keyboard alternative to dragging)
      if (
        selectedObject &&
        !selectedObject.locked &&
        ["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)
      ) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 2;
        const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
        const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
        onNudge?.(selectedObject.id, dx, dy);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedObject,
    onUndo,
    onRedo,
    onDelete,
    onDuplicate,
    onDeselect,
    onNudge,
    onZoomIn,
    onZoomOut,
    onFitView
  ]);
}
