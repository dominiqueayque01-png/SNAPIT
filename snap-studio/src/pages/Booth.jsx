import { useState, useRef } from "react";
import { Camera, Wand2, RotateCcw, Heart } from "lucide-react";
import useCamera from "../hooks/useCamera";
import useAudio from "../hooks/useAudio";
import { useBooth } from "../context/BoothContext";
import CameraFeed from "../components/camera/CameraFeed";
import StripPreview from "../components/booth/StripPreview";

// Custom Assets (Cleaned up: 4.png and 5.png removed!)
import deskBg from "../assets/1.png";
import catImg from "../assets/2.png";
import polaroidsImg from "../assets/3.png";

export default function Booth() {
  const { videoRef, error, startCamera } = useCamera();
  const { playCountdownBeep, playShutterSound, playCatMeow, playButtonClick } = useAudio();
  const canvasRef = useRef(null);

  const {
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
    setCurrentView
  } = useBooth();

  const [isCatPurring, setIsCatPurring] = useState(false);
  const totalPhotosNeeded = activeModeConfig.count;
  const hasStream = !!videoRef.current?.srcObject;

  // Cat mascot speech message based on current state
  const getCatMessage = () => {
    if (isCatPurring) return "Purrrrrr~ ♡ You're the cutest!";
    if (capturing) return "3, 2, 1... Hold that pose! 📸";
    if (photos.length >= totalPhotosNeeded) return "Yay! Perfect snaps! Click Decorate to add stickers & frames! ✿";
    if (photos.length > 0) return `Looking great! ${photos.length}/${totalPhotosNeeded} shots taken! ✨`;
    if (hasStream) return "Camera is live! Strike a pose and click Take Photos! ♡";
    return "Hi there! Click the camera screen or shutter button to power on! ✿";
  };

  const handleCatClick = () => {
    playCatMeow();
    setIsCatPurring(true);
    setTimeout(() => setIsCatPurring(false), 1800);
  };

  const captureSingleFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !video.videoWidth) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Mirror selfie camera
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png");
  };

  const handleStartCaptureSequence = async () => {
    if (!videoRef.current?.videoWidth) {
      await startCamera();
      return;
    }

    setCapturing(true);
    setPhotos([]);

    for (let i = 0; i < totalPhotosNeeded; i++) {
      // 3-2-1 countdown
      for (let c = 3; c > 0; c--) {
        setCountdown(c);
        playCountdownBeep(false);
        await new Promise(r => setTimeout(r, 1000));
      }

      // "SMILE!"
      setCountdown("SMILE! 📸");
      playCountdownBeep(true);
      await new Promise(r => setTimeout(r, 400));

      // Shutter click + screen flash
      playShutterSound();
      triggerFlash();

      const shot = captureSingleFrame();
      if (shot) {
        addPhoto(shot);
      }

      setCountdown(null);

      // Brief pause between multiple shots
      if (i < totalPhotosNeeded - 1) {
        await new Promise(r => setTimeout(r, 1200));
      }
    }

    setCapturing(false);
  };

  const handleDownloadSingle = (photoUrl, idx) => {
    const a = document.createElement("a");
    a.href = photoUrl;
    a.download = `snap-studio-pose-${idx + 1}.png`;
    a.click();
  };

  return (
    <div
      className="scrapbook-desk-viewport"
      style={{ backgroundImage: `url(${deskBg})` }}
    >
      {/* Top Header Scrapbook Banner */}
      <header className="scrapbook-top-bar">
        <div className="washi-tape-header" />
        <div className="scrapbook-title-cluster">
          <span className="handwritten-tag">✦ vintage virtual photobooth ✦</span>
          <h1 className="scrapbook-title">SNAP! STUDIO</h1>
        </div>

        {/* Quick Mode Selector Tabs */}
        <div className="mode-pills-bar">
          {[
            { id: "single", label: "Single Snap (1)" },
            { id: "strip-3", label: "Classic 3-Cut (3)" },
            { id: "strip-4", label: "Studio 4-Strip (4)" },
            { id: "grid-4", label: "2x2 Collage (4)" }
          ].map(m => (
            <button
              key={m.id}
              className={`mode-pill-item ${mode === m.id ? "active" : ""}`}
              onClick={() => {
                playButtonClick();
                setMode(m.id);
              }}
              disabled={capturing}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Studio Scrapbook Stage: Left Strip, Center Big Digicam, Right Mascot & Memories */}
      <main className="scrapbook-hero-stage">
        {/* Left Column: Tilted Photo Strip & Vintage Letter Paper */}
        <section className="stage-left-strip">
          <StripPreview
            photos={photos}
            mode={mode}
            totalSlots={totalPhotosNeeded}
            onOpenEditor={() => setCurrentView("editor")}
            onRetake={clearPhotos}
            onDownloadSingle={handleDownloadSingle}
          />
        </section>

        {/* Center Column: Hero Vintage Digital Camera */}
        <section className="stage-center-camera">
          <CameraFeed
            videoRef={videoRef}
            hasStream={hasStream}
            onStartCamera={startCamera}
            onCapture={handleStartCaptureSequence}
            capturing={capturing}
            error={error}
            countdown={countdown}
            isFlashActive={isFlashActive}
            currentCount={photos.length}
            totalPhotos={totalPhotosNeeded}
            mode={mode}
            onSelectMode={setMode}
          />

          {/* Tactile Control Buttons Under Camera */}
          <div className="camera-tactile-bar">
            {photos.length > 0 && (
              <button
                className="btn-scrapbook-retake"
                onClick={() => {
                  playButtonClick();
                  clearPhotos();
                }}
                disabled={capturing}
                title="Restart Session"
              >
                <RotateCcw size={16} />
                <span>Retake</span>
              </button>
            )}

            <button
              className={`btn-scrapbook-shutter-hero ${capturing ? "capturing" : ""}`}
              onClick={handleStartCaptureSequence}
              disabled={capturing}
            >
              <div className="shutter-inner-glow">
                <Camera size={26} />
              </div>
              <span className="shutter-hero-text">
                {capturing
                  ? `SNAPPING ${photos.length}/${totalPhotosNeeded}...`
                  : hasStream
                  ? "TAKE PHOTOS ✦"
                  : "POWER ON & SHOOT"}
              </span>
            </button>

            {photos.length > 0 && (
              <button
                className="btn-scrapbook-decorate-hero"
                onClick={() => {
                  playButtonClick();
                  setCurrentView("editor");
                }}
                disabled={capturing}
              >
                <Wand2 size={20} />
                <span>Decorate Strip ✿</span>
              </button>
            )}
          </div>
        </section>

        {/* Right Column: Cat Mascot (2.png) + Polaroid Memories Preview */}
        <section className="stage-right-companion">
          {/* Polaroid Memory Card */}
          <div className="polaroid-stamp-preview-box">
            <div className="pink-stamp-card">
              <div className="stamp-photo-area">
                {photos.length > 0 ? (
                  <img
                    src={photos[photos.length - 1]}
                    alt="Latest Memory"
                    className="stamp-img-preview"
                  />
                ) : (
                  <div className="stamp-empty-art">
                    <Heart size={28} className="heart-icon-pink" />
                    <p>your little moment</p>
                  </div>
                )}
                <div className="stamp-polaroid-label">
                  <span>sweet memories ♡</span>
                </div>
              </div>
            </div>

            {/* Overlapping Heart Polaroids (3.png) */}
            <div
              className="polaroids-heart-stack"
              title="Click for 2x2 Collage Mode"
              onClick={() => {
                playButtonClick();
                setMode("grid-4");
              }}
            >
              <img src={polaroidsImg} alt="4 Heart Polaroids Stack" />
            </div>
          </div>

          {/* Interactive Cat Mascot (2.png) */}
          <div className="cat-mascot-section">
            <div className="cat-dialog-balloon speech-bubble-float">
              <p>{getCatMessage()}</p>
              <div className="balloon-arrow" />
            </div>

            <div
              className={`cat-avatar-interactive ${isCatPurring ? "cat-purr-active" : "cat-idle-anim"}`}
              onClick={handleCatClick}
              title="Click kitty to pet! Meow~"
            >
              <img src={catImg} alt="Studio Cat Companion" className="cat-companion-img" />
              {isCatPurring && <span className="cat-love-emoji">💖</span>}
            </div>
          </div>
        </section>
      </main>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} hidden />
    </div>
  );
}
