import { BoothProvider, useBooth } from "./context/BoothContext";
import Landing from "./pages/Landing";
import Booth from "./pages/Booth";
import Editor from "./pages/Editor";
import Gallery from "./pages/Gallery";
import "./styles/variables.css";
import "./styles/animations.css";
import "./styles/booth.css";
import "./styles/editor.css";
import "./styles/photoEditor.css";
import "./styles/landing.css";

function AppContent() {
  const { currentView } = useBooth();

  const renderCurrentView = () => {
    switch (currentView) {
      case "landing":
        return <Landing />;
      case "editor":
        return <Editor />;
      case "gallery":
        return <Gallery />;
      case "booth":
      default:
        return <Booth />;
    }
  };

  return (
    <div key={currentView} className="app-view-container app-view-enter">
      {renderCurrentView()}
    </div>
  );
}

export default function App() {
  return (
    <BoothProvider>
      <AppContent />
    </BoothProvider>
  );
}
