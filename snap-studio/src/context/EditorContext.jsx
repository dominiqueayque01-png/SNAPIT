/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState
} from "react";
import { saveEditorProject, loadEditorProject, hasSavedProject } from "../services/projectStorage";

const MAX_HISTORY = 50;

function makeId(prefix = "obj") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const initialPresent = {
  title: "SNAP! Studio Composition",
  docWidth: 1080,
  docHeight: 810,
  backgroundSrc: null,
  backgroundAssetId: null,
  backgroundLabel: "Captured Photo",
  backgroundVisible: true,
  backgroundLocked: true,
  backgroundColor: "#fdfbf7",
  transparentBg: false,
  photoFilterId: "normal",
  frameId: "classic-polaroid",
  frameColor: "#fdfbf7",
  frameTextColor: "#2a211f",
  frameCaption: "sweet sunday memories",
  overlayIds: [],
  overlayOpacity: 0.55,
  stripLayout: null, // null for single photo, or { mode, paperColor, textColor, borderColor, caption, dateText, topPad, bottomChin, padX }
  stripSlots: [], // Array of independent per-shot slots when editing a 3-cut / 4-strip / 2x2 Polaroid
  objects: []
};

const initialState = {
  past: [],
  present: initialPresent,
  future: [],
  selectedId: null,
  selectedSlotIndex: null,
  activeSlotTab: null, // null = Final Strip / Single Photo, 0..N-1 = dedicated per-shot editing tab
  zoom: 1,
  pan: { x: 0, y: 0 },
  toolMode: "select" // "select" | "pan"
};

function getTargetObjects(present, activeSlotTab) {
  if (
    activeSlotTab !== null &&
    activeSlotTab !== undefined &&
    present.stripSlots[activeSlotTab]
  ) {
    return present.stripSlots[activeSlotTab].objects || [];
  }
  return present.objects || [];
}

function withTargetObjects(present, activeSlotTab, nextObjects) {
  if (
    activeSlotTab !== null &&
    activeSlotTab !== undefined &&
    present.stripSlots[activeSlotTab]
  ) {
    return {
      ...present,
      stripSlots: present.stripSlots.map((slot, i) =>
        i === activeSlotTab ? { ...slot, objects: nextObjects } : slot
      )
    };
  }
  return {
    ...present,
    objects: nextObjects
  };
}

function commitSnapshot(
  state,
  nextPresent,
  nextSelectedId = state.selectedId,
  nextSelectedSlotIndex = state.selectedSlotIndex
) {
  const past = [...state.past, state.present].slice(-MAX_HISTORY);
  return {
    ...state,
    past,
    present: nextPresent,
    future: [],
    selectedId: nextSelectedId,
    selectedSlotIndex: nextSelectedSlotIndex
  };
}

