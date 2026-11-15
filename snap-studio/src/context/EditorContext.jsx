import { createContext, useContext } from "react";
import { useBooth } from "./BoothContext";

const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const booth = useBooth();

  return (
    <EditorContext.Provider value={booth}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  return context || useBooth();
}
