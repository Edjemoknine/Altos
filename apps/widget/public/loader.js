(function () {
  var script = document.currentScript;

  var apiKey = script.getAttribute("data-api-key") || "";
  var agentId = script.getAttribute("data-agent-id") || "";
  var customerOrigin = window.location.origin;

  var origin = new URL(script.src).origin;

  var CLOSED = { w: "64px", h: "64px" };
  var OPEN = { w: "380px", h: "600px" };

  var params = new URLSearchParams({
    apiKey: apiKey,
    agentId: agentId,
    customerOrigin: customerOrigin,
  });

  var iframe = document.createElement("iframe");

  iframe.src = origin + "/?" + params.toString();
  iframe.title = "Support chat";

  iframe.style.cssText =
    "position:fixed;bottom:20px;right:20px;border:0;background:transparent;" +
    "z-index:2147483647;color-scheme:normal;" +
    "max-width:calc(100vw - 40px);max-height:calc(100vh - 40px);border-radius:30px;" +
    "transition:width 200ms ease-out,height 200ms ease-out;" +
    "width:" + CLOSED.w + ";height:" + CLOSED.h + ";";

  document.body.appendChild(iframe);

  window.addEventListener("message", function (event) {
    if (event.origin !== origin) return;

    if (event.data && event.data.type === "ai-widget:toggle") {
      var size = event.data.open ? OPEN : CLOSED;
      iframe.style.width = size.w;
      iframe.style.height = size.h;
    }
  });
})();