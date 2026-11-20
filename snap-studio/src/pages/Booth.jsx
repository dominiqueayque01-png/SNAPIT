import { useState, useRef } from "react";
import {
  Camera,
  SlidersHorizontal,
  RotateCcw,
  ArrowLeft,
  Images,
  Aperture,
  ShieldCheck,
  Heart,
  Volume2,
  VolumeX,
  Sparkles
} from "lucide-react";
import useCamera from "../hooks/useCamera";
import useAudio from "../hooks/useAudio";
import { useBooth } from "../context/BoothContext";
import CameraFeed from "../components/camera/CameraFeed";
import StripPreview from "../components/booth/StripPreview";
import catImg from "../assets/2.png";
import polaroidsImg from "../assets/3.png";

const CUT_OPTIONS = [
  { id: "single", code: "01A", label: "Single" },
  { id: "strip-3", code: "03A", label: "3-Cut" },
  { id: "strip-4", code: "04A", label: "4-Strip" },
  { id: "grid-4", code: "04B", label: "2×2 Grid" }
];

export default function Booth() {
  const { videoRef, stream, error, startCamera } = useCamera();
  const { playCountdownBeep, playShutterSound, playCatMeow, playButtonClick } = useAudio();
  const canvasRef = useRef(null);

  const {
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
    soundEnabled,
    toggleSound,
    capturing,
    setCapturing,
    countdown,
    setCountdown,
    isFlashActive,
    triggerFlash,
    setCurrentView,
    openInEditor
  } = useBooth();

  const [lastStageNote, setLastStageNote] = useState("Camera on standby. Power on viewfinder to arm shutter.");
  const [isCatPurring, setIsCatPurring] = useState(false);
  const totalPhotosNeeded = activeModeConfig.count;
  const hasStream = Boolean(stream);
  const isComplete = photos.length >= totalPhotosNeeded;

  const handlePetBoothCat = () => {
    playCatMeow();
    setIsCatPurring(true);
    setTimeout(() => setIsCatPurring(false), 1800);
  };

  const getCompanionLine = () => {
    if (isCatPurring) return "Purrrr~ you're the cutest! Ready for another roll?";
    if (capturing) return "3, 2, 1... hold that sweet pose!";
    if (isComplete) return "Roll developed! Open Darkroom to add pastel frames & stamps.";
    if (photos.length > 0) return `Looking lovely — ${photos.length}/${totalPhotosNeeded} frames exposed. Click any strip frame to inspect.`;
    if (hasStream) return "Viewfinder is live! Strike a pose and press shutter or Spacebar.";
    return lastStageNote;
  };

  const exposureStage = capturing
    ? { code: "02", label: "EXPOSING", tone: "active" }
    : isComplete
    ? { code: "04", label: "PRINT READY", tone: "ready" }
    : photos.length > 0
    ? { code: "03", label: "DEVELOPING", tone: "warm" }
    : hasStream
    ? { code: "01", label: "ARMED", tone: "armed" }
    : { code: "00", label: "STANDBY", tone: "idle" };

  const captureSingleFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !video.videoWidth) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
  };

  const handleStartCaptureSequence = async () => {
    if (!videoRef.current?.videoWidth) {
      setLastStageNote("Viewfinder armed. Frame your subject and press shutter.");
      await startCamera();
      return;
    }

    setCapturing(true);
    setPhotos([]);
    setSelectedPreviewIndex(null);
    setLastStageNote("Shutter sequence running. Hold steady for each exposure.");

    for (let i = 0; i < totalPhotosNeeded; i++) {
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        playCountdownBeep(false);
        await new Promise((r) => setTimeout(r, 1000));
      }

      setCountdown("EXPOSE");
      playCountdownBeep(true);
      await new Promise((r) => setTimeout(r, 380));

      playShutterSound();
      triggerFlash();

      const shot = captureSingleFrame();
      if (shot) {
        addPhoto(shot);
      }

      setCountdown(null);

      if (i < totalPhotosNeeded - 1) {
        await new Promise((r) => setTimeout(r, 1150));
      }
    }

    setCapturing(false);
    setLastStageNote("Roll complete. Inspect contact strip or enter Darkroom to tone & export.");
  };

  const handleDownloadSingle = (photoUrl, idx) => {
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `snap-studio-frame-${String(idx + 1).padStart(2, "0")}.png`;
    a.click();
  };

  const previewIdx =
    selectedPreviewIndex !== null && photos[selectedPreviewIndex]
      ? selectedPreviewIndex
      : photos.length - 1;
  const currentPreviewPhoto = photos[previewIdx] || null;

  const todayStamp = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, ".");

  return (
    <div className="booth-viewport">
      <header className="booth-top-rail">
        <div className="booth-rail-left">
          <button
            type="button"
            className="booth-rail-btn"
            onClick={() => {
              playButtonClick();
              setCurrentView("landing");
            }}
          >
            <ArrowLeft size={15} />
            <span>Folio</span>
          </button>

          <button
            type="button"
            className="booth-rail-btn"
            onClick={() => {
              playButtonClick();
              setCurrentView("gallery");
            }}
          >
            <Images size={15} />
            <span>Album</span>
          </button>

          <button
            type="button"
            className={`booth-rail-btn sound-toggle-btn ${!soundEnabled ? "is-muted" : ""}`}
            onClick={() => {
              toggleSound();
              if (!soundEnabled) playButtonClick();
            }}
            title={soundEnabled ? "Mute analog audio" : "Unmute analog audio"}
            aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="tabular">{soundEnabled ? "Audio On" : "Muted"}</span>
          </button>
        </div>

        <button
          type="button"
          className="booth-brand-mark"
          onClick={() => {
            playButtonClick();
            setCurrentView("landing");
          }}
        >
          <span className="booth-brand-name">SNAP! STUDIO</span>
          <span className="booth-brand-spec">BOOTH DESK · LOCAL</span>
        </button>

        <div className="booth-mode-bar" role="group" aria-label="Film cut format">
          {CUT_OPTIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`booth-mode-btn ${mode === m.id ? "active" : ""}`}
              onClick={() => {
                playButtonClick();
                setMode(m.id);
              }}
              disabled={capturing}
            >
              <span className="mode-code tabular">{m.code}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="booth-desk-grid">
        {/* Left Column: Live Developing Strip on Proofing Sheet */}
        <section className="booth-col-strip" aria-label="Developing photo strip">
          <StripPreview
            photos={photos}
            mode={mode}
            totalSlots={totalPhotosNeeded}
            selectedPreviewIndex={selectedPreviewIndex}
            onSelectFrame={setSelectedPreviewIndex}
            onOpenEditor={() => openInEditor({ type: "strip" })}
            onEditSingle={(idx) => openInEditor({ type: "single", photoIndex: idx })}
            onRetake={clearPhotos}
            onDownloadSingle={handleDownloadSingle}
            onLoadSampleRoll={() => loadSampleRoll(mode)}
          />
        </section>

        {/* Center Column: Vintage Tactile Camera & Shutter Controls */}
        <section className="booth-col-camera" aria-label="Vintage camera viewfinder">
          <CameraFeed
            videoRef={videoRef}
            hasStream={hasStream}
            onStartCamera={startCamera}
            onCapture={handleStartCaptureSequence}
            onLoadSampleRoll={() => loadSampleRoll(mode)}
            capturing={capturing}
            error={error}
            countdown={countdown}
            isFlashActive={isFlashActive}
            currentCount={photos.length}
            totalPhotos={totalPhotosNeeded}
            mode={mode}
            onSelectMode={setMode}
          />

          <div className="booth-shutter-bar">
            {photos.length === 0 && (
              <button
                type="button"
                className="btn-desk-demo"
                onClick={() => {
                  playButtonClick();
                  loadSampleRoll(mode);
                  setLastStageNote("Sample roll loaded into proofing strip.");
                }}
                disabled={capturing}
                title="Try booth with studio sample exposures"
              >
                <Sparkles size={15} />
                <span>Demo Roll</span>
              </button>
            )}

            {photos.length > 0 && (
              <button
                type="button"
                className="btn-desk-secondary"
                onClick={() => {
                  playButtonClick();
                  clearPhotos();
                  setLastStageNote("Roll cleared. Ready for a fresh exposure sequence.");
                }}
                disabled={capturing}
              >
                <RotateCcw size={15} />
                <span>Clear Roll</span>
              </button>
            )}

            <button
              type="button"
              className={`btn-desk-shutter ${capturing ? "capturing" : ""}`}
              onClick={handleStartCaptureSequence}
              disabled={capturing}
            >
              <Camera size={18} />
              <span>
                {capturing
                  ? `Exposing ${photos.length + 1} / ${totalPhotosNeeded}`
                  : hasStream
                  ? `Release Shutter (${totalPhotosNeeded})`
                  : "Power On Viewfinder"}
              </span>
            </button>

            {photos.length > 0 && (
              <button
                type="button"
                className={`btn-desk-darkroom ${isComplete ? "ready" : ""}`}
                onClick={() => {
                  playButtonClick();
                  openInEditor({ type: "strip" });
                }}
                disabled={capturing}
              >
                <SlidersHorizontal size={16} />
                <span>Open Photo Editor</span>
              </button>
            )}
          </div>
        </section>

        {/* Right Column: Latest Instant Polaroid Print & Studio Cat Companion */}
        <aside className="booth-col-polaroid" aria-label="Latest instant Polaroid print">
          <div className="desk-telemetry-card">
            <div className="telemetry-top">
              <span className="telemetry-label">STUDIO COMPANION</span>
              <span className={`stage-pill stage-${exposureStage.tone} tabular`}>
                {exposureStage.code} · {exposureStage.label}
              </span>
            </div>

            <div className="booth-cat-row">
              <button
                type="button"
                className={`booth-cat-btn ${isCatPurring ? "purring" : ""}`}
                onClick={handlePetBoothCat}
                title="Click to pet the studio kitty"
              >
                <img src={catImg} alt="Studio cat companion" className="booth-cat-avatar" />
                {isCatPurring && (
                  <>
                    <span className="floating-heart-particle heart-1" aria-hidden="true">
                      <Heart size={14} fill="currentColor" />
                    </span>
                    <span className="floating-heart-particle heart-2" aria-hidden="true">
                      <Heart size={11} fill="currentColor" />
                    </span>
                  </>
                )}
              </button>
              <p className="telemetry-note">{getCompanionLine()}</p>
            </div>

            <div className="telemetry-meta tabular">
              <span>FRAMES: {String(photos.length).padStart(2, "0")}/{String(totalPhotosNeeded).padStart(2, "0")}</span>
              <span>STOCK: ISO 640</span>
            </div>
          </div>

          <div className="instant-polaroid-tray">
            <div className="tray-header">
              <span>LATEST INSTANT PRINT</span>
              <span className="tabular">{todayStamp}</span>
            </div>

            <div className="polaroid-frame-card">
              <span className="polaroid-washi-strip" aria-hidden="true" />
              <div className="polaroid-image-well">
                {currentPreviewPhoto ? (
                  <>
                    <img
                      key={currentPreviewPhoto + previewIdx}
                      src={currentPreviewPhoto}
                      alt={`Inspected Polaroid frame ${previewIdx + 1}`}
                      className="polaroid-latest-img print-develop-enter"
                    />
                    <span className="polaroid-crop-corner top-left" />
                    <span className="polaroid-crop-corner bottom-right" />
                  </>
                ) : (
                  <div className="polaroid-empty-well">
                    <Aperture size={26} strokeWidth={1.5} />
                    <span className="polaroid-empty-code">UNEXPOSED SHEET</span>
                    <p>Your latest snap develops here right after shutter release.</p>
                  </div>
                )}
              </div>

              <div className="polaroid-chin">
                <span className="polaroid-hand-note">
                  {currentPreviewPhoto
                    ? `frame ${String(previewIdx + 1).padStart(2, "0")}A — keeper`
                    : "sweet memories"}
                </span>
                <span className="polaroid-chin-date tabular">
                  {photos.length > 1
                    ? `FRAME ${previewIdx + 1}/${photos.length}`
                    : activeModeConfig.label.toUpperCase()}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="tray-collage-shortcut"
              onClick={() => {
                playButtonClick();
                setMode("grid-4");
              }}
              disabled={capturing}
              title="Switch to 2×2 Collage Mode"
            >
              <img src={polaroidsImg} alt="2x2 Polaroid collage preview" />
              <span>Quick-load 2×2 Collage Cut</span>
            </button>

            <div className="tray-privacy-foot">
              <ShieldCheck size={14} />
              <span>Processed strictly in-browser. Never uploaded.</span>
            </div>
          </div>
        </aside>
      </main>

      <canvas ref={canvasRef} hidden />
    </div>
  );
}
