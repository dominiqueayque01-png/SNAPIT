/**
 * Backend API Client for SNAP! STUDIO
 * Works seamlessly with:
 * - Local Vite dev proxy (/api -> http://localhost:3001)
 * - Azure Static Web Apps Linked Backend (/api -> Azure Container App)
 * - Direct ACA URL via VITE_API_BASE_URL (for SWA Free Tier)
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return `${API_BASE}${url}`;
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(apiUrl("/api/v1/health"), { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

export async function uploadStripToServer({
  dataUrl,
  mode = "strip-4",
  title = "SNAP! Studio Print",
  caption = "",
  paperColor = "#fdfbf7",
  textColor = "#2a211f",
  filterId = "normal"
}) {
  const blob = await dataUrlToBlob(dataUrl);
  const ext = blob.type === "image/jpeg" ? "jpg" : "png";

  const form = new FormData();
  form.append("image", blob, `snap-strip.${ext}`);
  form.append("mode", mode);
  form.append("title", title);
  form.append("caption", caption);
  form.append("paperColor", paperColor);
  form.append("textColor", textColor);
  form.append("filterId", filterId);

  const res = await fetch(apiUrl("/api/v1/strips"), {
    method: "POST",
    body: form
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.error || `Server returned ${res.status}`);
  }

  const data = await res.json();
  return {
    ...data,
    imageUrl: resolveMediaUrl(data.imageUrl),
    thumbUrl: resolveMediaUrl(data.thumbUrl),
    qrEndpoint: apiUrl(data.qrEndpoint)
  };
}

export async function fetchServerStrips({ limit = 40, offset = 0 } = {}) {
  const res = await fetch(apiUrl(`/api/v1/strips?limit=${limit}&offset=${offset}`));
  if (!res.ok) {
    throw new Error(`Failed to fetch cloud archive (${res.status})`);
  }
  const data = await res.json();
  return {
    ...data,
    items: (data.items || []).map((item) => ({
      ...item,
      imageUrl: resolveMediaUrl(item.imageUrl),
      thumbUrl: resolveMediaUrl(item.thumbUrl),
      qrEndpoint: apiUrl(item.qrEndpoint)
    }))
  };
}

export async function deleteServerStrip(id) {
  const res = await fetch(apiUrl(`/api/v1/strips/${encodeURIComponent(id)}`), {
    method: "DELETE"
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete cloud strip (${res.status})`);
  }
  return true;
}
