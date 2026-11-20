import { useCallback, useRef } from "react";
import { useBooth } from "../context/BoothContext";

export default function useAudio() {
  const audioContextRef = useRef(null);
  let soundEnabled = true;
  try {
    const booth = useBooth();
    soundEnabled = booth?.soundEnabled ?? true;
  } catch {
    soundEnabled = true;
  }

  const getAudioContext = useCallback(() => {
    if (!soundEnabled) return null;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, [soundEnabled]);

  // Tactile camera button click
  const playButtonClick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }, [getAudioContext, soundEnabled]);

  // Digicam Zoom chirp
  const playZoomChirp = useCallback((isZoomIn = true) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(isZoomIn ? 750 : 550, ctx.currentTime);
      osc.frequency.setValueAtTime(isZoomIn ? 950 : 450, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  }, [getAudioContext, soundEnabled]);

  // Camera Power On chime
  const playPowerChime = useCallback((turningOn = true) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = turningOn ? [440, 554, 659, 880] : [880, 659, 440];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.13);
      });
    } catch {
      // ignore
    }
  }, [getAudioContext, soundEnabled]);

  // Crisp countdown beep
  const playCountdownBeep = useCallback((isFinal = false) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(isFinal ? 880 : 520, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.35 : 0.18));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isFinal ? 0.36 : 0.2));
    } catch {
      // ignore
    }
  }, [getAudioContext, soundEnabled]);

  // Realistic mechanical shutter click sound
  const playShutterSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(320, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.06);

      setTimeout(() => {
        try {
          if (!soundEnabled) return;
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "square";
          osc2.frequency.setValueAtTime(450, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.06);
          gain2.gain.setValueAtTime(0.18, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.08);
        } catch {
          // ignore
        }
      }, 70);
    } catch {
      // ignore
    }
  }, [getAudioContext, soundEnabled]);

  // Cute Cat Purr / Meow sound effect
  const playCatMeow = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.35);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }, [getAudioContext, soundEnabled]);

  return {
    soundEnabled,
    playButtonClick,
    playZoomChirp,
    playPowerChime,
    playCountdownBeep,
    playShutterSound,
    playCatMeow
  };
}
