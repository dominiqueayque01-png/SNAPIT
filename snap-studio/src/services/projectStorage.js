/**
 * Lightweight localStorage project persistence.
 * Stores metadata, transforms, text, styles, and layer order in localStorage,
 * while large binary image blobs are stored in IndexedDB via assetDb.
 */

import { saveAssetRecord, getAssetRecord, dataUrlToBlob } from "./assetDb";

const PROJECT_KEY = "snap_studio_editor_project_v1";

export function hasSavedProject() {
  try {
    return !!localStorage.getItem(PROJECT_KEY);
  } catch {
    return false;
  }
}

export function getSavedProjectMeta() {
  try {
    const raw = localStorage.getItem(PROJECT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      savedAt: parsed.savedAt,
      objectCount: parsed.objects?.length || 0,
      docWidth: parsed.docWidth,
      docHeight: parsed.docHeight,
      title: parsed.title || "Saved Studio Project"
    };
  } catch {
    return null;
  }
}

export async function saveEditorProject(projectState) {
  let backgroundAssetId = projectState.backgroundAssetId || null;

  // Persist background photograph blob in IndexedDB so localStorage stays tiny
  if (projectState.backgroundSrc) {
    try {
      const blob = await dataUrlToBlob(projectState.backgroundSrc);
      const saved = await saveAssetRecord({
        id: backgroundAssetId || "project_active_bg",
        kind: "project-bg",
        name: "Project Background",
        mimeType: blob.type || "image/png",
        width: projectState.docWidth,
        height: projectState.docHeight,
        blob
      });
      backgroundAssetId = saved.id;
    } catch (err) {
      console.warn("Could not store background in IndexedDB:", err);
    }
  }

  // Persist individual multi-slot Polaroid photos in IndexedDB
  const serializableSlots = await Promise.all(
    (projectState.stripSlots || []).map(async (slot, idx) => {
      let slotAssetId = slot.assetId || null;
      if (slot.src) {
        try {
          const blob = await dataUrlToBlob(slot.src);
          const saved = await saveAssetRecord({
            id: slotAssetId || `project_slot_${idx}`,
            kind: "project-bg",
            name: `Strip Slot ${slot.label || idx + 1}`,
            mimeType: blob.type || "image/png",
            width: slot.width,
            height: slot.height,
            blob
          });
          slotAssetId = saved.id;
        } catch (err) {
          console.warn("Could not store slot photo in IndexedDB:", err);
        }
      }
      const serializableSlotObjects = (slot.objects || []).map((obj) => {
        const objCopy = { ...obj };
        if (objCopy.assetId) {
          delete objCopy.src;
        }
        return objCopy;
      });
      const copy = {
        ...slot,
        assetId: slotAssetId,
        objects: serializableSlotObjects
      };
      delete copy.src;
      return copy;
    })
  );

  // Strip transient object URLs from objects; retain assetId or stickerId references
  const serializableObjects = (projectState.objects || []).map((obj) => {
    const copy = { ...obj };
    if (copy.assetId) {
      delete copy.src;
    }
    return copy;
  });

  const payload = {
    version: 1,
    savedAt: new Date().toISOString(),
    title: projectState.title || "SNAP! Studio Composition",
    docWidth: projectState.docWidth,
    docHeight: projectState.docHeight,
    backgroundAssetId,
    backgroundLabel: projectState.backgroundLabel || "Captured Photo",
    backgroundVisible: projectState.backgroundVisible !== false,
    backgroundColor: projectState.backgroundColor || "#fdfbf7",
    transparentBg: !!projectState.transparentBg,
    photoFilterId: projectState.photoFilterId || "normal",
    frameId: projectState.frameId || "none",
    frameColor: projectState.frameColor || "#fdfbf7",
    frameCaption: projectState.frameCaption || "",
    overlayIds: projectState.overlayIds || [],
    overlayOpacity: projectState.overlayOpacity ?? 0.55,
    stripLayout: projectState.stripLayout || null,
    stripSlots: serializableSlots,
    objects: serializableObjects
  };

  try {
    localStorage.setItem(PROJECT_KEY, JSON.stringify(payload));
  } catch {
    throw new Error(
      "Local storage is full. Try clearing old gallery items before saving."
    );
  }

  return payload;
}

export async function loadEditorProject() {
  let raw;
  try {
    raw = localStorage.getItem(PROJECT_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  const createdUrls = [];

  let backgroundSrc = null;
  if (parsed.backgroundAssetId) {
    const rec = await getAssetRecord(parsed.backgroundAssetId);
    if (rec?.blob) {
      backgroundSrc = URL.createObjectURL(rec.blob);
      createdUrls.push(backgroundSrc);
    }
  }

  const hydratedObjects = await Promise.all(
    (parsed.objects || []).map(async (obj) => {
      if (obj.assetId) {
        const rec = await getAssetRecord(obj.assetId);
        if (rec?.blob) {
          const url = URL.createObjectURL(rec.blob);
          createdUrls.push(url);
          return { ...obj, src: url };
        }
      }
      return obj;
    })
  );

  const hydratedSlots = await Promise.all(
    (parsed.stripSlots || []).map(async (slot) => {
      let nextSlot = { ...slot };
      if (slot.assetId) {
        const rec = await getAssetRecord(slot.assetId);
        if (rec?.blob) {
          const url = URL.createObjectURL(rec.blob);
          createdUrls.push(url);
          nextSlot.src = url;
        }
      }
      if (Array.isArray(slot.objects)) {
        nextSlot.objects = await Promise.all(
          slot.objects.map(async (obj) => {
            if (obj.assetId) {
              const rec = await getAssetRecord(obj.assetId);
              if (rec?.blob) {
                const url = URL.createObjectURL(rec.blob);
                createdUrls.push(url);
                return { ...obj, src: url };
              }
            }
            return obj;
          })
        );
      } else {
        nextSlot.objects = [];
      }
      return nextSlot;
    })
  );

  return {
    project: {
      ...parsed,
      backgroundSrc,
      stripSlots: hydratedSlots,
      objects: hydratedObjects
    },
    createdUrls
  };
}

export function clearSavedProject() {
  try {
    localStorage.removeItem(PROJECT_KEY);
  } catch {
    // ignore
  }
}
