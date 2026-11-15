import { useState } from "react";
import { renderPhotoStrip } from "../services/canvasCompositor";
import { downloadImage } from "../services/imageExporter";

export default function useCanvasExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState(null);

  const exportStrip = async (options) => {
    setIsExporting(true);
    try {
      const url = await renderPhotoStrip(options);
      setExportedUrl(url);
      setIsExporting(false);
      return url;
    } catch (err) {
      console.error("Export error", err);
      setIsExporting(false);
      throw err;
    }
  };

  const downloadStrip = (url, filename) => {
    if (url) downloadImage(url, filename);
  };

  return {
    isExporting,
    exportedUrl,
    exportStrip,
    downloadStrip
  };
}
