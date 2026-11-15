import { createContext, useContext, useState } from "react";
import { BOOTH_MODES, DEFAULT_MODE } from "../constants/modes";
import { FILTERS, DEFAULT_FILTER } from "../constants/filters";
import { FRAMES, DEFAULT_FRAME } from "../constants/frames";

const BoothContext = createContext(null);

export function BoothProvider({ children }) {
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [photos, setPhotos] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [currentView, setCurrentView] = useState("booth"); // "booth" | "editor" | "gallery"

  const [selectedFilter, setSelectedFilter] = useState(
    FILTERS.find(f => f.id === DEFAULT_FILTER) || FILTERS[0]
  );
  const [selectedFrame, setSelectedFrame] = useState(
    FRAMES.find(f => f.id === DEFAULT_FRAME) || FRAMES[0]
  );
  const [stickers, setStickers] = useState([]);
  const [customText, setCustomText] = useState("my little moment ✿");

  const activeModeConfig = BOOTH_MODES.find(m => m.id === mode) || BOOTH_MODES[2];

  const addPhoto = (photoDataUrl) => {
    setPhotos(prev => [...prev, photoDataUrl]);
  };

  const clearPhotos = () => {
    setPhotos([]);
    setStickers([]);
  };

  const addSticker = (sticker) => {
    // Places sticker at center or random offset
    const randomOffsetX = (Math.random() - 0.5) * 30;
    const randomOffsetY = (Math.random() - 0.5) * 30;
    const newSticker = {
      id: Date.now() + Math.random(),
      emoji: sticker.emoji,
      label: sticker.label,
      x: 50 + randomOffsetX,
      y: 50 + randomOffsetY,
      size: 42,
      rotation: Math.round((Math.random() - 0.5) * 20)
    };
    setStickers(prev => [...prev, newSticker]);
  };

  const updateSticker = (id, updates) => {
    setStickers(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const removeSticker = (id) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const triggerFlash = () => {
    setIsFlashActive(true);
    setTimeout(() => {
      setIsFlashActive(false);
    }, 350);
  };

  return (
    <BoothContext.Provider
      value={{
        mode,
        setMode,
        activeModeConfig,
        photos,
        setPhotos,
        addPhoto,
        clearPhotos,
        capturing,
        setCapturing,
        countdown,
        setCountdown,
        isFlashActive,
        triggerFlash,
        currentView,
        setCurrentView,
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
        setCustomText
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
