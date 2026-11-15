import { useState, useEffect } from "react";
import CountdownOverlay from "./CountdownOverlay";
import useAudio from "../../hooks/useAudio";
import { FILTERS } from "../../constants/filters";

export default function CameraFeed({
  videoRef,
  hasStream,
  onStartCamera,
  onCapture,
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
  const [flashMode, setFlashMode] = useState("ON"); // "ON" | "AUTO" | "OFF"
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
    setZoomLevel(prev => Math.min(2.2, Math.max(1, +(prev + delta).toFixed(1))));
  };

  const handleCycleFilter = () => {
    playButtonClick();
    setActiveFilterIndex(prev => (prev + 1) % FILTERS.length);
  };

  const handleCycleFlash = () => {
    playButtonClick();
    const modes = ["ON", "AUTO", "OFF"];
    const nextIdx = (modes.indexOf(flashMode) + 1) % modes.length;
    setFlashMode(modes[nextIdx]);
  };

  const handleShutterClick = () => {
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

  const currentFilter = FILTERS[activeFilterIndex] || FILTERS[0];

  return (
    <div className="digicam-hero-container">
      {/* Vintage Metallic Digicam Body (Enlarged Hero Camera) */}
      <div className="digicam-body-hero">
        {/* Top Metallic Plate */}
        <div className="digicam-top-plate">
          <div className="digicam-brand-badge">
            <span className="brand-dot red" />
            <span className="brand-model">SNAP! DIGITAL CYBER-SHOT ✦ 7.2 MEGAPIXELS</span>
          </div>

          <div className="digicam-top-controls">
            {/* Functional Flash Mode Button */}
            <button
              className="digicam-top-pill"
              onClick={handleCycleFlash}
              title={`Flash Mode: ${flashMode} (Click to change)`}
            >
              <span>{flashMode === "OFF" ? "🚫" : "⚡"} {flashMode}</span>
            </button>

            {/* Functional Power Button */}
            <button
              className={`digicam-power-btn ${hasStream ? "power-on" : ""}`}
              onClick={handlePowerClick}
              title={hasStream ? "Camera Active (Click to toggle)" : "Click to Power On"}
            >
              <span className="power-led" />
              <span className="power-txt">{hasStream ? "ON" : "OFF"}</span>
            </button>

            {/* Large Tactile Shutter Release Button */}
            <button
              className={`digicam-hero-shutter ${shutterPressed || capturing ? "pressed" : ""}`}
              onClick={handleShutterClick}
              disabled={capturing}
              title="Shutter Button (Click to Take Photo!)"
            >
              <div className="shutter-metal-ring">
                <div className="shutter-inner-disc" />
              </div>
            </button>
          </div>
        </div>

        {/* Main Face: Large LCD on Left, Button Column on Right */}
        <div className="digicam-main-face">
          {/* Large Screen Bezel */}
          <div className="digicam-screen-bezel">
            <div className="digicam-lcd-display">
              {/* Live Webcam Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`digicam-video-stream ${!hasStream ? "hidden" : ""}`}
                style={{
                  transform: `scaleX(-1) scale(${zoomLevel})`,
                  filter: currentFilter.css
                }}
              />

              {/* Viewfinder Crosshair & AF Focus Target */}
              {hasStream && (
                <div className="digicam-af-bracket">
                  <div className="af-crosshair">
                    <span className="af-mark top-left" />
                    <span className="af-mark top-right" />
                    <span className="af-mark bottom-left" />
                    <span className="af-mark bottom-right" />
                  </div>
                </div>
              )}

              {/* Vintage Digicam On-Screen Display (OSD) */}
              {hasStream && (
                <div className="digicam-osd-layer">
                  {/* OSD Top Bar */}
                  <div className="osd-top-row">
                    <div className="osd-status-group">
                      <span className="rec-dot led-rec-blink">●</span>
                      <span className="osd-status-text">
                        {capturing ? "CAPTURING" : "READY"}
                      </span>
                    </div>

                    <div className="osd-mid-tags">
                      <span className="osd-tag flash">
                        {flashMode === "OFF" ? "NO FLASH" : `FLASH ${flashMode}`}
                      </span>
                      <span className="osd-tag filter" onClick={handleCycleFilter}>
                        {currentFilter.name.toUpperCase()}
                      </span>
                      <span className="osd-tag zoom">{zoomLevel.toFixed(1)}x ZOOM</span>
                    </div>

                    <div className="osd-battery-group">
                      <span className="batt-format">RAW 4:3</span>
                      <div className="batt-gauge">
                        <div className="batt-cell" />
                        <div className="batt-cell" />
                        <div className="batt-cell" />
                      </div>
                    </div>
                  </div>

                  {/* OSD Bottom Bar */}
                  <div className="osd-bottom-row">
                    <span className="osd-pic-counter">
                      PIC [{String(currentCount).padStart(2, "0")}/{String(totalPhotos).padStart(2, "0")}]
                    </span>
                    <span className="osd-clock">{currentTime}</span>
                    <span className="osd-iso-tag">ISO 200 · FINE</span>
                  </div>
                </div>
              )}

              {/* Standby / Idle Screen with Bubbly Pink "SNAP" Logo (From design.png!) */}
              {!hasStream && (
                <div className="digicam-standby-screen" onClick={handleShutterClick}>
                  <div className="standby-lcd-grid" />
                  <div className="snap-logo-bubble snap-title-glow">
                    <span>SNAP</span>
                  </div>
                  <div className="standby-callout">
                    <button className="standby-power-btn" onClick={handleShutterClick}>
                      <span className="btn-sparkle">✦</span>
                      <span>TAP TO POWER ON CAMERA</span>
                      <span className="btn-sparkle">✦</span>
                    </button>
                    <p className="standby-subtext">Click the screen or top shutter button</p>
                  </div>
                </div>
              )}

              {/* 3-2-1 Countdown Overlay */}
              <CountdownOverlay countdown={countdown} />

              {/* Shutter Screen Flash */}
              {isFlashActive && <div className="flash-screen flash-active" />}
            </div>
          </div>

          {/* Right Digicam Button Panel */}
          <div className="digicam-controls-column">
            {/* W/T Optical Zoom Rocker */}
            <div className="digicam-zoom-section">
              <span className="zoom-label">ZOOM</span>
              <div className="digicam-zoom-rocker">
                <button
                  className="btn-zoom wide"
                  onClick={() => handleZoom(-0.2)}
                  title="Zoom Out (Wide)"
                >
                  W
                </button>
                <div className="zoom-pivot" />
                <button
                  className="btn-zoom tele"
                  onClick={() => handleZoom(0.2)}
                  title="Zoom In (Tele)"
                >
                  T
                </button>
              </div>
            </div>

            {/* Quick Filter & Flash Mode Buttons */}
            <div className="digicam-btn-row">
              <button
                className="btn-digi-round"
                onClick={handleCycleFilter}
                title="Cycle Filter (B&W, Vintage, Rosy, etc.)"
              >
                <span>🎨</span>
                <span className="btn-subtext">FLTR</span>
              </button>

              <button
                className="btn-digi-round"
                onClick={handleCycleFlash}
                title="Toggle Flash (Auto, On, Off)"
              >
                <span>⚡</span>
                <span className="btn-subtext">FLASH</span>
              </button>
            </div>

            {/* Circular 4-Way D-Pad with Center SET Button */}
            <div className="digicam-dpad-module">
              <div className="dpad-cross">
                <button
                  className="dpad-btn up"
                  onClick={() => handleZoom(0.2)}
                  title="Zoom In"
                >
                  ▲
                </button>
                <button
                  className="dpad-btn left"
                  onClick={() => {
                    playButtonClick();
                    setActiveFilterIndex(prev => (prev - 1 + FILTERS.length) % FILTERS.length);
                  }}
                  title="Previous Filter"
                >
                  ◀
                </button>
                <button
                  className="dpad-center-ok"
                  onClick={handleShutterClick}
                  title="SET / Capture Shutter"
                >
                  <span>SET</span>
                </button>
                <button
                  className="dpad-btn right"
                  onClick={handleCycleFilter}
                  title="Next Filter"
                >
                  ▶
                </button>
                <button
                  className="dpad-btn down"
                  onClick={() => handleZoom(-0.2)}
                  title="Zoom Out"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Mode Selector Pill Buttons Styled like Camera Dials */}
            <div className="camera-mode-dial-compact">
              <span className="dial-label">MODE</span>
              <div className="dial-buttons-grid">
                {[
                  { id: "single", label: "1" },
                  { id: "strip-3", label: "3" },
                  { id: "strip-4", label: "4" },
                  { id: "grid-4", label: "2x2" }
                ].map(m => (
                  <button
                    key={m.id}
                    className={`dial-mini-btn ${mode === m.id ? "active" : ""}`}
                    onClick={() => {
                      playButtonClick();
                      if (onSelectMode) onSelectMode(m.id);
                    }}
                    disabled={capturing}
                    title={`${m.label} Photo Mode`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speaker Grille Holes */}
            <div className="digicam-speaker-grille">
              <div className="mic-hole" />
              <div className="mic-hole" />
              <div className="mic-hole" />
              <div className="mic-hole" />
            </div>
          </div>
        </div>

        {/* Lanyard Wrist Strap Hanging Down on Right Edge (From design.png!) */}
        <div className="digicam-strap-assembly">
          <div className="strap-lug" />
          <div className="strap-cord" />
          <div className="beaded-wrist-loop" />
        </div>
      </div>

      {error && <div className="digicam-error-pill">{error}</div>}
    </div>
  );
}
