import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 1. Read the API key passed from the script tag data attribute
const scriptTag =
  document.currentScript || document.querySelector("script[data-api-key]");
const apiKey = scriptTag?.getAttribute("data-api-key") || "";

// 2. Create a host container div
const widgetRoot = document.createElement("div");
widgetRoot.id = "ai-support-widget-root";
document.body.appendChild(widgetRoot);

// 3. Attach Shadow DOM for style isolation
const shadowRoot = widgetRoot.attachShadow({ mode: "open" });
const emotionRoot = document.createElement("div");
shadowRoot.appendChild(emotionRoot);

// 4. Render the React App inside the shadow root
ReactDOM.createRoot(emotionRoot).render(
  <React.StrictMode>
    <App apiKey={apiKey} />
  </React.StrictMode>,
);
