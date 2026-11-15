export function downloadImage(dataUrl, filename = "snap-studio-moment.png") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareImage(dataUrl, filename = "snap-studio-moment.png") {
  if (!navigator.share) {
    downloadImage(dataUrl, filename);
    return;
  }

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "My Snap! Studio Photo Strip",
        text: "Check out my cute photobooth strip from Snap! Studio ✦"
      });
    } else {
      downloadImage(dataUrl, filename);
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      downloadImage(dataUrl, filename);
    }
  }
}
