import petodoCss from "./styles/petodo-custom.css?inline";

/**
 * Injects CSS into the document
 * @param {string} css - CSS code as a string
 */
function injectCss(css) {
  const style = document.createElement("style");
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
}

injectCss(petodoCss);

// Import utilities
import "./utils/storage.js";
import "./utils/notifications.js";
import "./utils/clipboard.js";
import "./utils/icons.js";

// Import plugins
import "./plugins/copy-compact-plugin.js";
import "./plugins/favorites-plugin.js";
import "./plugins/search-plugin.js";
import "./plugins/utils-plugin.js";
import "./plugins/json-validation-plugin.js";

// List of plugins for initialization
const PLUGINS = [
  { id: "copy-compact", name: "CopyCompactPlugin" },
  { id: "favorites", name: "FavoritesPlugin" },
  { id: "search", name: "SearchPlugin" },
  { id: "utils", name: "UtilsPlugin" },
  { id: "json-validation", name: "JSONValidationPlugin" },
];

/**
 * Initializes all plugins
 */
function initPlugins() {
  const hasSwagger = !!document.getElementById("swagger-ui");
  if (!hasSwagger) {
    // console.warn("Swagger UI not found");
    return false;
  }

  for (const pluginInfo of PLUGINS) {
    const plugin = window[pluginInfo.name];

    if (plugin && plugin.init && typeof plugin.init === "function") {
      plugin.init();
    } else {
      console.warn(
        `Plugin ${pluginInfo.id} does not export plugin object with init function. Tried: ${pluginInfo.name}`
      );
    }
  }

  return true;
}

/**
 * Waits for Swagger UI to appear on the page using MutationObserver
 * with a timeout to avoid infinite waiting on pages without Swagger UI
 */
function waitForSwaggerUI() {
  // Check if already initialized
  if (window.__petodoSwaggerInitialized) {
    return;
  }

  const MAX_WAIT_TIME = 3000;
  const CHECK_INTERVAL = 100;
  const INITIAL_DELAY = 500;
  const startTime = Date.now();
  let observer = null;
  let intervalId = null;
  let timeoutId = null;

  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const checkForSwagger = () => {
    // Check if already initialized
    if (window.__petodoSwaggerInitialized) {
      cleanup();
      return;
    }

    // Check timeout first - stop if we've waited too long
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime >= MAX_WAIT_TIME) {
      // Stop checking after timeout - this page probably doesn't have Swagger UI
      cleanup();
      return;
    }

    // Try to initialize plugins
    if (initPlugins()) {
      console.log("[Petodo Swagger] Utils successfully initialized");
      window.__petodoSwaggerInitialized = true;
      cleanup();
      return;
    }
  };

  // Use MutationObserver to watch for DOM changes
  observer = new MutationObserver(() => {
    checkForSwagger();
  });

  // Start observing the document body for changes
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  // First check after 500ms
  timeoutId = setTimeout(() => {
    checkForSwagger();
    // After first check, start periodic checks as a fallback
    intervalId = setInterval(() => {
      checkForSwagger();
    }, CHECK_INTERVAL);
  }, INITIAL_DELAY);
}

// Initialize when document is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForSwaggerUI);
} else {
  // Document is already loaded
  waitForSwaggerUI();
}
