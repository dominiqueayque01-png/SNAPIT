import { useState } from "react";
import {
  Camera,
  ArrowRight,
  ArrowUp,
  ShieldCheck,
  Images,
  Printer,
  SlidersHorizontal,
  Heart,
  Volume2,
  VolumeX,
  Sparkles
} from "lucide-react";
import { useBooth } from "../context/BoothContext";
import useAudio from "../hooks/useAudio";
import { BOOTH_MODES } from "../constants/modes";
import { FRAMES } from "../constants/frames";
import { FILTERS } from "../constants/filters";
import { getSavedStrips } from "../services/storage";

import catImg from "../assets/2.png";
import sample1 from "../assets/samples/sample-1.jpg";
import sample2 from "../assets/samples/sample-2.jpg";
import sample3 from "../assets/samples/sample-3.jpg";
import sample4 from "../assets/samples/sample-4.jpg";

const SAMPLE_PHOTOS = [
  { src: sample1, alt: "Candid 35mm portrait by sunlit cafe window" },
  { src: sample2, alt: "Two friends smiling on a golden-hour balcony" },
  { src: sample3, alt: "Morning coffee, linen notebook, and dried wildflowers on wooden desk" },
  { src: sample4, alt: "Late afternoon portrait on a tree-lined street" }
];

const CUT_META = {
  single: { code: "01A", short: "Single", ratio: "1 : 1 Instant Sheet", spec: "1 exposure · Wide Polaroid chin" },
  "strip-3": { code: "03A", short: "3-Cut", ratio: "2 : 6 Vertical Strip", spec: "3 exposures · Classic pocket strip" },
  "strip-4": { code: "04A", short: "4-Strip", ratio: "2 : 7 Studio Strip", spec: "4 exposures · Iconic 4-frame sequence" },
  "grid-4": { code: "04B", short: "2×2 Grid", ratio: "4 : 5 Contact Sheet", spec: "4 exposures · Balanced square proof" }
};

function FormatSchematic({ modeId }) {
  if (modeId === "single") {
    return (
      <div className="schematic-frame schematic-single" aria-hidden="true">
        <span className="schematic-cell" />
      </div>
    );
  }
  if (modeId === "strip-3") {
    return (
      <div className="schematic-frame schematic-strip-3" aria-hidden="true">
        <span className="schematic-cell" />
        <span className="schematic-cell" />
        <span className="schematic-cell" />
      </div>
    );
  }
  if (modeId === "grid-4") {
    return (
      <div className="schematic-frame schematic-grid-4" aria-hidden="true">
        <span className="schematic-cell" />
        <span className="schematic-cell" />
        <span className="schematic-cell" />
        <span className="schematic-cell" />
      </div>
    );
  }
  return (
    <div className="schematic-frame schematic-strip-4" aria-hidden="true">
      <span className="schematic-cell" />
      <span className="schematic-cell" />
      <span className="schematic-cell" />
      <span className="schematic-cell" />
    </div>
  );
}

