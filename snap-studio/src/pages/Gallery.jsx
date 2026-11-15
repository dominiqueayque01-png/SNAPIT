import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Download } from "lucide-react";
import { useBooth } from "../context/BoothContext";
import { getSavedStrips, deleteSavedStrip } from "../services/storage";
import { downloadImage } from "../services/imageExporter";

export default function Gallery() {
  const { setCurrentView } = useBooth();
  const [gallery, setGallery] = useState([]);

  useEffect(() => {
    setGallery(getSavedStrips());
  }, []);

  const handleDelete = (id) => {
    const updated = deleteSavedStrip(id);
    setGallery(updated);
  };

  return (
    <div className="editor-page-container">
      <header className="editor-nav-header">
        <button className="btn-nav-back" onClick={() => setCurrentView("booth")}>
          <ArrowLeft size={18} />
          <span>Back to Booth</span>
        </button>
        <div className="editor-header-title">
          <h2>SAVED MEMORIES ♡</h2>
        </div>
        <div style={{ width: 80 }} />
      </header>

      {gallery.length === 0 ? (
        <div className="empty-preview" style={{ padding: "60px 0", textAlign: "center" }}>
          <p>No saved strips yet. Go take some cute photos!</p>
        </div>
      ) : (
        <div className="photo-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {gallery.map(item => (
            <div key={item.id} className="polaroid">
              <img src={item.imageUrl} alt="Saved Strip" style={{ width: "100%", borderRadius: 4 }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <button onClick={() => downloadImage(item.imageUrl, `snap-${item.id}.png`)}>
                  <Download size={14} /> Save
                </button>
                <button onClick={() => handleDelete(item.id)} style={{ color: "#e11d48" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
