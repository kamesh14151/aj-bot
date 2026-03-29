(function () {
  if (window.AJBotWidgetLoaded) return;
  window.AJBotWidgetLoaded = true;

  var scriptTag = document.currentScript;
  var providedBase = scriptTag && scriptTag.getAttribute("data-base-url");
  var baseUrl = (providedBase || "https://aj-bot-iota.vercel.app").replace(/\/$/, "");

  var iframe = document.createElement("iframe");
  iframe.src = baseUrl + "/embed";
  iframe.title = "AJ BOT Assistant";
  iframe.setAttribute("aria-label", "AJ BOT Assistant");
  iframe.style.position = "fixed";
  iframe.style.right = "16px";
  iframe.style.bottom = "16px";
  iframe.style.width = "420px";
  iframe.style.height = "700px";
  iframe.style.maxWidth = "calc(100vw - 16px)";
  iframe.style.maxHeight = "calc(100vh - 16px)";
  iframe.style.border = "0";
  iframe.style.background = "transparent";
  iframe.style.zIndex = "2147483000";
  iframe.style.overflow = "hidden";

  iframe.setAttribute(
    "sandbox",
    "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
  );

  var applyResponsiveSize = function () {
    var narrow = window.matchMedia("(max-width: 768px)").matches;
    if (narrow) {
      iframe.style.right = "8px";
      iframe.style.bottom = "8px";
      iframe.style.width = "calc(100vw - 16px)";
      iframe.style.height = "calc(100vh - 16px)";
    } else {
      iframe.style.right = "16px";
      iframe.style.bottom = "16px";
      iframe.style.width = "420px";
      iframe.style.height = "700px";
    }
  };

  applyResponsiveSize();
  window.addEventListener("resize", applyResponsiveSize);

  document.body.appendChild(iframe);
})();
