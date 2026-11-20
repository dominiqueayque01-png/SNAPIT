import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from "react-konva";
import { Hand, MousePointer2, Camera, Upload } from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { FILTERS } from "../../constants/filters";
import useKonvaImage from "../../hooks/useKonvaImage";
import CanvasObjectNode from "./CanvasObjectNode";
import CanvasFrameLayer from "./CanvasFrameLayer";
import CanvasStripSlotsLayer, {
  SingleSlotCanvasLayer
} from "./CanvasStripSlotsLayer";

/**
 * Produces an offscreen filtered canvas whenever a vintage film filter is active,
 * guaranteeing exact visual parity between live Konva preview and high-res export.
 */
function useFilteredPhoto(image, filterCss) {
  return useMemo(() => {
    if (!image) return null;
    if (!filterCss || filterCss === "none") return image;

    const w = image.naturalWidth || image.width;
    const h = image.naturalHeight || image.height;
    if (!w || !h) return image;

    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    ctx.filter = filterCss;
    ctx.drawImage(image, 0, 0, w, h);
    return c;
  }, [image, filterCss]);
}

export default function EditorCanvas({
  onRequestFitRef,
  onReturnToBooth,
  onQuickUploadPhoto
}) {
  const {
    present,
    selectedId,
    selectedObject,
    selectedSlotIndex,
    activeSlotTab,
    activeSlot,
    activeObjects,
    activeDocSize,
    zoom,
    pan,
    toolMode,
    stageRef,
    isExportingHidden,
    selectObject,
    selectSlot,
    setActiveSlotTab,
    setToolMode,
    setViewport,
    updateObject
  } = useEditor();

  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const panDragRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 820, height: 620 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [inlineEdit, setInlineEdit] = useState(null);

  const { image: bgImage, status: bgStatus } = useKonvaImage(present.backgroundSrc);
  const activeFilter = useMemo(
    () => FILTERS.find((f) => f.id === present.photoFilterId) || FILTERS[0],
    [present.photoFilterId]
  );
  const renderedBgImage = useFilteredPhoto(bgImage, activeFilter.canvasFilter);

  // Measure responsive stage container cleanly
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute centered fit-to-screen zoom & pan
  const fitToScreen = useCallback(() => {
    const pad = 56;
    const availW = Math.max(120, containerSize.width - pad * 2);
    const availH = Math.max(120, containerSize.height - pad * 2);
    const maxScale = activeSlot ? 1.85 : 1.4;
    const scale = Math.min(
      availW / activeDocSize.width,
      availH / activeDocSize.height,
      maxScale
    );
    const clampedZoom = Math.max(0.15, Math.min(3, +scale.toFixed(3)));
    const panX = Math.round((containerSize.width - activeDocSize.width * clampedZoom) / 2);
    const panY = Math.round((containerSize.height - activeDocSize.height * clampedZoom) / 2);
    setViewport(clampedZoom, { x: panX, y: panY });
  }, [
    containerSize.width,
    containerSize.height,
    activeDocSize.width,
    activeDocSize.height,
    activeSlot,
    setViewport
  ]);

  // Expose fitToScreen to parent toolbar & auto-fit whenever document size or active tab changes
  useEffect(() => {
    if (onRequestFitRef) {
      onRequestFitRef.current = fitToScreen;
    }
  }, [fitToScreen, onRequestFitRef]);

  useEffect(() => {
    fitToScreen();
  }, [
    activeDocSize.width,
    activeDocSize.height,
    activeSlotTab,
    containerSize.width,
    containerSize.height,
    fitToScreen
  ]);

  // Spacebar temporary pan mode
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setSpacePressed(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") setSpacePressed(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const effectiveToolMode = spacePressed ? "pan" : toolMode;

  // Register Konva node refs for Transformer attachment
  const handleRegisterNode = useCallback((id, node) => {
    if (node) {
      nodeRefs.current.set(id, node);
    } else {
      nodeRefs.current.delete(id);
    }
  }, []);

  // Sync Konva Transformer with currently selected unlocked & visible object
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;

    if (
      isExportingHidden ||
      !selectedId ||
      !selectedObject ||
      selectedObject.locked ||
      !selectedObject.visible
    ) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const node = nodeRefs.current.get(selectedId);
    if (node) {
      tr.nodes([node]);
      tr.getLayer()?.batchDraw();
    } else {
      tr.nodes([]);
    }
  }, [selectedId, selectedObject, activeObjects, activeSlotTab, isExportingHidden]);

  const handleStageMouseDown = (e) => {
    if (inlineEdit) {
      setInlineEdit(null);
    }

    if (effectiveToolMode === "pan") {
      panDragRef.current = {
        startX: e.evt.clientX,
        startY: e.evt.clientY,
        initPanX: pan.x,
        initPanY: pan.y
      };
      return;
    }

    // Deselect when clicking mat or locked background rect/photo
    const clickedName = e.target.name?.();
    if (e.target === e.target.getStage() || clickedName === "locked-bg") {
      selectObject(null);
    }
  };

  const handleStageMouseMove = (e) => {
    if (!panDragRef.current) return;
    const dx = e.evt.clientX - panDragRef.current.startX;
    const dy = e.evt.clientY - panDragRef.current.startY;
    setViewport(zoom, {
      x: Math.round(panDragRef.current.initPanX + dx),
      y: Math.round(panDragRef.current.initPanY + dy)
    });
  };

  const handleStageMouseUp = () => {
    panDragRef.current = null;
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.08;
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const nextZoom = Math.max(
      0.15,
      Math.min(4, +(direction > 0 ? zoom * scaleBy : zoom / scaleBy).toFixed(3))
    );

    const mousePointTo = {
      x: (pointer.x - pan.x) / zoom,
      y: (pointer.y - pan.y) / zoom
    };

    setViewport(nextZoom, {
      x: Math.round(pointer.x - mousePointTo.x * nextZoom),
      y: Math.round(pointer.y - mousePointTo.y * nextZoom)
    });
  };

  const handleRequestInlineEdit = useCallback(
    (obj) => {
      setInlineEdit({
        id: obj.id,
        value: obj.text || "",
        left: pan.x + obj.x * zoom,
        top: pan.y + obj.y * zoom,
        width: Math.max(120, (obj.width || 240) * zoom),
        fontSize: Math.max(14, (obj.fontSize || 42) * zoom),
        fontFamily: obj.fontFamily || "Reenie Beanie",
        color: obj.fill || "#2a211f",
        align: obj.align || "center"
      });
    },
    [pan.x, pan.y, zoom]
  );

  const commitInlineEdit = () => {
    if (!inlineEdit) return;
    updateObject(inlineEdit.id, { text: inlineEdit.value }, true);
    setInlineEdit(null);
  };

  const handleCommitChange = useCallback(
    (id, patch) => {
      updateObject(id, patch, true);
    },
    [updateObject]
  );

  return (
    <div
      ref={containerRef}
      className={`konva-canvas-stage-area ${effectiveToolMode === "pan" ? "is-panning" : ""}`}
    >
      {!present.backgroundSrc &&
        present.stripSlots.length === 0 &&
        present.objects.length === 0 && (
        <div className="canvas-empty-overlay">
          <div className="canvas-empty-card">
            <h3>No photograph loaded</h3>
            <p>
              Snap a roll in the Camera Booth or import a photo from your device
              to begin editing at full resolution.
            </p>
            <div className="canvas-empty-actions">
              <button
                type="button"
                className="btn-editor-primary"
                onClick={onReturnToBooth}
              >
                <Camera size={15} />
                <span>Open Camera Booth</span>
              </button>
              <button
                type="button"
                className="btn-editor-secondary"
                onClick={onQuickUploadPhoto}
              >
                <Upload size={15} />
                <span>Import Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {bgStatus === "loading" && (
        <div className="canvas-loading-pill">
          <span className="loading-spinner" />
          <span>Developing high-res canvas...</span>
        </div>
      )}

      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={zoom}
        scaleY={zoom}
        x={pan.x}
        y={pan.y}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}
        onTouchStart={handleStageMouseDown}
        onWheel={handleWheel}
      >
        {/* Base Layer: Dedicated Single Shot Tab OR Combined Polaroid Strip OR Standalone Photo */}
        <Layer>
          {activeSlot ? (
            <SingleSlotCanvasLayer
              slot={activeSlot}
              onClickBg={() => selectObject(null)}
            />
          ) : present.stripLayout && present.stripSlots.length > 0 ? (
            <CanvasStripSlotsLayer
              stripLayout={present.stripLayout}
              stripSlots={present.stripSlots}
              docWidth={present.docWidth}
              docHeight={present.docHeight}
              selectedSlotIndex={selectedSlotIndex}
              isExportingHidden={isExportingHidden}
              interactive={effectiveToolMode === "select"}
              onSelectSlot={selectSlot}
              onDoubleClickSlot={setActiveSlotTab}
              onClickPaper={() => selectObject(null)}
            />
          ) : (
            <>
              {!present.transparentBg && (
                <Rect
                  name="locked-bg"
                  x={0}
                  y={0}
                  width={present.docWidth}
                  height={present.docHeight}
                  fill={present.backgroundColor || "#fdfbf7"}
                  shadowColor="rgba(12, 8, 7, 0.52)"
                  shadowBlur={36}
                  shadowOffsetY={14}
                />
              )}

              {present.transparentBg && !isExportingHidden && (
                <Rect
                  name="locked-bg"
                  x={0}
                  y={0}
                  width={present.docWidth}
                  height={present.docHeight}
                  fill="rgba(253, 251, 247, 0.08)"
                  stroke="rgba(253, 251, 247, 0.35)"
                  strokeWidth={2}
                  dash={[10, 6]}
                />
              )}

              {renderedBgImage && present.backgroundVisible && (
                <KonvaImage
                  name="locked-bg"
                  image={renderedBgImage}
                  x={0}
                  y={0}
                  width={present.docWidth}
                  height={present.docHeight}
                  draggable={false}
                />
              )}
            </>
          )}
        </Layer>

        {/* Decorative Frame & Film Overlays Layer (Applies to Final Strip or Standalone Photo) */}
        {!activeSlot && (
          <Layer listening={false}>
            <CanvasFrameLayer
              frameId={present.frameId}
              frameColor={present.frameColor}
              frameTextColor={present.frameTextColor}
              frameCaption={present.frameCaption}
              overlayIds={present.overlayIds}
              overlayOpacity={present.overlayOpacity}
              docWidth={present.docWidth}
              docHeight={present.docHeight}
            />
          </Layer>
        )}

        {/* Interactive Editable Objects Layer (Stickers, PNGs, SVGs, Text for Active Tab) */}
        <Layer>
          {activeObjects.map((obj) => (
            <CanvasObjectNode
              key={obj.id}
              obj={obj}
              isSelected={obj.id === selectedId}
              toolMode={effectiveToolMode}
              onSelect={selectObject}
              onCommitChange={handleCommitChange}
              onRegisterNode={handleRegisterNode}
              onRequestInlineEdit={handleRequestInlineEdit}
            />
          ))}

          <Transformer
            ref={transformerRef}
            rotateEnabled={true}
            keepRatio={selectedObject?.type === "image"}
            borderStroke="#d4556b"
            borderStrokeWidth={2}
            anchorFill="#fdfbf7"
            anchorStroke="#d4556b"
            anchorStrokeWidth={2}
            anchorSize={10}
            anchorCornerRadius={2}
            rotateAnchorOffset={28}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 20 || newBox.height < 20) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>

      {/* Inline Text Editing Overlay (Double-Click on any Text Layer) */}
      {inlineEdit && (
        <textarea
          autoFocus
          className="canvas-inline-text-editor"
          style={{
            left: `${inlineEdit.left}px`,
            top: `${inlineEdit.top}px`,
            width: `${inlineEdit.width}px`,
            fontSize: `${inlineEdit.fontSize}px`,
            fontFamily: inlineEdit.fontFamily,
            color: inlineEdit.color,
            textAlign: inlineEdit.align
          }}
          value={inlineEdit.value}
          onChange={(e) =>
            setInlineEdit((prev) => ({ ...prev, value: e.target.value }))
          }
          onBlur={commitInlineEdit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setInlineEdit(null);
            } else if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitInlineEdit();
            }
          }}
        />
      )}

      {/* Bottom Floating Canvas HUD (Select/Pan Mode + Dimensions) */}
      <div className="canvas-bottom-hud">
        <div className="hud-mode-switch" role="group" aria-label="Canvas pointer mode">
          <button
            type="button"
            className={`hud-mode-btn ${effectiveToolMode === "select" ? "active" : ""}`}
            onClick={() => setToolMode("select")}
            title="Select & Transform tool"
          >
            <MousePointer2 size={14} />
            <span>Select</span>
          </button>
          <button
            type="button"
            className={`hud-mode-btn ${effectiveToolMode === "pan" ? "active" : ""}`}
            onClick={() => setToolMode("pan")}
            title="Pan canvas (or hold Space)"
          >
            <Hand size={14} />
            <span>Pan</span>
          </button>
        </div>

        <span className="hud-doc-spec tabular">
          {activeSlot
            ? `SHOT ${activeSlot.label} · `
            : present.stripLayout
            ? "FINAL STRIP · "
            : ""}
          {activeDocSize.width} × {activeDocSize.height} PX · {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
