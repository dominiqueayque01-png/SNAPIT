const STORAGE_KEY = "snap_studio_gallery_v1";

export function getSavedStrips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStripToGallery(stripData) {
  try {
    const current = getSavedStrips();
    const updated = [
      {
        id: Date.now(),
        date: new Date().toISOString(),
        ...stripData
      },
      ...current
    ].slice(0, 30); // keep last 30
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function deleteSavedStrip(id) {
  try {
    const current = getSavedStrips();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
