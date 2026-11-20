import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { DispatcherProvider } from "./features/dispatcher/context/DispatcherContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DispatcherProvider>
      <App />
    </DispatcherProvider>
  </StrictMode>,
);