export default function Landing() {
  const { mode, setMode, setCurrentView, setSelectedFilter, soundEnabled, toggleSound, loadSampleRoll } = useBooth();
  const { playButtonClick, playCatMeow } = useAudio();

  const [previewFrameId, setPreviewFrameId] = useState("pastel-pink");
  const [labFilterId, setLabFilterId] = useState("vintage");
  const [isCatPet, setIsCatPet] = useState(false);
  const [savedList] = useState(() => getSavedStrips());

  const handlePetCat = () => {
    playCatMeow();
    setIsCatPet(true);
    setTimeout(() => setIsCatPet(false), 1600);
  };

  const activeFrame =
    FRAMES.find((f) => f.id === previewFrameId) || FRAMES[0];
  const activeLabFilter =
    FILTERS.find((f) => f.id === labFilterId) || FILTERS[0];
  const currentModeConfig =
    BOOTH_MODES.find((m) => m.id === mode) || BOOTH_MODES[2];

  const slotCount = currentModeConfig.count;
  const isGrid = mode === "grid-4";
  const todayStamp = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

  const handleLaunchBooth = (chosenMode) => {
    playButtonClick();
    if (chosenMode) {
      setMode(chosenMode);
    }
    setCurrentView("booth");
  };

  const handleTryFilterInBooth = () => {
    playButtonClick();
    setSelectedFilter(activeLabFilter);
    setCurrentView("booth");
  };

  return (
    <div className="folio-page">
      {/* Top Archival Navigation Rail */}
      <header className="folio-header">
        <a
          href="#top"
          className="folio-brand"
          onClick={(e) => {
            e.preventDefault();
            playButtonClick();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span className="folio-brand-wordmark">SNAP! STUDIO</span>
          <span className="folio-brand-tag tabular">NO. 04 · LOCAL</span>
        </a>

        <nav className="folio-nav" aria-label="Primary sections">
          <a href="#formats" className="folio-nav-link">
            Formats
          </a>
          <a href="#darkroom" className="folio-nav-link">
            Darkroom
          </a>
          <a href="#album" className="folio-nav-link">
            Album
            {savedList.length > 0 && (
              <span className="folio-nav-count tabular">{savedList.length}</span>
            )}
          </a>
        </nav>

        <div className="folio-header-actions">
          <button
            type="button"
            className={`folio-sound-btn ${!soundEnabled ? "is-muted" : ""}`}
            onClick={() => {
              toggleSound();
              if (!soundEnabled) playButtonClick();
            }}
            title={soundEnabled ? "Mute studio audio" : "Unmute studio audio"}
            aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>

          <button
            type="button"
            className="folio-header-cta"
            onClick={() => handleLaunchBooth(mode)}
          >
            <span>Enter Booth</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* First Viewport: Asymmetric Silver-Halide Proofing Spread */}
      <section id="top" className="folio-hero">
        <div className="folio-hero-left">
          <div className="hero-editorial-body">
            <h1 className="folio-display-title">
              Expose.
              <br />
              Develop.
              <br />
              <span className="title-accent">Keep the print.</span>
            </h1>

            <p className="folio-lead">
              A private, browser-based vintage Polaroid and 4-cut photobooth.
              Shoot through a tactile analog viewfinder, tone with 8 film
              stocks, and export print-ready keepsakes directly on your
              device—zero accounts, zero server uploads.
            </p>

            {/* Live Working Film Cut Selector */}
            <div className="hero-cut-block">
              <div className="hero-cut-header">
                <span>SELECT FILM FORMAT</span>
                <span className="tabular">LIVE PROOF MAT</span>
              </div>
              <div className="hero-cut-grid" role="group" aria-label="Choose photobooth cut">
                {BOOTH_MODES.map((m) => {
                  const meta = CUT_META[m.id] || { code: "04A", short: m.label };
                  const isActive = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`hero-cut-btn ${isActive ? "active" : ""}`}
                      onClick={() => {
                        playButtonClick();
                        setMode(m.id);
                      }}
                    >
                      <span className="hero-cut-code tabular">{meta.code}</span>
                      <span className="hero-cut-name">{meta.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hero-actions-row">
              <button
                type="button"
                className="btn-folio-primary"
                onClick={() => handleLaunchBooth(mode)}
              >
                <Camera size={17} />
                <span>Open Camera Booth</span>
              </button>

              <button
                type="button"
                className="btn-folio-ghost"
                onClick={() => {
                  playButtonClick();
                  setCurrentView("gallery");
                }}
              >
                <Images size={16} />
                <span className="tabular">Saved Album ({savedList.length})</span>
              </button>

              <button
                type="button"
                className="btn-folio-demo"
                onClick={() => {
                  playButtonClick();
                  loadSampleRoll(mode);
                  setCurrentView("editor");
                }}
                title="Preview darkroom directly with sample photos"
              >
                <Sparkles size={15} />
                <span>Try Demo Roll</span>
              </button>
            </div>
          </div>

          <div className="hero-spec-foot">
            <span className="spec-item">
              <ShieldCheck size={14} />
              <span>Zero Cloud Uploads</span>
            </span>
            <span className="spec-item">
              <SlidersHorizontal size={14} />
              <span>4 Print Cuts · 8 Film Stocks</span>
            </span>
            <span className="spec-item">
              <Printer size={14} />
              <span>High-Res PNG Export</span>
            </span>
          </div>
        </div>

        {/* Right Darkroom Slate Contact Mat */}
        <div className="folio-hero-right" aria-label="Interactive Polaroid proof mat">
          <div className="mat-top-meta tabular">
            <span>CONTACT SHEET // PROOF {CUT_META[mode]?.code || "04A"}</span>
            <span>ISO 640 · INSTANT</span>
          </div>

          <div className="contact-mat-stage">
            {/* Live Interactive Photo Strip with Blush Washi Tape */}
            <div
              className={`mat-strip-print ${isGrid ? "is-grid" : "is-strip"} ${
                slotCount === 1 ? "is-single" : ""
              }`}
              style={{
                backgroundColor: activeFrame.bg,
                color: activeFrame.textColor,
                borderColor: activeFrame.borderColor
              }}
            >
              <span className="mat-washi-tape" aria-hidden="true" />
              <div className="mat-strip-stamp tabular">
                <span>SNAP! STUDIO</span>
                <span>{todayStamp}</span>
              </div>

              <div className={`mat-strip-slots ${isGrid ? "grid-2x2" : "col-stack"}`}>
                {Array.from({ length: slotCount }).map((_, idx) => {
                  const photo = SAMPLE_PHOTOS[idx % SAMPLE_PHOTOS.length];
                  return (
                    <div key={idx} className="mat-slot-frame">
                      <img src={photo.src} alt={photo.alt} />
                      <span className="mat-slot-idx tabular">
                        {String(idx + 1).padStart(2, "0")}A
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mat-strip-chin">
                <span className="mat-chin-note">sweet sunday roll</span>
              </div>
            </div>

            {/* Companion Single Polaroid + Studio Cat Mascot */}
            <div className="mat-companion-column">
              <div
                className="mat-polaroid-companion"
                style={{
                  backgroundColor: activeFrame.bg,
                  color: activeFrame.textColor,
                  borderColor: activeFrame.borderColor
                }}
              >
                <div className="mat-polaroid-well">
                  <img src={SAMPLE_PHOTOS[3].src} alt={SAMPLE_PHOTOS[3].alt} />
                  <span className="mat-crop-box" aria-hidden="true" />
                </div>
                <div className="mat-polaroid-chin">
                  <span className="mat-polaroid-hand">frame 04 — keeper</span>
                </div>
              </div>

              <button
                type="button"
                className={`mat-cat-companion ${isCatPet ? "purring" : ""}`}
                onClick={handlePetCat}
                title="Click to pet the studio kitty"
              >
                <img src={catImg} alt="Studio cat companion" className="mat-cat-img" />
                {isCatPet && (
                  <>
                    <span className="floating-heart-particle heart-1" aria-hidden="true">
                      <Heart size={14} fill="currentColor" />
                    </span>
                    <span className="floating-heart-particle heart-2" aria-hidden="true">
                      <Heart size={11} fill="currentColor" />
                    </span>
                  </>
                )}
                <span className="mat-cat-note">
                  {isCatPet ? (
                    <>
                      <Heart size={12} fill="currentColor" />
                      <span>Purrrr~ ready to snap!</span>
                    </>
                  ) : (
                    <span>Pet kitty or enter booth</span>
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="mat-bottom-bar">
            <span className="mat-stock-label">
              STOCK: {activeFrame.name.toUpperCase()}
            </span>
            <div className="mat-swatch-list" role="group" aria-label="Preview paper stock">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`mat-swatch-btn ${previewFrameId === f.id ? "active" : ""}`}
                  style={{ backgroundColor: f.bg }}
                  onClick={() => {
                    playButtonClick();
                    setPreviewFrameId(f.id);
                  }}
                  title={f.name}
                  aria-label={`Preview ${f.name} paper stock`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Film Format Specification Ledger (#formats) */}
      <section id="formats" className="folio-formats-section">
        <div className="folio-section-inner">
          <div className="formats-head-row">
            <h2 className="folio-section-title">Four analog print cuts</h2>
            <p className="folio-section-lead">
              Choose a single square instant sheet, a classic pocket strip, or a
              2×2 contact grid. Every cut opens straight onto the Booth desk.
            </p>
          </div>

          <div className="formats-ledger">
            {BOOTH_MODES.map((m) => {
              const meta = CUT_META[m.id] || {
                code: "04A",
                ratio: "Standard",
                spec: m.description
              };
              const isSelected = mode === m.id;
              return (
                <div
                  key={m.id}
                  className={`format-ledger-row ${isSelected ? "selected" : ""}`}
                >
                  <div className="ledger-code tabular">{meta.code}</div>

                  <div className="ledger-schematic">
                    <FormatSchematic modeId={m.id} />
                  </div>

                  <div className="ledger-title-col">
                    <h3>{m.label}</h3>
                    <span className="ledger-ratio tabular">{meta.ratio}</span>
                  </div>

                  <p className="ledger-desc">{meta.spec}</p>

                  <div className="ledger-action">
                    <button
                      type="button"
                      className="btn-ledger-load"
                      onClick={() => handleLaunchBooth(m.id)}
                    >
                      <span>Load Cut</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 3: Darkroom Film Stock Lab & 3-Stage Ritual (#darkroom) */}
      <section id="darkroom" className="folio-darkroom-section">
        <div className="folio-section-inner darkroom-grid">
          {/* Interactive Film Stock Proofing Bench */}
          <div className="darkroom-lab-col">
            <h2 className="folio-section-title on-dark">
              Test all eight film stocks before you shoot
            </h2>
            <p className="darkroom-lead">
              Toggle between silver-halide monochrome, warm Kodachrome tones,
              and high-contrast noir. Every grade renders locally on HTML5
              Canvas at export resolution.
            </p>

            <div className="darkroom-proof-stage">
              <div className="lab-polaroid-card">
                <div className="lab-polaroid-img-wrap">
                  <img
                    src={SAMPLE_PHOTOS[0].src}
                    alt={`Live film stock preview: ${activeLabFilter.name}`}
                    style={{ filter: activeLabFilter.css }}
                  />
                </div>
                <div className="lab-polaroid-footer">
                  <span className="lab-hand-caption">
                    {activeLabFilter.name.toLowerCase()}
                  </span>
                  <span className="lab-stock-code tabular">ISO 640</span>
                </div>
              </div>

              <div className="lab-filter-list">
                {FILTERS.map((f, idx) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`lab-filter-btn ${labFilterId === f.id ? "active" : ""}`}
                    onClick={() => {
                      playButtonClick();
                      setLabFilterId(f.id);
                    }}
                  >
                    <span className="lab-filter-idx tabular">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span>{f.name}</span>
                  </button>
                ))}

                <button
                  type="button"
                  className="btn-lab-launch"
                  onClick={handleTryFilterInBooth}
                >
                  <span>Shoot with {activeLabFilter.name}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* 3-Stage Analog Workflow */}
          <div className="darkroom-ritual-col">
            <div className="ritual-header tabular">STUDIO WORKFLOW</div>

            <div className="ritual-step">
              <div className="ritual-num tabular">01</div>
              <div className="ritual-body">
                <h3>Frame &amp; Expose</h3>
                <p>
                  Power on your local webcam inside the 3-column Booth desk. Use
                  the optical zoom rocker, flash toggle, and 3-2-1 mechanical
                  countdown while your strip develops frame by frame on the left.
                </p>
              </div>
            </div>

            <div className="ritual-step">
              <div className="ritual-num tabular">02</div>
              <div className="ritual-body">
                <h3>Tone &amp; Inscribe</h3>
                <p>
                  Move to the Darkroom to switch paper stocks, apply any of the
                  8 film grades, stamp draggable markers, and write a personal
                  handwritten note along the Polaroid chin.
                </p>
              </div>
            </div>

            <div className="ritual-step">
              <div className="ritual-num tabular">03</div>
              <div className="ritual-body">
                <h3>Print &amp; Keep Locally</h3>
                <p>
                  Download a crisp high-resolution PNG strip ready for printing
                  or journaling, and archive favorites in your browser&apos;s
                  private local album with zero external servers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Local Keepsake Archive (#album) */}
      <section id="album" className="folio-album-section">
        <div className="folio-section-inner">
          <div className="album-head-row">
            <div>
              <h2 className="folio-section-title">Your local keepsake album</h2>
              <p className="folio-section-lead">
                Every strip saved in this browser stays strictly on your own
                machine.
              </p>
            </div>
            <button
              type="button"
              className="btn-folio-ghost"
              onClick={() => {
                playButtonClick();
                setCurrentView("gallery");
              }}
            >
              <span>Open Full Archive</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {savedList.length > 0 ? (
            <div className="album-proof-rail">
              {savedList.slice(0, 6).map((strip, i) => (
                <button
                  key={strip.id}
                  type="button"
                  className="album-mini-proof"
                  onClick={() => {
                    playButtonClick();
                    setCurrentView("gallery");
                  }}
                >
                  <span className="album-mini-idx tabular">
                    PRINT {String(savedList.length - i).padStart(2, "0")}
                  </span>
                  <div className="album-mini-mat">
                    <img src={strip.imageUrl} alt="Saved Polaroid strip" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="album-empty-sleeve">
              <div className="sleeve-left">
                <h3>No developed strips archived yet</h3>
                <p>
                  Step into the camera booth, expose your first roll, and save
                  it from the Darkroom export dialog to start your private
                  keepsake collection.
                </p>
              </div>
              <button
                type="button"
                className="btn-folio-primary"
                onClick={() => handleLaunchBooth("strip-4")}
              >
                <Camera size={17} />
                <span>Shoot Your First Roll</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Archival Colophon Footer */}
      <footer className="folio-footer">
        <div className="folio-footer-inner">
          <div className="footer-colophon">
            <span className="footer-brand">SNAP! STUDIO</span>
            <span className="footer-note">
              Private local-first vintage Polaroid photobooth · Zero server
              uploads
            </span>
          </div>

          <div className="footer-links">
            <button
              type="button"
              className="footer-btn"
              onClick={() => handleLaunchBooth(mode)}
            >
              Open Booth
            </button>
            <button
              type="button"
              className="footer-btn"
              onClick={() => {
                playButtonClick();
                setCurrentView("gallery");
              }}
            >
              Local Album
            </button>
            <button
              type="button"
              className="footer-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <span>Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
