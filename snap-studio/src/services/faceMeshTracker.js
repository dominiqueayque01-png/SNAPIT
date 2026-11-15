import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let landmarkerInstance = null;
let isInitializing = false;
let initPromise = null;

/**
 * Initializes and returns the MediaPipe FaceLandmarker singleton.
 */
export async function getFaceLandmarker() {
  if (landmarkerInstance) return landmarkerInstance;
  if (initPromise) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      landmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: false,
        runningMode: "VIDEO",
        numFaces: 2
      });

      isInitializing = false;
      return landmarkerInstance;
    } catch (err) {
      console.warn("FaceLandmarker GPU init error, falling back to CPU:", err);
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        landmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU"
          },
          outputFaceBlendshapes: false,
          runningMode: "VIDEO",
          numFaces: 1
        });
        isInitializing = false;
        return landmarkerInstance;
      } catch (fallbackErr) {
        console.error("Failed to initialize FaceLandmarker:", fallbackErr);
        isInitializing = false;
        initPromise = null;
        throw fallbackErr;
      }
    }
  })();

  return initPromise;
}

export function isFaceLandmarkerReady() {
  return !!landmarkerInstance;
}
