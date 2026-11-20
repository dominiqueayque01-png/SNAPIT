import { useState, useEffect } from "react";
import {
  Zap,
  ZapOff,
  Palette,
  Power,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Aperture,
  Sparkles
} from "lucide-react";
import CountdownOverlay from "./CountdownOverlay";
import useAudio from "../../hooks/useAudio";
import { FILTERS } from "../../constants/filters";

export default function CameraFeed({
  videoRef,
  hasStream,
  onStartCamera,
  onCapture,
  onLoadSampleRoll,
  capturing,
  error,
  countdown,
  isFlashActive,
  currentCount = 0,
  totalPhotos = 4,
  mode,
  onSelectMode
}) {
  const { playButtonClick, playZoomChirp, playPowerChime } = useAudio();
  const [currentTime, setCurrentTime] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [flashMode, setFlashMode] = useState("ON");
  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const [shutterPressed, setShutterPressed] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleZoom = (delta) => {
    playZoomChirp(delta > 0);
    setZoomLevel((prev) =>
      Math.min(2.2, Math.max(1, +(prev + delta).toFixed(1)))
    );
  };

  const handleCycleFilter = (reverse = false) => {
    playButtonClick();
    setActiveFilterIndex((prev) =>
      reverse
        ? (prev - 1 + FILTERS.length) % FILTERS.length
        : (prev + 1) % FILTERS.length
    );
  };

  const handleCycleFlash = () => {
    playButtonClick();
    const modes = ["ON", "AUTO", "OFF"];
    const nextIdx = (modes.indexOf(flashMode) + 1) % modes.length;
    setFlashMode(modes[nextIdx]);
  };

  const handleShutterClick = () => {
    if (capturing) return;
    playButtonClick();
    setShutterPressed(true);
    setTimeout(() => setShutterPressed(false), 200);

    if (!hasStream) {
      playPowerChime(true);
      onStartCamera();
    } else {
      onCapture();
    }
  };

  const handlePowerClick = () => {
    playPowerChime(!hasStream);
    onStartCamera();
  };

  // Keyboard shortcut listener for analog booth feel
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.code === "Space") {
        e.preventDefault();
        handleShutterClick();
      } else if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
        e.preventDefault();
        handleZoom(0.2);
      } else if (e.key === "t" || e.key === "T" || e.key === "ArrowDown") {
        e.preventDefault();
        handleZoom(-0.2);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleCycleFilter(false);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleCycleFilter(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasStream, capturing, activeFilterIndex, zoomLevel]);

  const currentFilter = FILTERS[activeFilterIndex] || FILTERS[0];

  return (
    <div className="camera-chassis-wrapper">
      <div className={`analog-camera-body ${isFlashActive ? "shutter-firing" : ""}`}>
        {/* Top Anodized Deck */}
        <div className="camera-top-deck">
          <div className="camera-model-plate">
            <span className={`camera-led ${hasStream ? "armed" : ""}`} />
            <span className="camera-model-name">SNAP! MODEL 74 · INSTANT RANGEFINDER</span>
          </div>

          <div className="camera-top-controls">
            <button
              type="button"
              className="cam-deck-btn"
              onClick={handleCycleFlash}
              title={`Flash Mode: ${flashMode}`}
            >
              {flashMode === "OFF" ? <ZapOff size={13} /> : <Zap size={13} />}
              <span>{flashMode}</span>
            </button>

            <button
              type="button"
              className={`cam-power-btn ${hasStream ? "power-on" : ""}`}
              onClick={handlePowerClick}
              title={hasStream ? "Viewfinder Active" : "Power On Viewfinder"}
            >
              <Power size={13} />
              <span>{hasStream ? "ON" : "OFF"}</span>
            </button>

            <button
              type="button"
              className={`cam-shutter-release ${shutterPressed || capturing ? "pressed" : ""}`}
              onClick={handleShutterClick}
              disabled={capturing}
              title="Release Shutter [Spacebar]"
              aria-label="Release shutter"
            >
              <span className="shutter-collar">
                <span className="shutter-button-core" />
              </span>
            </button>
          </div>
        </div>

        {/* Main Chassis Face: Optical Viewfinder + Mechanical Controls */}
        <div className="camera-main-face">
          <div className="viewfinder-bezel">
            <div className="viewfinder-screen">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`viewfinder-video ${!hasStream ? "hidden" : ""}`}
                style={{
                  transform: `scaleX(-1) scale(${zoomLevel})`,
                  filter: currentFilter.css
                }}
              />

              {hasStream && (
                <>
                  <div className="viewfinder-reticle" aria-hidden="true">
                    <span className="reticle-corner tl" />
                    <span className="reticle-corner tr" />
                    <span className="reticle-corner bl" />
                    <span className="reticle-corner br" />
                    <span className="reticle-center-cross" />
                  </div>

                  <div className="viewfinder-osd">
                    <div className="osd-row">
                      <span className="osd-live-badge">
                        <span className="osd-rec-dot led-rec-blink" />
                        <span>{capturing ? "EXPOSING" : "ARMED"}</span>
                      </span>

                      <div className="osd-tags">
                        <button
                          type="button"
                          className="osd-chip"
                          onClick={() => handleCycleFilter(false)}
                          title="Cycle film stock [← / →]"
                        >
                          {currentFilter.name.toUpperCase()}
                        </button>
                        <span className="osd-chip tabular">
                          {zoomLevel.toFixed(1)}×
                        </span>
                      </div>
                    </div>

                    <div className="osd-row osd-bottom tabular">
                      <span>
                        EXP {String(currentCount).padStart(2, "0")}/
                        {String(totalPhotos).padStart(2, "0")}
                      </span>
                      <span>{currentTime}</span>
                      <span>ISO 640 · 4:3</span>
                    </div>
                  </div>
                </>
              )}

              {!hasStream && (
                <div className="viewfinder-standby" onClick={handleShutterClick}>
                  <div className="standby-aperture-ring">
                    <Aperture size={34} strokeWidth={1.5} />
                  </div>
                  <div className="standby-wordmark">SNAP! STUDIO</div>
                  <div className="standby-actions-group">
                    <button
                      type="button"
                      className="standby-activate-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShutterClick();
                      }}
                    >
                      Power On Camera
                    </button>
                    {onLoadSampleRoll && (
                      <button
                        type="button"
                        className="standby-demo-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadSampleRoll();
                        }}
                      >
                        <Sparkles size={13} />
                        <span>Load Sample Roll to Test</span>
                      </button>
                    )}
                  </div>
                  <p className="standby-caption">
                    Local webcam feed only · Press [Spacebar] or top red button to shoot
                  </p>
                </div>
              )}

              <CountdownOverlay countdown={countdown} />
              {isFlashActive && flashMode !== "OFF" && (
                <div className="flash-screen flash-active" />
              )}
            </div>
          </div>

          {/* Right Mechanical Control Column */}
          <div className="camera-controls-rail">
            <div className="control-block">
              <span className="control-micro-label">OPTICAL</span>
              <div className="zoom-rocker">
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={() => handleZoom(-0.2)}
                  title="Zoom Out (Wide) [T]"
                >
                  W
                </button>
                <span className="zoom-divider" />
                <button
                  type="button"
                  className="zoom-btn"
                  onClick={() => handleZoom(0.2)}
                  title="Zoom In (Tele) [W]"
                >
                  T
                </button>
              </div>
            </div>

            <div className="control-pair">
              <button
                type="button"
                className="mech-round-btn"
                onClick={() => handleCycleFilter(false)}
                title="Cycle Film Stock [← / →]"
              >
                <Palette size={14} />
                <span>STOCK</span>
              </button>

              <button
                type="button"
                className="mech-round-btn"
                onClick={handleCycleFlash}
                title="Cycle Flash Mode"
              >
                {flashMode === "OFF" ? <ZapOff size={14} /> : <Zap size={14} />}
                <span>FLASH</span>
              </button>
            </div>

            <div className="dpad-dial">
              <button
                type="button"
                className="dpad-dir up"
                onClick={() => handleZoom(0.2)}
                aria-label="Zoom in"
                title="Zoom in [W]"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="dpad-dir left"
                onClick={() => handleCycleFilter(true)}
                aria-label="Previous film stock"
                title="Previous film stock [←]"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                className="dpad-center"
                onClick={handleShutterClick}
                disabled={capturing}
                aria-label="Trigger shutter"
                title="Release Shutter [Space]"
              >
                EXP
              </button>
              <button
                type="button"
                className="dpad-dir right"
                onClick={() => handleCycleFilter(false)}
                aria-label="Next film stock"
                title="Next film stock [→]"
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                className="dpad-dir down"
                onClick={() => handleZoom(-0.2)}
                aria-label="Zoom out"
                title="Zoom out [T]"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="control-block">
              <span className="control-micro-label">CUT</span>
              <div className="cut-dial-grid">
                {[
                  { id: "single", label: "1" },
                  { id: "strip-3", label: "3" },
                  { id: "strip-4", label: "4" },
                  { id: "grid-4", label: "2×2" }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`cut-dial-btn tabular ${mode === m.id ? "active" : ""}`}
                    onClick={() => {
                      playButtonClick();
                      if (onSelectMode) onSelectMode(m.id);
                    }}
                    disabled={capturing}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="camera-error-banner" role="alert">
          <span>{error}</span>
          {onLoadSampleRoll && (
            <button
              type="button"
              className="btn-error-demo"
              onClick={onLoadSampleRoll}
            >
              Load Sample Roll Instead
            </button>
          )}
        </div>
      )}
    </div>
  );
}
