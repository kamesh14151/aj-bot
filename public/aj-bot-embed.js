(function () {
  if (window.AJBotWidgetLoaded) return;
  window.AJBotWidgetLoaded = true;

  var scriptTag = document.currentScript;
  var providedBase = scriptTag && scriptTag.getAttribute("data-base-url");
  var baseUrl = (providedBase || "https://aj-bot-iota.vercel.app").replace(/\/$/, "");

  var style = document.createElement("style");
  style.textContent = [
    "@keyframes aj-byte-shimmer {",
    "  0% { background-position: 200% 0; }",
    "  100% { background-position: -200% 0; }",
    "}",
    "@keyframes aj-byte-spin {",
    "  to { transform: rotate(360deg); }",
    "}",
    ".aj-byte-shell {",
    "  position: fixed;",
    "  right: 16px;",
    "  bottom: 16px;",
    "  width: 420px;",
    "  height: 700px;",
    "  max-width: calc(100vw - 16px);",
    "  max-height: calc(100vh - 16px);",
    "  border-radius: 18px;",
    "  border: 1px solid rgba(15, 23, 42, 0.08);",
    "  background: #fafaf9;",
    "  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);",
    "  z-index: 2147483001;",
    "  overflow: hidden;",
    "  transition: opacity 220ms ease;",
    "}",
    ".aj-byte-shell-header {",
    "  height: 46px;",
    "  border-bottom: 1px solid rgba(15, 23, 42, 0.08);",
    "  background: #f2e7d5;",
    "}",
    ".aj-byte-shell-content {",
    "  display: grid;",
    "  place-items: center;",
    "  gap: 12px;",
    "  height: calc(100% - 46px);",
    "  padding: 20px;",
    "}",
    ".aj-byte-shell-spinner {",
    "  width: 34px;",
    "  height: 34px;",
    "  border-radius: 50%;",
    "  border: 2px solid rgba(15, 23, 42, 0.14);",
    "  border-top-color: rgba(15, 23, 42, 0.55);",
    "  animation: aj-byte-spin 900ms linear infinite;",
    "}",
    ".aj-byte-shell-text {",
    "  font: 500 15px/1.4 ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;",
    "  color: #334155;",
    "}",
    ".aj-byte-shell-line {",
    "  width: min(280px, 82%);",
    "  height: 10px;",
    "  border-radius: 999px;",
    "  background: linear-gradient(90deg, #e2e8f0 25%, #f8fafc 50%, #e2e8f0 75%);",
    "  background-size: 200% 100%;",
    "  animation: aj-byte-shimmer 1.4s linear infinite;",
    "}",
    ".aj-byte-shell-line.aj-byte-shell-line-short {",
    "  width: min(190px, 60%);",
    "}",
  ].join("\n");
  document.head.appendChild(style);

  var shell = document.createElement("div");
  shell.className = "aj-byte-shell";
  shell.innerHTML = [
    '<div class="aj-byte-shell-header"></div>',
    '<div class="aj-byte-shell-content">',
    '  <div class="aj-byte-shell-spinner" aria-hidden="true"></div>',
    '  <div class="aj-byte-shell-text">Getting BYTE ready...</div>',
    '  <div class="aj-byte-shell-line"></div>',
    '  <div class="aj-byte-shell-line aj-byte-shell-line-short"></div>',
    "</div>",
  ].join("");

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
  iframe.style.opacity = "0";
  iframe.style.transition = "opacity 180ms ease";

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
      shell.style.right = "8px";
      shell.style.bottom = "8px";
      shell.style.width = "calc(100vw - 16px)";
      shell.style.height = "calc(100vh - 16px)";
    } else {
      iframe.style.right = "16px";
      iframe.style.bottom = "16px";
      iframe.style.width = "420px";
      iframe.style.height = "700px";
      shell.style.right = "16px";
      shell.style.bottom = "16px";
      shell.style.width = "420px";
      shell.style.height = "700px";
    }
  };

  var hideShell = function () {
    if (!shell.parentNode) return;
    shell.style.opacity = "0";
    window.setTimeout(function () {
      if (shell.parentNode) {
        shell.parentNode.removeChild(shell);
      }
    }, 240);
  };

  iframe.addEventListener("load", function () {
    iframe.style.opacity = "1";
    hideShell();
  });

  applyResponsiveSize();
  window.addEventListener("resize", applyResponsiveSize);

  document.body.appendChild(shell);
  document.body.appendChild(iframe);

  // Safety timeout in case load event is delayed by network constraints.
  window.setTimeout(function () {
    iframe.style.opacity = "1";
    hideShell();
  }, 8500);
})();