function editorReducer(state, action) {
  const { present } = state;

  switch (action.type) {
    case "LOAD_DOCUMENT": {
      const normalizedSlots = (action.payload.stripSlots || []).map((slot) => ({
        ...slot,
        objects: slot.objects || []
      }));
      const nextPresent = {
        ...initialPresent,
        ...action.payload,
        backgroundLocked: true,
        stripLayout: action.payload.stripLayout || null,
        stripSlots: normalizedSlots,
        objects: action.payload.objects || []
      };
      const hasSlots = nextPresent.stripSlots.length > 0;
      return {
        ...initialState,
        present: nextPresent,
        selectedId: null,
        selectedSlotIndex: hasSlots ? 0 : null,
        activeSlotTab: hasSlots ? 0 : null
      };
    }

    case "SWAP_BACKGROUND": {
      const nextPresent = {
        ...present,
        docWidth: action.payload.docWidth || present.docWidth,
        docHeight: action.payload.docHeight || present.docHeight,
        backgroundSrc: action.payload.backgroundSrc,
        backgroundAssetId: action.payload.backgroundAssetId || null,
        backgroundLabel: action.payload.backgroundLabel || present.backgroundLabel,
        backgroundVisible: true,
        stripLayout: null,
        stripSlots: []
      };
      return {
        ...commitSnapshot(state, nextPresent, state.selectedId, null),
        activeSlotTab: null
      };
    }

    case "SET_ACTIVE_SLOT_TAB": {
      const nextTab =
        action.tab === null || action.tab === undefined
          ? null
          : Math.max(0, Math.min(present.stripSlots.length - 1, action.tab));
      return {
        ...state,
        activeSlotTab: present.stripSlots.length > 0 ? nextTab : null,
        selectedId: null,
        selectedSlotIndex: nextTab !== null ? nextTab : state.selectedSlotIndex
      };
    }

    case "SELECT_OBJECT":
      return {
        ...state,
        selectedId: action.id,
        selectedSlotIndex: action.id ? null : state.selectedSlotIndex
      };

    case "SELECT_SLOT":
      return {
        ...state,
        selectedSlotIndex: action.index,
        selectedId: action.index !== null ? null : state.selectedId
      };

    case "UPDATE_SLOT": {
      const { index, patch, recordHistory = true } = action;
      if (index === null || index === undefined || !present.stripSlots[index]) {
        return state;
      }
      const nextSlots = present.stripSlots.map((slot, i) =>
        i === index ? { ...slot, ...patch } : slot
      );
      const nextPresent = { ...present, stripSlots: nextSlots };
      if (!recordHistory) {
        return { ...state, present: nextPresent };
      }
      return commitSnapshot(state, nextPresent);
    }

    case "APPLY_FILTER_TO_ALL_SLOTS": {
      if (!present.stripSlots.length) return state;
      const nextSlots = present.stripSlots.map((slot) => ({
        ...slot,
        filterId: action.filterId
      }));
      return commitSnapshot(state, { ...present, stripSlots: nextSlots });
    }

    case "SWAP_SLOTS": {
      const { indexA, indexB } = action;
      const slots = present.stripSlots;
      if (
        indexA < 0 ||
        indexB < 0 ||
        indexA >= slots.length ||
        indexB >= slots.length ||
        indexA === indexB
      ) {
        return state;
      }
      // Swap photo content & per-shot adjustments while preserving each slot's fixed geometric frame box
      const slotA = slots[indexA];
      const slotB = slots[indexB];
      const contentKeys = [
        "src",
        "assetId",
        "filterId",
        "zoom",
        "offsetX",
        "offsetY",
        "flipX",
        "brightness",
        "contrast",
        "objects"
      ];
      const nextSlots = slots.map((slot, i) => {
        if (i === indexA) {
          const updated = { ...slot };
          contentKeys.forEach((k) => {
            updated[k] = slotB[k];
          });
          return updated;
        }
        if (i === indexB) {
          const updated = { ...slot };
          contentKeys.forEach((k) => {
            updated[k] = slotA[k];
          });
          return updated;
        }
        return slot;
      });
      return commitSnapshot(state, { ...present, stripSlots: nextSlots }, null, indexB);
    }

    case "UPDATE_STRIP_LAYOUT": {
      if (!present.stripLayout) return state;
      const nextPresent = {
        ...present,
        stripLayout: { ...present.stripLayout, ...action.patch }
      };
      if (action.recordHistory === false) {
        return { ...state, present: nextPresent };
      }
      return commitSnapshot(state, nextPresent);
    }

    case "SET_TOOL_MODE":
      return { ...state, toolMode: action.mode };

    case "SET_VIEWPORT":
      return {
        ...state,
        zoom: action.zoom !== undefined ? action.zoom : state.zoom,
        pan: action.pan !== undefined ? action.pan : state.pan
      };

    case "ADD_OBJECT": {
      const obj = {
        id: makeId(action.payload.type || "obj"),
        visible: true,
        locked: false,
        opacity: 1,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        ...action.payload
      };
      const currentObjects = getTargetObjects(present, state.activeSlotTab);
      const nextPresent = withTargetObjects(present, state.activeSlotTab, [
        ...currentObjects,
        obj
      ]);
      return commitSnapshot(state, nextPresent, obj.id);
    }

    case "UPDATE_OBJECT": {
      const { id, patch, recordHistory = true } = action;
      const currentObjects = getTargetObjects(present, state.activeSlotTab);
      let changed = false;
      const nextObjects = currentObjects.map((o) => {
        if (o.id !== id) return o;
        changed = true;
        return { ...o, ...patch };
      });
      if (!changed) return state;
      const nextPresent = withTargetObjects(present, state.activeSlotTab, nextObjects);
      if (!recordHistory) {
        return { ...state, present: nextPresent };
      }
      return commitSnapshot(state, nextPresent);
    }

    case "DELETE_OBJECT": {
      const targetId = action.id || state.selectedId;
      if (!targetId) return state;
      const currentObjects = getTargetObjects(present, state.activeSlotTab);
      const target = currentObjects.find((o) => o.id === targetId);
      if (!target || target.locked) return state;

      const nextPresent = withTargetObjects(
        present,
        state.activeSlotTab,
        currentObjects.filter((o) => o.id !== targetId)
      );
      return commitSnapshot(
        state,
        nextPresent,
        state.selectedId === targetId ? null : state.selectedId
      );
    }

    case "DUPLICATE_OBJECT": {
      const targetId = action.id || state.selectedId;
      if (!targetId) return state;
      const currentObjects = getTargetObjects(present, state.activeSlotTab);
      const orig = currentObjects.find((o) => o.id === targetId);
      if (!orig) return state;
      const copy = {
        ...orig,
        id: makeId(orig.type || "obj"),
        name: `${orig.name || "Layer"} Copy`,
        x: orig.x + 28,
        y: orig.y + 28,
        locked: false
      };
      const nextPresent = withTargetObjects(present, state.activeSlotTab, [
        ...currentObjects,
        copy
      ]);
      return commitSnapshot(state, nextPresent, copy.id);
    }

    case "REORDER_OBJECT": {
      const { id, direction } = action;
      const currentObjects = getTargetObjects(present, state.activeSlotTab);
      const idx = currentObjects.findIndex((o) => o.id === id);
      if (idx === -1) return state;
      const list = [...currentObjects];
      const [moved] = list.splice(idx, 1);

      let targetIdx = idx;
      if (direction === "forward") targetIdx = Math.min(list.length, idx + 1);
      else if (direction === "backward") targetIdx = Math.max(0, idx - 1);
      else if (direction === "front") targetIdx = list.length;
      else if (direction === "back") targetIdx = 0;

      if (targetIdx === idx) return state;
      list.splice(targetIdx, 0, moved);
      return commitSnapshot(
        state,
        withTargetObjects(present, state.activeSlotTab, list)
      );
    }

    case "UPDATE_CANVAS_SETTINGS": {
      const nextPresent = {
        ...present,
        ...action.patch,
        backgroundLocked: true // background stays locked by default
      };
      if (action.recordHistory === false) {
        return { ...state, present: nextPresent };
      }
      return commitSnapshot(state, nextPresent);
    }

    case "TOGGLE_OVERLAY": {
      const exists = present.overlayIds.includes(action.overlayId);
      const nextOverlays = exists
        ? present.overlayIds.filter((id) => id !== action.overlayId)
        : [...present.overlayIds, action.overlayId];
      return commitSnapshot(state, { ...present, overlayIds: nextOverlays });
    }

    case "UNDO": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const nextPast = state.past.slice(0, -1);
      const prevObjects = getTargetObjects(previous, state.activeSlotTab);
      const nextSelected = prevObjects.some((o) => o.id === state.selectedId)
        ? state.selectedId
        : null;
      return {
        ...state,
        past: nextPast,
        present: previous,
        future: [state.present, ...state.future].slice(0, MAX_HISTORY),
        selectedId: nextSelected
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const nextFuture = state.future.slice(1);
      const nextObjects = getTargetObjects(next, state.activeSlotTab);
      const nextSelected = nextObjects.some((o) => o.id === state.selectedId)
        ? state.selectedId
        : null;
      return {
        ...state,
        past: [...state.past, state.present].slice(-MAX_HISTORY),
        present: next,
        future: nextFuture,
        selectedId: nextSelected
      };
    }

    default:
      return state;
  }
}

