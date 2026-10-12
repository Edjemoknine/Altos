// apps/widget/src/widget-entry.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import styles from "./globals.css?inline"; // string, not injected into <head>

const scriptTag =
  document.currentScript || document.querySelector("script[data-api-key]");
const apiKey = scriptTag?.getAttribute("data-api-key") || "";

const widgetRoot = document.createElement("div");
widgetRoot.id = "ai-support-widget-root";
document.body.appendChild(widgetRoot);

const shadowRoot = widgetRoot.attachShadow({ mode: "open" });

// Tailwind + theme styles, scoped to the shadow root
const styleEl = document.createElement("style");
styleEl.textContent = styles;
shadowRoot.appendChild(styleEl);

// Tailwind v4 uses @property, which browsers ignore inside shadow roots.
// Re-declare those rules on the document so shadows, rings, transforms work.
const propertyRules = styles.match(/@property[^{]+\{[^}]*\}/g)?.join("\n");
if (propertyRules) {
  const propsEl = document.createElement("style");
  propsEl.textContent = propertyRules;
  document.head.appendChild(propsEl);
}

const mountPoint = document.createElement("div");
mountPoint.className = "font-sans text-foreground"; // body styles don't apply in shadow DOM
shadowRoot.appendChild(mountPoint);

ReactDOM.createRoot(mountPoint).render(
  <React.StrictMode>
    <App apiKey={apiKey} />
  </React.StrictMode>,
);
