import { useState, useEffect, useRef, useCallback } from "react";
import { Layers, PanelLeft, SlidersHorizontal } from "lucide-react";
import { useBooth } from "../context/BoothContext";
import { EditorProvider, useEditor } from "../context/EditorContext";
import { buildStripLayoutGeometry } from "../constants/stripLayouts";
import { validateAndProcessUpload } from "../services/svgSanitizer";
import useEditorShortcuts from "../hooks/useEditorShortcuts";
import EditorToolbar from "../components/editor/EditorToolbar";
import AssetSidebar from "../components/editor/AssetSidebar";
import StripTabsBar from "../components/editor/StripTabsBar";
import EditorCanvas from "../components/editor/EditorCanvas";
import InspectorSidebar from "../components/editor/InspectorSidebar";
import ExportModal from "../components/editor/ExportModal";

function measureImageUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        width: img.naturalWidth || img.width || 1080,
        height: img.naturalHeight || img.height || 810
      });
    img.onerror = () => reject(new Error("Could not load photograph."));
    img.src = src;
  });
}

function InteractiveEditorWorkspace() {
  const {
    photos,
    mode,
    selectedFrame,
    selectedFilter,
    customText,
    editorTarget,
    setCurrentView
  } = useBooth();

  const {
    selectedObject,
    activeSlotTab,
    zoom,
    pan,
    statusMessage,
    loadDocument,
    swapBackground,
    selectObject,
    setActiveSlotTab,
    setViewport,
    updateObject,
    deleteObject,
    duplicateObject,
    undo,
    redo,
    flashStatus
  } = useEditor();

  const [leftTab, setLeftTab] = useState("stickers");
  const [rightTab, setRightTab] = useState("properties");
  const [mobileDrawer, setMobileDrawer] = useState("none"); // "none" | "assets" | "inspector"
  const [isExportOpen, setIsExportOpen] = useState(false);

  const fitFnRef = useRef(null);
  const quickImportRef = useRef(null);
  const initializedRef = useRef(false);

  const loadBoothStripIntoEditor = useCallback(async () => {
    if (!photos.length) return;

    // Single shot opens directly at native webcam resolution with Classic Polaroid frame
    if (mode === "single" || photos.length === 1) {
      const src = photos[0];
      const { width, height } = await measureImageUrl(src);
      loadDocument({
        title: "Single Polaroid Print",
        docWidth: width,
        docHeight: height,
        backgroundSrc: src,
        backgroundLabel: "Captured Photo 01A",
        photoFilterId: selectedFilter?.id || "normal",
        frameId: "classic-polaroid",
        frameColor: selectedFrame?.bg || "#fdfbf7",
        frameTextColor: selectedFrame?.textColor || "#2a211f",
        frameCaption: customText || "sweet sunday memories"
      });
      return;
    }

    // Multi-shot strip/grid: load as separated interactive per-shot slots on the Konva Polaroid strip!
    const layoutMode =
      mode === "strip-3" || mode === "grid-4" ? mode : "strip-4";
    const geo = buildStripLayoutGeometry(layoutMode, photos);
    const defaultFilterId = selectedFilter?.id || "normal";
    const dated = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

    loadDocument({
      title: `SNAP! ${layoutMode.toUpperCase()} Polaroid`,
      docWidth: geo.docWidth,
      docHeight: geo.docHeight,
      backgroundSrc: null,
      backgroundLabel: `${layoutMode.toUpperCase()} Strip (${photos.length} shots)`,
      photoFilterId: "normal",
      frameId: "none",
      frameColor: selectedFrame?.bg || "#fdfbf7",
      frameTextColor: selectedFrame?.textColor || "#2a211f",
      frameCaption: customText || "sweet sunday memories",
      stripLayout: {
        mode: layoutMode,
        paperColor: selectedFrame?.bg || "#fdfbf7",
        textColor: selectedFrame?.textColor || "#2a211f",
        borderColor: selectedFrame?.borderColor || "#d9cbbd",
        caption: customText || "sweet sunday memories",
        dateText: dated,
        topPad: geo.topPad,
        bottomChin: geo.bottomChin,
        padX: geo.padX
      },
      stripSlots: geo.slots.map((slot) => ({
        ...slot,
        filterId: defaultFilterId
      }))
    });
  }, [photos, mode, selectedFrame, selectedFilter, customText, loadDocument]);

  const loadSinglePhotoIntoEditor = useCallback(
    async (photoSrc, index = 0) => {
      if (!photoSrc) return;
      const { width, height } = await measureImageUrl(photoSrc);
      loadDocument({
        title: `Photo Frame 0${index + 1}A`,
        docWidth: width,
        docHeight: height,
        backgroundSrc: photoSrc,
        backgroundLabel: `Captured Photo 0${index + 1}A`,
        photoFilterId: selectedFilter?.id || "normal",
        frameId: "classic-polaroid",
        frameColor: selectedFrame?.bg || "#fdfbf7",
        frameTextColor: selectedFrame?.textColor || "#2a211f",
        frameCaption: customText || "sweet sunday memories"
      });
    },
    [selectedFilter, selectedFrame, customText, loadDocument]
  );

  // Hydrate initial document from Booth or Gallery target once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      try {
        if (editorTarget?.type === "gallery" && editorTarget.imageUrl) {
          const { width, height } = await measureImageUrl(editorTarget.imageUrl);
          loadDocument({
            title: "Archived Keepsake Edit",
            docWidth: width,
            docHeight: height,
            backgroundSrc: editorTarget.imageUrl,
            backgroundLabel: "Saved Keepsake",
            frameId: "none",
            photoFilterId: "normal"
          });
          return;
        }

        if (
          editorTarget?.type === "single" &&
          typeof editorTarget.photoIndex === "number" &&
          photos[editorTarget.photoIndex]
        ) {
          await loadSinglePhotoIntoEditor(
            photos[editorTarget.photoIndex],
            editorTarget.photoIndex
          );
          return;
        }

        if (photos.length > 0) {
          await loadBoothStripIntoEditor();
        }
      } catch (err) {
        console.error("Failed to initialize editor canvas:", err);
        flashStatus("Could not load captured photo into editor.", "error");
      }
    };

    init();
  }, [
    editorTarget,
    photos,
    loadDocument,
    loadBoothStripIntoEditor,
    loadSinglePhotoIntoEditor,
    flashStatus
  ]);

  const handleZoomIn = useCallback(() => {
    setViewport(Math.min(4, +(zoom * 1.15).toFixed(3)), pan);
  }, [zoom, pan, setViewport]);

  const handleZoomOut = useCallback(() => {
    setViewport(Math.max(0.15, +(zoom / 1.15).toFixed(3)), pan);
  }, [zoom, pan, setViewport]);

  const handleFitScreen = useCallback(() => {
    fitFnRef.current?.();
  }, []);

  const handleResetView = useCallback(() => {
    setViewport(1, { x: 40, y: 40 });
  }, [setViewport]);

  const handleNudge = useCallback(
    (id, dx, dy) => {
      if (!selectedObject || selectedObject.id !== id) return;
      updateObject(
        id,
        {
          x: Math.round((selectedObject.x || 0) + dx),
          y: Math.round((selectedObject.y || 0) + dy)
        },
        true
      );
    },
    [selectedObject, updateObject]
  );

  useEditorShortcuts({
    selectedObject,
    onUndo: undo,
    onRedo: redo,
    onDelete: deleteObject,
    onDuplicate: duplicateObject,
    onDeselect: () => selectObject(null),
    onNudge: handleNudge,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    onFitView: handleFitScreen
  });

  const handleQuickImportPhoto = async (file) => {
    if (!file) return;
    try {
      const processed = await validateAndProcessUpload(file);
      const url = URL.createObjectURL(processed.blob);
      swapBackground({
        backgroundSrc: url,
        docWidth: processed.width,
        docHeight: processed.height,
        backgroundLabel: processed.name
      });
      flashStatus(`Loaded "${processed.name}" onto canvas.`, "success");
    } catch (err) {
      flashStatus(err.message || "Unsupported image file.", "error");
    }
  };

  const handleOpenExport = useCallback(() => {
    if (activeSlotTab !== null) {
      setActiveSlotTab(null);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsExportOpen(true);
        });
      });
    } else {
      setIsExportOpen(true);
    }
  }, [activeSlotTab, setActiveSlotTab]);

  return (
    <div className="photo-studio-shell">
      <EditorToolbar
        onBackToBooth={() => setCurrentView("booth")}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitScreen={handleFitScreen}
        onResetView={handleResetView}
        onOpenExport={handleOpenExport}
      />

      {/* Mobile / Tablet Drawer Switcher Bar */}
      <div className="studio-responsive-bar">
        <button
          type="button"
          className={`resp-drawer-btn ${mobileDrawer === "assets" ? "active" : ""}`}
          onClick={() =>
            setMobileDrawer((prev) => (prev === "assets" ? "none" : "assets"))
          }
        >
          <PanelLeft size={15} />
          <span>Tools &amp; Assets</span>
        </button>
        <button
          type="button"
          className={`resp-drawer-btn ${
            mobileDrawer === "inspector" && rightTab === "properties" ? "active" : ""
          }`}
          onClick={() => {
            if (mobileDrawer === "inspector" && rightTab === "properties") {
              setMobileDrawer("none");
            } else {
              setRightTab("properties");
              setMobileDrawer("inspector");
            }
          }}
        >
          <SlidersHorizontal size={15} />
          <span>Properties</span>
        </button>
        <button
          type="button"
          className={`resp-drawer-btn ${
            mobileDrawer === "inspector" && rightTab === "layers" ? "active" : ""
          }`}
          onClick={() => {
            if (mobileDrawer === "inspector" && rightTab === "layers") {
              setMobileDrawer("none");
            } else {
              setRightTab("layers");
              setMobileDrawer("inspector");
            }
          }}
        >
          <Layers size={15} />
          <span>Layers</span>
        </button>
      </div>

      {/* Main 3-Pane Studio Workspace */}
      <div className={`studio-workspace-grid drawer-${mobileDrawer}`}>
        <AssetSidebar
          activeTab={leftTab}
          onSelectTab={setLeftTab}
          onSelectBoothStrip={loadBoothStripIntoEditor}
          onSelectSinglePhoto={loadSinglePhotoIntoEditor}
        />

        <main className="studio-center-stage" aria-label="Interactive photo canvas">
          <StripTabsBar />
          <EditorCanvas
            onRequestFitRef={fitFnRef}
            onReturnToBooth={() => setCurrentView("booth")}
            onQuickUploadPhoto={() => quickImportRef.current?.click()}
          />
        </main>

        <InspectorSidebar
          activeTab={rightTab}
          onSelectTab={setRightTab}
          onOpenSingleShotFull={loadSinglePhotoIntoEditor}
        />
      </div>

      {/* Transient Status Toast */}
      {statusMessage && (
        <div
          key={statusMessage.id}
          className={`studio-status-toast tone-${statusMessage.tone}`}
          role="status"
          aria-live="polite"
        >
          {statusMessage.text}
        </div>
      )}

      {/* Hidden photo importer for empty state */}
      <input
        ref={quickImportRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          handleQuickImportPhoto(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}

export default function Editor() {
  return (
    <EditorProvider>
      <InteractiveEditorWorkspace />
    </EditorProvider>
  );
}
