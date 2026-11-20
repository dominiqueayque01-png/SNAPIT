import { createContext, useContext, useState, useEffect } from "react";
import { BOOTH_MODES, DEFAULT_MODE } from "../constants/modes";
import { FILTERS, DEFAULT_FILTER } from "../constants/filters";
import { FRAMES, DEFAULT_FRAME } from "../constants/frames";

import sample1 from "../assets/samples/sample-1.jpg";
import sample2 from "../assets/samples/sample-2.jpg";
import sample3 from "../assets/samples/sample-3.jpg";
import sample4 from "../assets/samples/sample-4.jpg";

export const SAMPLE_PHOTOS = [sample1, sample2, sample3, sample4];

const BoothContext = createContext(null);

export function BoothProvider({ children }) {
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [photos, setPhotos] = useState([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [currentView, setCurrentView] = useState("landing"); // "landing" | "booth" | "editor" | "gallery"

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("snap_sound_enabled") !== "false";
    } catch {
      return true;
    }
  });

  const [selectedFilter, setSelectedFilter] = useState(
    FILTERS.find((f) => f.id === DEFAULT_FILTER) || FILTERS[0]
  );
  const [selectedFrame, setSelectedFrame] = useState(
    FRAMES.find((f) => f.id === DEFAULT_FRAME) || FRAMES[0]
  );
  const [stickers, setStickers] = useState([]);
  const [customText, setCustomText] = useState("sunday light, desk roll");
  // Controls what the interactive photo editor opens ("strip" | "single" | "gallery")
  const [editorTarget, setEditorTarget] = useState({ type: "strip" });

  const openInEditor = (target = { type: "strip" }) => {
    setEditorTarget(target);
    setCurrentView("editor");
  };

  useEffect(() => {
    try {
      localStorage.setItem("snap_sound_enabled", soundEnabled ? "true" : "false");
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  const toggleSound = () => setSoundEnabled((prev) => !prev);

  const activeModeConfig =
    BOOTH_MODES.find((m) => m.id === mode) || BOOTH_MODES[2];

  const addPhoto = (photoDataUrl) => {
    setPhotos((prev) => {
      const next = [...prev, photoDataUrl];
      setSelectedPreviewIndex(next.length - 1);
      return next;
    });
  };

  const clearPhotos = () => {
    setPhotos([]);
    setSelectedPreviewIndex(null);
    setStickers([]);
  };

  const loadSampleRoll = (customMode) => {
    const targetMode = customMode || mode;
    if (customMode) {
      setMode(customMode);
    }
    const targetConfig =
      BOOTH_MODES.find((m) => m.id === targetMode) || activeModeConfig;
    const count = targetConfig.count;
    const demoPhotos = Array.from({ length: count }).map(
      (_, i) => SAMPLE_PHOTOS[i % SAMPLE_PHOTOS.length]
    );
    setPhotos(demoPhotos);
    setSelectedPreviewIndex(demoPhotos.length - 1);
    triggerFlash();
  };

  const addSticker = (sticker) => {
    const randomOffsetX = (Math.random() - 0.5) * 24;
    const randomOffsetY = (Math.random() - 0.5) * 24;
    const newSticker = {
      id: Date.now() + Math.random(),
      emoji: sticker.emoji,
      label: sticker.label,
      x: 50 + randomOffsetX,
      y: 50 + randomOffsetY,
      size: 44,
      rotation: Math.round((Math.random() - 0.5) * 20),
      isNew: true
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const updateSticker = (id, updates) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, isNew: false } : s))
    );
  };

  const removeSticker = (id) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  };

  const triggerFlash = () => {
    setIsFlashActive(true);
    setTimeout(() => {
      setIsFlashActive(false);
    }, 380);
  };

  return (
    <BoothContext.Provider
      value={{
        mode,
        setMode,
        activeModeConfig,
        photos,
        setPhotos,
        selectedPreviewIndex,
        setSelectedPreviewIndex,
        addPhoto,
        clearPhotos,
        loadSampleRoll,
        capturing,
        setCapturing,
        countdown,
        setCountdown,
        isFlashActive,
        triggerFlash,
        currentView,
        setCurrentView,
        soundEnabled,
        setSoundEnabled,
        toggleSound,
        selectedFilter,
        setSelectedFilter,
        selectedFrame,
        setSelectedFrame,
        stickers,
        setStickers,
        addSticker,
        updateSticker,
        removeSticker,
        customText,
        setCustomText,
        editorTarget,
        setEditorTarget,
        openInEditor
      }}
    >
      {children}
    </BoothContext.Provider>
  );
}

export function useBooth() {
  const context = useContext(BoothContext);
  if (!context) {
    throw new Error("useBooth must be used within a BoothProvider");
  }
  return context;
}
