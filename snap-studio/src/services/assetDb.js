/**
 * Lightweight IndexedDB binary asset store for uploaded PNG/SVG/JPG/WebP assets
 * and saved editor project source photos (keeps localStorage lightweight).
 */

const DB_NAME = "snap_studio_editor_db";
const DB_VERSION = 1;
const STORE_ASSETS = "assets";

let dbPromise = null;

function openDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not supported in this browser."));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_ASSETS)) {
        const store = db.createObjectStore(STORE_ASSETS, { keyPath: "id" });
        store.createIndex("kind", "kind", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error || new Error("Failed to open local asset database."));
    };
  });

  return dbPromise;
}

export async function saveAssetRecord({
  id,
  kind = "upload", // "upload" | "project-bg"
  name,
  mimeType,
  isSvg = false,
  width,
  height,
  blob
}) {
  const db = await openDb();
  const record = {
    id: id || `asset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    kind,
    name: name || "Asset",
    mimeType: mimeType || blob?.type || "image/png",
    isSvg,
    width: width || 400,
    height: height || 400,
    blob,
    createdAt: Date.now()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ASSETS, "readwrite");
    tx.objectStore(STORE_ASSETS).put(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error || new Error("Failed to save asset."));
  });
}

export async function getAssetRecord(id) {
  if (!id) return null;
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, "readonly");
      const req = tx.objectStore(STORE_ASSETS).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function listUploadedAssets() {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, "readonly");
      const index = tx.objectStore(STORE_ASSETS).index("kind");
      const req = index.getAll("upload");
      req.onsuccess = () => {
        const items = (req.result || []).sort((a, b) => b.createdAt - a.createdAt);
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function deleteAssetRecord(id) {
  if (!id) return;
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ASSETS, "readwrite");
      tx.objectStore(STORE_ASSETS).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore cleanup failures
  }
}

export async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}
