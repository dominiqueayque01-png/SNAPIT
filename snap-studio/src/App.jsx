import { BoothProvider, useBooth } from "./context/BoothContext";
import Booth from "./pages/Booth";
import Editor from "./pages/Editor";
import "./styles/variables.css";
import "./styles/animations.css";
import "./styles/booth.css";
import "./styles/editor.css";

function AppContent() {
  const { currentView } = useBooth();

  return (
    <div className="snap-app-root">
      {currentView === "editor" ? <Editor /> : <Booth />}
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
