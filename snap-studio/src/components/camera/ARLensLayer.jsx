import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { getFaceLandmarker } from "../../services/faceMeshTracker";
import { drawFaceLens } from "../../services/arLensDrawer";

const ARLensLayer = forwardRef(function ARLensLayer(
  { videoRef, activeLens, hasStream, zoomLevel = 1 },
  ref
) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const lastLandmarksRef = useRef(null);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    let isMounted = true;
    if (activeLens === "none") return;

    if (!modelReady && !modelLoading) {
      setModelLoading(true);
      getFaceLandmarker()
        .then(() => {
          if (isMounted) {
            setModelReady(true);
            setModelLoading(false);
          }
        })
        .catch(err => {
          console.warn("FaceLandmarker load error:", err);
          if (isMounted) setModelLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeLens, modelReady, modelLoading]);

  // Real-time Detection & Drawing Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !hasStream || activeLens === "none") {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    let isRunning = true;

    const renderLoop = async () => {
      if (!isRunning) return;

      if (video.readyState >= 2 && video.videoWidth > 0) {
        // Sync canvas resolution with display
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
          const landmarker = await getFaceLandmarker();
          if (landmarker && video.currentTime > 0) {
            const results = landmarker.detectForVideo(video, performance.now());
            if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
              lastLandmarksRef.current = results.faceLandmarks[0];
              // Draw AR Lens for each detected face
              results.faceLandmarks.forEach(faceLandmarks => {
                drawFaceLens(ctx, faceLandmarks, activeLens, canvas.width, canvas.height, true);
              });
            } else {
              lastLandmarksRef.current = null;
            }
          }
        } catch {
          // Frame skip if detector busy
        }
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [hasStream, activeLens, videoRef, modelReady]);

  // Allow parent (Booth.jsx) to draw the current AR overlay into the snapshot canvas
  useImperativeHandle(ref, () => ({
    drawCurrentLensToCanvas: (targetCtx, targetWidth, targetHeight) => {
      if (activeLens === "none" || !lastLandmarksRef.current) return;
      // In capture photo: the video frame is drawn with translate(width,0) scale(-1,1),
      // so we draw AR lens matching that mirrored coordinate space!
      drawFaceLens(
        targetCtx,
        lastLandmarksRef.current,
        activeLens,
        targetWidth,
        targetHeight,
        false // already in mirrored canvas space
      );
    },
    getActiveLens: () => activeLens
  }));

  if (activeLens === "none") return null;

  return (
    <div className="ar-lens-overlay-wrapper">
      <canvas
        ref={canvasRef}
        className="ar-lens-canvas"
        style={{ transform: `scale(${zoomLevel})` }}
      />
      {modelLoading && (
        <div className="ar-model-badge">
          <span className="ar-sparkle-spin">✨</span>
          <span>Loading AR Face Lens...</span>
        </div>
      )}
    </div>
  );
});

export default ARLensLayer;
