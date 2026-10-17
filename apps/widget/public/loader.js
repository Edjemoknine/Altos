// apps/widget/public/loader.js
// Plain JavaScript, no build step. Vite serves the public/ folder as-is,
// so this file ends up at https://your-widget-domain/loader.js

(function () {
  var script = document.currentScript;
  var apiKey = script.getAttribute("data-api-key") || "";
  var origin = new URL(script.src).origin; // where the widget app is hosted

  var CLOSED = { w: "64px", h: "64px" };
  var OPEN = { w: "380px", h: "600px" };

  var iframe = document.createElement("iframe");
  iframe.src = origin + "/?apiKey=" + encodeURIComponent(apiKey);
  iframe.title = "Support chat";
  iframe.style.cssText =
    "position:fixed;bottom:20px;right:20px;border:0;background:transparent;" +
    "z-index:2147483647;color-scheme:normal;" +
    "max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);" +
    "width:" + CLOSED.w + ";height:" + CLOSED.h + ";";
  document.body.appendChild(iframe);

  // The widget app tells us when it opens or closes, so the iframe
  // only covers the host page while the chat is open.
  window.addEventListener("message", function (event) {
    if (event.origin !== origin) return;
    if (event.data && event.data.type === "ai-widget:toggle") {
      var size = event.data.open ? OPEN : CLOSED;
      iframe.style.width = size.w;
      iframe.style.height = size.h;
    }
  });
})();