const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const stageRef = useRef(null);
  const managedUrlsRef = useRef([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [savedProjectAvailable, setSavedProjectAvailable] = useState(() => hasSavedProject());
  const [isExportingHidden, setIsExportingHidden] = useState(false);

  // Clean up any blob object URLs allocated during project restoration
  useEffect(() => {
    const urlsRef = managedUrlsRef;
    return () => {
      urlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      });
      urlsRef.current = [];
    };
  }, []);

  const flashStatus = useCallback((text, tone = "info") => {
    setStatusMessage({ text, tone, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!statusMessage) return;
    const t = setTimeout(() => setStatusMessage(null), 3400);
    return () => clearTimeout(t);
  }, [statusMessage]);

  const loadDocument = useCallback((payload) => {
    dispatch({ type: "LOAD_DOCUMENT", payload });
  }, []);

  const swapBackground = useCallback((payload) => {
    dispatch({ type: "SWAP_BACKGROUND", payload });
  }, []);

  const selectObject = useCallback((id) => {
    dispatch({ type: "SELECT_OBJECT", id });
  }, []);

  const selectSlot = useCallback((index) => {
    dispatch({ type: "SELECT_SLOT", index });
  }, []);

  const setActiveSlotTab = useCallback((tab) => {
    dispatch({ type: "SET_ACTIVE_SLOT_TAB", tab });
  }, []);

  const updateSlot = useCallback((index, patch, recordHistory = true) => {
    dispatch({ type: "UPDATE_SLOT", index, patch, recordHistory });
  }, []);

  const applyFilterToAllSlots = useCallback((filterId) => {
    dispatch({ type: "APPLY_FILTER_TO_ALL_SLOTS", filterId });
  }, []);

  const swapSlots = useCallback((indexA, indexB) => {
    dispatch({ type: "SWAP_SLOTS", indexA, indexB });
  }, []);

  const updateStripLayout = useCallback((patch, recordHistory = true) => {
    dispatch({ type: "UPDATE_STRIP_LAYOUT", patch, recordHistory });
  }, []);

  const setToolMode = useCallback((mode) => {
    dispatch({ type: "SET_TOOL_MODE", mode });
  }, []);

  const setViewport = useCallback((zoom, pan) => {
    dispatch({ type: "SET_VIEWPORT", zoom, pan });
  }, []);

  const activeSlot = useMemo(
    () =>
      state.activeSlotTab !== null && state.present.stripSlots[state.activeSlotTab]
        ? state.present.stripSlots[state.activeSlotTab]
        : null,
    [state.present.stripSlots, state.activeSlotTab]
  );

  const activeDocSize = useMemo(
    () =>
      activeSlot
        ? { width: activeSlot.width, height: activeSlot.height }
        : { width: state.present.docWidth, height: state.present.docHeight },
    [activeSlot, state.present.docWidth, state.present.docHeight]
  );

  const activeObjects = useMemo(
    () => (activeSlot ? activeSlot.objects || [] : state.present.objects),
    [activeSlot, state.present.objects]
  );

  const addStickerOrImage = useCallback(
    ({ src, name, width, height, assetId = null, isSvg = false }) => {
      const { width: docWidth, height: docHeight } = activeDocSize;
      const maxInitial = Math.min(docWidth, docHeight) * 0.28;
      const ratio = width && height ? width / height : 1;
      let targetW;
      let targetH;
      if (ratio >= 1) {
        targetW = maxInitial;
        targetH = maxInitial / ratio;
      } else {
        targetH = maxInitial;
        targetW = maxInitial * ratio;
      }

      const jitterX = (Math.random() - 0.5) * 32;
      const jitterY = (Math.random() - 0.5) * 32;

      dispatch({
        type: "ADD_OBJECT",
        payload: {
          type: "image",
          name: name || "Sticker",
          src,
          assetId,
          isSvg,
          x: Math.round(docWidth / 2 - targetW / 2 + jitterX),
          y: Math.round(docHeight / 2 - targetH / 2 + jitterY),
          width: Math.round(targetW),
          height: Math.round(targetH),
          naturalWidth: width || Math.round(targetW),
          naturalHeight: height || Math.round(targetH),
          rotation: 0
        }
      });
    },
    [activeDocSize]
  );

  const addTextObject = useCallback(
    (preset = {}) => {
      const { width: docWidth, height: docHeight } = activeDocSize;
      const boxWidth = Math.round(Math.min(440, docWidth * 0.72));
      dispatch({
        type: "ADD_OBJECT",
        payload: {
          type: "text",
          name: preset.label || "Text Layer",
          text: preset.text || "Double-click to edit",
          fontFamily: preset.fontFamily || "Reenie Beanie",
          fontSize: preset.fontSize || (activeSlot ? 38 : 48),
          fill: preset.fill || "#2a211f",
          fontStyle: preset.fontStyle || "normal",
          align: preset.align || "center",
          letterSpacing: preset.letterSpacing ?? 0,
          lineHeight: preset.lineHeight ?? 1.2,
          x: Math.round(docWidth / 2 - boxWidth / 2),
          y: Math.round(docHeight / 2 - 32),
          width: boxWidth,
          rotation: 0
        }
      });
    },
    [activeDocSize, activeSlot]
  );

  const updateObject = useCallback((id, patch, recordHistory = true) => {
    dispatch({ type: "UPDATE_OBJECT", id, patch, recordHistory });
  }, []);

  const deleteObject = useCallback((id) => {
    dispatch({ type: "DELETE_OBJECT", id });
  }, []);

  const duplicateObject = useCallback((id) => {
    dispatch({ type: "DUPLICATE_OBJECT", id });
  }, []);

  const reorderObject = useCallback((id, direction) => {
    dispatch({ type: "REORDER_OBJECT", id, direction });
  }, []);

  const updateCanvasSettings = useCallback((patch, recordHistory = true) => {
    dispatch({ type: "UPDATE_CANVAS_SETTINGS", patch, recordHistory });
  }, []);

  const toggleOverlay = useCallback((overlayId) => {
    dispatch({ type: "TOGGLE_OVERLAY", overlayId });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const saveProject = useCallback(async () => {
    try {
      await saveEditorProject(state.present);
      setSavedProjectAvailable(true);
      flashStatus("Project saved locally to your browser.", "success");
      return true;
    } catch (err) {
      flashStatus(err.message || "Could not save project.", "error");
      return false;
    }
  }, [state.present, flashStatus]);

  const restoreProject = useCallback(async () => {
    try {
      const loaded = await loadEditorProject();
      if (!loaded?.project) {
        flashStatus("No saved project found in this browser.", "error");
        return false;
      }
      // Track newly created blob URLs for later cleanup
      if (loaded.createdUrls?.length) {
        managedUrlsRef.current.push(...loaded.createdUrls);
      }
      dispatch({ type: "LOAD_DOCUMENT", payload: loaded.project });
      flashStatus("Restored your last saved project.", "success");
      return true;
    } catch (err) {
      flashStatus(err.message || "Failed to restore saved project.", "error");
      return false;
    }
  }, [flashStatus]);

  const selectedObject = useMemo(
    () => activeObjects.find((o) => o.id === state.selectedId) || null,
    [activeObjects, state.selectedId]
  );

  const selectedSlot = useMemo(
    () =>
      state.selectedSlotIndex !== null && state.present.stripSlots[state.selectedSlotIndex]
        ? state.present.stripSlots[state.selectedSlotIndex]
        : null,
    [state.present.stripSlots, state.selectedSlotIndex]
  );

  const value = useMemo(
    () => ({
      present: state.present,
      selectedId: state.selectedId,
      selectedObject,
      selectedSlotIndex: state.selectedSlotIndex,
      selectedSlot,
      activeSlotTab: state.activeSlotTab,
      activeSlot,
      activeObjects,
      activeDocSize,
      zoom: state.zoom,
      pan: state.pan,
      toolMode: state.toolMode,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      stageRef,
      statusMessage,
      savedProjectAvailable,
      isExportingHidden,
      setIsExportingHidden,
      flashStatus,
      loadDocument,
      swapBackground,
      selectObject,
      selectSlot,
      setActiveSlotTab,
      updateSlot,
      applyFilterToAllSlots,
      swapSlots,
      updateStripLayout,
      setToolMode,
      setViewport,
      addStickerOrImage,
      addTextObject,
      updateObject,
      deleteObject,
      duplicateObject,
      reorderObject,
      updateCanvasSettings,
      toggleOverlay,
      undo,
      redo,
      saveProject,
      restoreProject
    }),
    [
      state.present,
      state.selectedId,
      selectedObject,
      state.selectedSlotIndex,
      selectedSlot,
      state.activeSlotTab,
      activeSlot,
      activeObjects,
      activeDocSize,
      state.zoom,
      state.pan,
      state.toolMode,
      state.past.length,
      state.future.length,
      statusMessage,
      savedProjectAvailable,
      isExportingHidden,
      flashStatus,
      loadDocument,
      swapBackground,
      selectObject,
      selectSlot,
      setActiveSlotTab,
      updateSlot,
      applyFilterToAllSlots,
      swapSlots,
      updateStripLayout,
      setToolMode,
      setViewport,
      addStickerOrImage,
      addTextObject,
      updateObject,
      deleteObject,
      duplicateObject,
      reorderObject,
      updateCanvasSettings,
      toggleOverlay,
      undo,
      redo,
      saveProject,
      restoreProject
    ]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return ctx;
}
