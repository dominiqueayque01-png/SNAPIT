import { useEffect, useState } from "react";

/**
 * Loads an image URL (data URL, blob URL, or static asset) into an HTMLImageElement
 * for React Konva rendering with clean loading/error state and cancellation.
 */
export default function useKonvaImage(src) {
  const [loaded, setLoaded] = useState({ src: null, image: null, status: "idle" });

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const img = new window.Image();

    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      if (!cancelled) {
        setLoaded({ src, image: img, status: "loaded" });
      }
    };

    img.onerror = () => {
      if (!cancelled) {
        setLoaded({ src, image: null, status: "failed" });
      }
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src) {
    return { image: null, status: "idle" };
  }

  if (loaded.src !== src) {
    return { image: null, status: "loading" };
  }

  return { image: loaded.image, status: loaded.status };
}
