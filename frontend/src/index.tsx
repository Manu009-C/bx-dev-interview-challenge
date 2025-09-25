import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import App from "./app-init.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
