// ==UserScript==
// @name         Petodo Swagger Plugins
// @namespace    https://github.com/petodo-io
// @version      0.1.1
// @description  Plugins for improving Swagger UI: copy compact format, favorites endpoints, search
// @author       Petodo
// @match        *://*/*
// @updateURL    https://raw.githubusercontent.com/petodo-io/petodo-swagger-plugin/main/dist/petodo-swagger.user.js
// @downloadURL  https://raw.githubusercontent.com/petodo-io/petodo-swagger-plugin/main/dist/petodo-swagger.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
  "use strict";
  const petodoCss = '/* ===== Notifications ===== */\n\n:root {\n  --petodo-primary-color: #8d9297;\n}\n\n.petodo-notification {\n  position: fixed;\n  top: 20px;\n  right: 20px;\n  color: white;\n  padding: 12px 24px;\n  border-radius: 4px;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);\n  z-index: 10000;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  font-size: 14px;\n  animation: slideIn 0.3s ease-out;\n}\n\n.petodo-notification.petodo-notification-success {\n  background: #4caf50;\n}\n\n.petodo-notification.petodo-notification-error {\n  background: #f44336;\n}\n\n@keyframes slideIn {\n  from {\n    transform: translateX(100%);\n    opacity: 0;\n  }\n  to {\n    transform: translateX(0);\n    opacity: 1;\n  }\n}\n\n@keyframes slideOut {\n  from {\n    transform: translateX(0);\n    opacity: 1;\n  }\n  to {\n    transform: translateX(100%);\n    opacity: 0;\n  }\n}\n\n/* ===== Copy compact menu ===== */\n.copy-compact-container {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n  position: relative;\n}\n\n.copy-compact-btn {\n  padding: 6px;\n  background: transparent;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  flex-shrink: 0;\n}\n\n.copy-compact-btn svg {\n  color: var(--petodo-primary-color);\n  transition: color 0.15s;\n}\n\n.copy-compact-btn:hover svg {\n  color: #7a746c;\n}\n\n.copy-compact-expand-btn {\n  padding: 0;\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 12px;\n  height: 28px;\n}\n\n.copy-compact-expand-btn svg {\n  color: var(--petodo-primary-color);\n  fill: currentColor;\n}\n\n.copy-compact-expand-btn:hover {\n  background: #0000000f;\n}\n\n.copy-compact-expand-btn:hover svg {\n  color: #7a746c;\n}\n\n.copy-compact-expand-btn.is-open {\n  transform: rotate(180deg);\n}\n\n.copy-compact-dropdown {\n  position: absolute;\n  top: 100%;\n  right: 0;\n  margin-top: 4px;\n  background: white;\n  border: 1px solid #d0d7de;\n  border-radius: 6px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);\n  z-index: 1000;\n  min-width: 280px;\n  display: block;\n  padding: 4px;\n}\n\n.copy-mode-item {\n  display: flex;\n  align-items: center;\n  padding: 8px 12px;\n  cursor: pointer;\n  border-radius: 4px;\n  transition: background 0.15s;\n}\n\n.copy-mode-item:hover {\n  background: #f6f8fa;\n}\n\n.copy-mode-label {\n  flex: 1;\n  font-size: 14px;\n  color: #24292f;\n}\n\n.copy-mode-radio {\n  margin-left: 12px;\n  cursor: pointer;\n}\n\n/* ===== Favorites endpoints ===== */\n.auth-wrapper {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex: 1 !important;\n}\n.opblock-summary {\n  position: relative;\n}\n\n.favorite-star-container {\n  position: absolute;\n  top: 0;\n  left: -24px;\n  display: flex;\n  align-items: center;\n  width: 40px;\n  height: 40px;\n  cursor: default;\n}\n\n@media (max-width: 1500px) {\n  .favorite-star-container {\n    left: -20px;\n  }\n}\n\n.favorite-star-btn {\n  display: none;\n  padding: 2px;\n  background: transparent;\n  border: none;\n  border-radius: 4px;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  color: var(--petodo-primary-color);\n  fill: var(--petodo-primary-color);\n}\n\n.favorite-star-container.favorite-visible .favorite-star-btn {\n  display: flex;\n}\n\n.opblock-summary:hover .favorite-star-btn {\n  display: flex;\n}\n\n.favorite-star-btn:hover {\n  background: rgba(0, 0, 0, 0.05);\n}\n\n.favorite-star-btn svg {\n  user-select: none;\n}\n\n.favorite-star-btn:hover svg {\n  transform: scale(1.1);\n}\n\n.favorite-star-btn.favorite-active svg {\n  color: #ffc107 !important;\n  fill: #ffc107 !important;\n}\n\n/* Favorites filter button */\n.favorites-filter-btn {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  padding: 8px 16px;\n  margin-right: 8px;\n  background: transparent;\n  border: 1px solid #d0d7de;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-size: 14px;\n  color: #24292f;\n}\n\n.favorites-filter-btn:hover {\n  background: #f6f8fa;\n  border-color: #8c959f;\n}\n\n.favorites-filter-btn.active {\n  background: #fff3cd;\n  border-color: #ffc107;\n}\n\n.favorites-filter-btn.active:hover {\n  background: #ffe69c;\n  border-color: #ffc107;\n}\n\n.favorites-filter-btn svg {\n  transition: fill 0.15s;\n}\n\n.favorites-filter-btn.active svg {\n  fill: #ffc107 !important;\n}\n\n/* ===== Search endpoints ===== */\n.wrapper.swagger-search-wrapper {\n  margin: 0;\n  padding: 0;\n  margin-right: auto;\n}\n\n.swagger-search-inner-wrapper {\n  position: relative;\n  display: inline-block;\n  width: 100%;\n}\n\n.swagger-search-input {\n  position: relative;\n  z-index: 2;\n  background: transparent !important;\n  border: 1px solid #d0d7de;\n  border-radius: 4px;\n  padding: 8px 32px 8px 12px !important;\n  font-size: 14px !important;\n  max-width: none;\n  width: 100%;\n  height: 34px;\n  outline: none;\n  margin: 0 !important;\n  line-height: 1;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;\n  color: transparent;\n  caret-color: #24292f;\n  transition: border-color 0.15s;\n}\n\n.swagger-search-input:focus {\n  border-color: #0969da;\n  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);\n}\n\n.swagger-search-input::placeholder {\n  color: #8c959f;\n}\n\n.swagger-search-inner-wrapper pre {\n  position: absolute;\n  left: 0;\n  top: 0;\n  margin: 0;\n  padding: 8px 32px 8px 12px !important;\n  white-space: pre-wrap;\n  word-wrap: break-word;\n  color: #24292f;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;\n  font-size: 14px !important;\n  line-height: 1;\n  pointer-events: none;\n  z-index: 1;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  height: 34px;\n  width: 100%;\n  box-sizing: border-box;\n  overflow: hidden;\n  background: white;\n}\n\n.swagger-search-clear-btn {\n  position: absolute;\n  right: 8px;\n  top: 50%;\n  transform: translateY(-50%);\n  background: transparent;\n  border: none;\n  cursor: pointer;\n  display: none;\n  align-items: center;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  z-index: 3;\n  padding: 0;\n  border-radius: 4px;\n  transition: background-color 0.15s;\n}\n\n.swagger-search-clear-btn:hover {\n  background-color: rgba(0, 0, 0, 0.05);\n}\n\n.swagger-search-clear-btn svg {\n  color: #8c959f;\n  transition: color 0.15s;\n}\n\n.swagger-search-clear-btn:hover svg {\n  color: #24292f;\n}\n\n/* JSON Validation Overlay */\n.json-validation-wrapper {\n  position: relative;\n  display: inline-block;\n  width: 100%;\n}\n\n.json-validation-overlay {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  pointer-events: none;\n  overflow: hidden;\n  white-space: pre-wrap;\n  word-wrap: break-word;\n  color: transparent;\n  z-index: 2;\n  background: transparent;\n  border: none;\n  box-sizing: border-box;\n  margin: 5px 0;\n  padding: 10px;\n  outline: none;\n  font-family: monospace;\n  font-size: 12px;\n  font-weight: 600;\n  line-height: 13.8px;\n}\n\n.json-validation-highlight {\n  background-color: rgba(244, 67, 54, 0.2);\n  border-bottom: 2px solid #f44336;\n}\n\n.json-validation-schema-highlight {\n  background-color: rgba(255, 152, 0, 0.2);\n  border-bottom: 2px solid #ff9800;\n}\n\n.json-validation-wrapper textarea {\n  position: relative;\n  z-index: 1;\n  max-width: 100%;\n  font-family: monospace;\n  border: none !important;\n}\n.json-validation-wrapper textarea:focus {\n  box-shadow: 0 0 0 2px #61affe;\n}\n\n.json-validation-error {\n  margin-top: 8px;\n  padding: 12px;\n  background-color: #ffebee;\n  border: 1px solid #f44336;\n  border-radius: 4px;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.json-validation-error-message {\n  color: #d32f2f;\n  word-break: break-word;\n}\n\n.json-validation-schema-error {\n  margin-top: 8px;\n  padding: 12px;\n  background-color: #fff3cd;\n  border: 1px solid #ff9800;\n  border-radius: 4px;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  font-size: 13px;\n  line-height: 1.5;\n}\n\n.json-validation-error-list {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.json-validation-error-item {\n  display: flex;\n  flex-direction: column;\n  line-height: 1.2;\n}\n\n.json-validation-error-path {\n  font-weight: 600;\n  color: #c62828;\n  font-family: monospace;\n  font-size: 12px;\n}\n\n.json-validation-error-text {\n  color: #d32f2f;\n  word-break: break-word;\n}\n\n/* Schema error specific styles */\n.json-validation-schema-error .json-validation-error-path {\n  color: #e65100;\n}\n\n.json-validation-schema-error .json-validation-error-text {\n  color: #f57c00;\n}\n\n/* ===== JSON Validation ===== */\n.json-validation-error-input {\n  background-color: #ffebee !important;\n  box-shadow: 0 0 0 2px #f44336 !important;\n}\n\n.json-validation-schema-error-input {\n  box-shadow: 0 0 0 2px #ff9800 !important;\n}\n\n.json-validation-schema-error-input:focus {\n  box-shadow: 0 0 0 2px #ff9800, 0 0 0 5px rgba(255, 152, 0, 0.1) !important;\n}\n\n/* ===== Request Timing Analytics ===== */\n.request-timing-analytics {\n  display: flex;\n  align-items: stretch;\n  gap: 8px;\n}\n\n.request-timing-analytics-column {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.request-timing-analytics-column h5 {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  height: 18px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #3b4151;\n  margin: 0 0 8px 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  flex-shrink: 0;\n}\n\n.request-timing-clear-btn {\n  font-size: 11px;\n  font-weight: 500;\n  line-height: 1 !important;\n  color: #8c959f;\n  background: transparent;\n  border: 1px solid #d0d7de;\n  border-radius: 3px;\n  padding: 2px 8px;\n  cursor: pointer;\n  transition: all 0.15s;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  flex-shrink: 0;\n}\n\n.request-timing-clear-btn:hover {\n  color: #24292f;\n  background: #fff;\n  border-color: #8c959f;\n}\n.request-timing-clear-btn:active {\n  background: #f6f8fa;\n}\n\n.request-timing-analytics-column pre.microlight {\n  margin: 0;\n  padding: 0.5em;\n  background: rgb(51, 51, 51);\n  color: white;\n  border-radius: 4px;\n  font-size: 12px;\n  line-height: 1.5;\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  white-space: normal;\n}\n\n.request-timing-analytics .headerline {\n  display: block;\n  color: rgb(162, 252, 162);\n  font-family: monospace;\n  white-space: normal;\n  word-break: break-word;\n  margin-bottom: 2px;\n}\n\n.request-timing-analytics span {\n  display: inherit;\n}\n\n.request-timing-analytics .headerline:last-child {\n  margin-bottom: 0;\n}\n';
  (function() {
    const STORAGE_PREFIX = "petodo-swagger-";
    window.getStorageItem = function(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(STORAGE_PREFIX + key);
        if (value === null) {
          return defaultValue;
        }
        return JSON.parse(value);
      } catch (e) {
        console.error("Error reading from localStorage:", e);
        return defaultValue;
      }
    };
    window.setStorageItem = function(key, value) {
      try {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      } catch (e) {
        console.error("Error writing to localStorage:", e);
      }
    };
    window.removeStorageItem = function(key) {
      try {
        localStorage.removeItem(STORAGE_PREFIX + key);
      } catch (e) {
        console.error("Error removing from localStorage:", e);
      }
    };
  })();
  (function() {
    window.showNotification = function(message, isError = false) {
      const notification = document.createElement("div");
      notification.textContent = message;
      notification.className = "petodo-notification " + (isError ? "petodo-notification-error" : "petodo-notification-success");
      document.body.appendChild(notification);
      setTimeout(function() {
        notification.style.animation = "none";
        void notification.offsetWidth;
        notification.style.animation = "slideOut 0.3s ease-out";
        setTimeout(function() {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2e3);
    };
  })();
  (function() {
    window.copyToClipboard = function(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function() {
          if (window.showNotification) {
            window.showNotification("Copied!");
          }
        }).catch(function(err) {
          console.error("Copy error:", err);
          if (window.showNotification) {
            window.showNotification("Copy error", true);
          }
        });
      } else {
        window.showNotification("Copy error", true);
      }
    };
  })();
  (function() {
    const ICONS = {
      star: '<svg viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path fill="currentColor" d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"></path></svg>',
      starOutline: '<svg viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path d="M320.1 32C329.1 32 337.4 37.1 341.5 45.1L415 189.3L574.9 214.7C583.8 216.1 591.2 222.4 594 231C596.8 239.6 594.5 249 588.2 255.4L473.7 369.9L499 529.8C500.4 538.7 496.7 547.7 489.4 553C482.1 558.3 472.4 559.1 464.4 555L320.1 481.6L175.8 555C167.8 559.1 158.1 558.3 150.8 553C143.5 547.7 139.8 538.8 141.2 529.8L166.4 369.9L52 255.4C45.6 249 43.4 239.6 46.2 231C49 222.4 56.3 216.1 65.3 214.7L225.2 189.3L298.8 45.1C302.9 37.1 311.2 32 320.2 32zM320.1 108.8L262.3 222C258.8 228.8 252.3 233.6 244.7 234.8L119.2 254.8L209 344.7C214.4 350.1 216.9 357.8 215.7 365.4L195.9 490.9L309.2 433.3C316 429.8 324.1 429.8 331 433.3L444.3 490.9L424.5 365.4C423.3 357.8 425.8 350.1 431.2 344.7L521 254.8L395.5 234.8C387.9 233.6 381.4 228.8 377.9 222L320.1 108.8z"/></svg>',
      copy: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
      caret: '<svg viewBox="0 0 640 640" aria-hidden="true" focusable="false"><path fill="currentColor" d="M300.3 440.8C312.9 451 331.4 450.3 343.1 438.6L471.1 310.6C480.3 301.4 483 287.7 478 275.7C473 263.7 461.4 256 448.5 256L192.5 256C179.6 256 167.9 263.8 162.9 275.8C157.9 287.8 160.7 301.5 169.9 310.6L297.9 438.6L300.3 440.8z"></path></svg>',
      x: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>'
    };
    window.createIcon = function(iconName, options = {}) {
      const iconSvg = ICONS[iconName];
      if (!iconSvg) {
        console.warn(`Icon "${iconName}" not found`);
        return null;
      }
      const width = options.width || 20;
      const height = options.height || 20;
      const temp = document.createElement("div");
      temp.innerHTML = iconSvg;
      const svg = temp.querySelector("svg");
      if (!svg) {
        return null;
      }
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);
      return svg.cloneNode(true);
    };
  })();
  (function() {
    function getRequestBody(operationElement) {
      const methodElement = operationElement.querySelector(
        ".opblock-summary-method"
      );
      const method = methodElement ? methodElement.textContent.trim().toUpperCase() : "";
      if (method === "GET" || method === "HEAD" || method === "DELETE") {
        return null;
      }
      const responsesWrapper = operationElement.querySelector(".responses-wrapper");
      function isRequestBodyElement(element) {
        if (!element) return false;
        if (responsesWrapper && responsesWrapper.contains(element)) {
          return false;
        }
        const responseSection = element.closest(".responses-wrapper, .response");
        if (responseSection) {
          return false;
        }
        if (responsesWrapper) {
          const allElements = Array.from(operationElement.querySelectorAll("*"));
          const elementIndex = allElements.indexOf(element);
          const responsesIndex = allElements.indexOf(responsesWrapper);
          if (elementIndex !== -1 && responsesIndex !== -1) {
            return elementIndex < responsesIndex;
          }
        }
        return true;
      }
      function extractTextFromElement(element) {
        if (!element) return null;
        const textarea = element.querySelector("textarea");
        if (textarea && textarea.value && textarea.value.trim().length > 0) {
          try {
            const json = JSON.parse(textarea.value);
            return JSON.stringify(json, null, 2);
          } catch (e) {
            return textarea.value.trim();
          }
        }
        const preCode = element.querySelector("pre code");
        if (preCode) {
          const codeText = preCode.textContent.trim();
          if (codeText && codeText.length > 0) {
            const parentIsResponse = preCode.closest(
              ".response, .responses-wrapper"
            );
            if (!parentIsResponse) {
              try {
                const json = JSON.parse(codeText);
                return JSON.stringify(json, null, 2);
              } catch (e) {
                return codeText;
              }
            }
          }
        }
        const codeBlock = element.querySelector(".highlight-code, .microlight");
        if (codeBlock) {
          const codeText = codeBlock.textContent.trim();
          if (codeText && codeText.length > 0) {
            const parentIsResponse = codeBlock.closest(
              ".response, .responses-wrapper"
            );
            if (!parentIsResponse) {
              try {
                const json = JSON.parse(codeText);
                return JSON.stringify(json, null, 2);
              } catch (e) {
                return codeText;
              }
            }
          }
        }
        return null;
      }
      const opblockSectionRequestBody = operationElement.querySelector(
        ".opblock-section-request-body"
      );
      if (opblockSectionRequestBody && isRequestBodyElement(opblockSectionRequestBody)) {
        const preElement = opblockSectionRequestBody.querySelector("pre");
        if (preElement) {
          const codeElement = preElement.querySelector("code");
          const textSource = codeElement || preElement;
          const codeText = textSource.textContent ? textSource.textContent.trim() : null;
          if (codeText && codeText.length > 0) {
            try {
              const json = JSON.parse(codeText);
              return JSON.stringify(json, null, 2);
            } catch (e) {
              return codeText;
            }
          }
        }
      }
      const requestBodySection = operationElement.querySelector(".request-body");
      if (requestBodySection && isRequestBodyElement(requestBodySection)) {
        const text = extractTextFromElement(requestBodySection);
        if (text) return text;
      }
      const allTextareas = operationElement.querySelectorAll("textarea");
      for (let textarea of allTextareas) {
        if (isRequestBodyElement(textarea) && textarea.value && textarea.value.trim().length > 0) {
          try {
            const json = JSON.parse(textarea.value);
            return JSON.stringify(json, null, 2);
          } catch (e) {
            return textarea.value.trim();
          }
        }
      }
      const parametersContainer = operationElement.querySelector(
        ".parameters-container"
      );
      if (parametersContainer && isRequestBodyElement(parametersContainer)) {
        const bodyParam = parametersContainer.querySelector(".body-param");
        if (bodyParam && isRequestBodyElement(bodyParam)) {
          const text = extractTextFromElement(bodyParam);
          if (text) return text;
        }
      }
      const allBodyParams = operationElement.querySelectorAll(".body-param");
      for (let bodyParam of allBodyParams) {
        if (isRequestBodyElement(bodyParam)) {
          const text = extractTextFromElement(bodyParam);
          if (text) return text;
        }
      }
      return null;
    }
    function getQueryParameters(operationElement) {
      let parametersContainer = operationElement.querySelector(
        ".parameters-container"
      );
      if (!parametersContainer) {
        parametersContainer = operationElement.querySelector("table.parameters");
      }
      if (!parametersContainer) {
        parametersContainer = operationElement.querySelector(
          "[class*='parameter']"
        );
      }
      if (!parametersContainer) {
        return null;
      }
      const queryParams = [];
      const parameterRows = operationElement.querySelectorAll(
        'tr[data-param-in="query"]'
      );
      for (let paramRow of parameterRows) {
        let paramName = paramRow.dataset.paramName || "";
        if (!paramName) {
          const paramNameElement = paramRow.querySelector(".parameter__name");
          if (paramNameElement) {
            paramName = paramNameElement.textContent.trim();
          }
        }
        if (!paramName) {
          continue;
        }
        let paramType = "";
        const typeElement = paramRow.querySelector(".parameter__type");
        if (typeElement) {
          const typeText = typeElement.textContent.trim();
          paramType = typeText.replace(/\([^)]*\)/g, "").trim();
        }
        let paramValue = null;
        const input = paramRow.querySelector("input, select, textarea");
        if (input && input.value && input.value.trim()) {
          paramValue = input.value.trim();
        }
        const isRequired = !!paramRow.querySelector(".parameter__required, .required") || paramRow.textContent.includes("required") || !!paramRow.querySelector("[required]");
        let descText = "";
        const description = paramRow.querySelector(
          ".parameter__description, .renderedMarkdown, .parameters-col_description"
        );
        if (description) {
          const descriptionClone = description.cloneNode(true);
          const selects = descriptionClone.querySelectorAll("select");
          selects.forEach(function(select) {
            select.remove();
          });
          descText = descriptionClone.textContent.trim();
        }
        queryParams.push({
          name: paramName,
          type: paramType,
          value: paramValue,
          required: isRequired,
          description: descText
        });
      }
      return queryParams.length > 0 ? queryParams : null;
    }
    function getResponseExample(operationElement) {
      const responsesWrapper = operationElement.querySelector(".responses-wrapper");
      if (!responsesWrapper) {
        return null;
      }
      const responseItems = responsesWrapper.querySelectorAll(".response");
      for (let responseItem of responseItems) {
        const statusCode = responseItem.querySelector(".response-col_status");
        if (statusCode) {
          const codeText = statusCode.textContent.trim();
          const code = parseInt(codeText);
          if (code >= 200 && code < 300) {
            const responseBody = responseItem.querySelector(
              ".response-col_description"
            );
            if (responseBody) {
              const codeBlock = responseBody.querySelector(".highlight-code");
              if (codeBlock) {
                const codeText2 = codeBlock.textContent.trim();
                if (codeText2 && codeText2.length > 0) {
                  try {
                    const json = JSON.parse(codeText2);
                    return JSON.stringify(json, null, 2);
                  } catch (e) {
                    return codeText2;
                  }
                }
              }
              const microlight = responseBody.querySelector(".microlight");
              if (microlight) {
                const codeText2 = microlight.textContent.trim();
                if (codeText2 && codeText2.length > 0) {
                  try {
                    const json = JSON.parse(codeText2);
                    return JSON.stringify(json, null, 2);
                  } catch (e) {
                    return codeText2;
                  }
                }
              }
              const preCode = responseBody.querySelector("pre code");
              if (preCode) {
                const codeText2 = preCode.textContent.trim();
                if (codeText2 && codeText2.length > 0) {
                  try {
                    const json = JSON.parse(codeText2);
                    return JSON.stringify(json, null, 2);
                  } catch (e) {
                    return codeText2;
                  }
                }
              }
              const contentType = responseBody.querySelector(
                ".response-content-type"
              );
              if (contentType) {
                const parent = contentType.closest(".response");
                if (parent) {
                  const example = parent.querySelector(
                    "pre code, .highlight-code, .microlight"
                  );
                  if (example) {
                    const codeText2 = example.textContent.trim();
                    if (codeText2 && codeText2.length > 0) {
                      try {
                        const json = JSON.parse(codeText2);
                        return JSON.stringify(json, null, 2);
                      } catch (e) {
                        return codeText2;
                      }
                    }
                  }
                }
              }
              const responseSchema = responseBody.querySelector(".response-schema");
              if (responseSchema) {
                const example = responseSchema.querySelector(
                  "pre code, .highlight-code"
                );
                if (example) {
                  const codeText2 = example.textContent.trim();
                  if (codeText2 && codeText2.length > 0) {
                    try {
                      const json = JSON.parse(codeText2);
                      return JSON.stringify(json, null, 2);
                    } catch (e) {
                      return codeText2;
                    }
                  }
                }
              }
            }
          }
        }
      }
      return null;
    }
    function getDefaultCopyMode() {
      return window.getStorageItem(
        "copy-mode",
        "method-path-params-data-response"
      );
    }
    function setDefaultCopyMode(mode) {
      window.setStorageItem("copy-mode", mode);
      document.querySelectorAll(".copy-mode-radio").forEach(function(radio) {
        radio.checked = radio.value === mode;
      });
    }
    function getCompactFormat(operationElement, mode) {
      if (!mode) {
        mode = getDefaultCopyMode();
      }
      const methodElement = operationElement.querySelector(
        ".opblock-summary-method"
      );
      const method = methodElement ? methodElement.textContent.trim() : "";
      const pathElement = operationElement.querySelector(".opblock-summary-path");
      let path = pathElement ? pathElement.textContent.trim() : "";
      const queryParams = getQueryParameters(operationElement);
      if (queryParams && queryParams.length > 0) {
        const queryString = queryParams.map(function(param) {
          const value = param.value || `{${param.name}}`;
          return `${param.name}=${value}`;
        }).join("&");
        path += `?${queryString}`;
      }
      let result = `\`\`\`
${method} ${path}`;
      if (mode === "method-path-params-data" || mode === "method-path-params-data-response") {
        if (queryParams && queryParams.length > 0) {
          result += "\n\nQuery Parameters:";
          queryParams.forEach(function(param) {
            const typeInfo = param.type ? ` (${param.type}${param.required ? ", required" : ""})` : param.required ? " (required)" : "";
            result += `
- ${param.name}${typeInfo}`;
            if (param.description) {
              result += `: ${param.description}`;
            }
          });
        }
        const requestBody = getRequestBody(operationElement);
        if (requestBody) {
          result += `

Request Data:

${requestBody}`;
        }
      }
      if (mode === "method-path-params-data-response") {
        const responseExample = getResponseExample(operationElement);
        if (responseExample) {
          result += `

Response Example:

${responseExample}`;
        }
      }
      result += "\n```";
      return result;
    }
    function createDropdownMenu(container, operationElement, closeDropdown) {
      const dropdown = document.createElement("div");
      dropdown.className = "copy-compact-dropdown";
      const modes = [
        {
          value: "method-path",
          label: "Method + Path"
        },
        {
          value: "method-path-params-data",
          label: "Method + Path + Params + Data"
        },
        {
          value: "method-path-params-data-response",
          label: "Method + Path + Params + Data + Response"
        }
      ];
      const defaultMode = getDefaultCopyMode();
      modes.forEach(function(mode) {
        const item = document.createElement("div");
        item.className = "copy-mode-item";
        const label = document.createElement("span");
        label.textContent = mode.label;
        label.className = "copy-mode-label";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "copy-mode-default";
        radio.value = mode.value;
        radio.className = "copy-mode-radio";
        radio.checked = mode.value === defaultMode;
        radio.title = "Set as default";
        item.addEventListener("click", function(e) {
          if (e.target === radio || radio.contains(e.target)) {
            return;
          }
          e.stopPropagation();
          copyWithMode(operationElement, mode.value);
          closeDropdown();
        });
        radio.addEventListener("change", function(e) {
          e.stopPropagation();
          if (radio.checked) {
            setDefaultCopyMode(mode.value);
          }
        });
        item.appendChild(label);
        item.appendChild(radio);
        dropdown.appendChild(item);
      });
      container.appendChild(dropdown);
      return dropdown;
    }
    function copyWithMode(operationElement, mode) {
      const compactFormat = getCompactFormat(operationElement, mode);
      if (compactFormat) {
        window.copyToClipboard(compactFormat);
      }
    }
    function addCopyCompactButton(operationElement) {
      if (operationElement.querySelector(".copy-compact-container")) {
        return;
      }
      const summaryElement = operationElement.querySelector(".opblock-summary");
      if (!summaryElement) {
        return;
      }
      const lockButton = summaryElement.querySelector(
        ".authorization__btn, .btn-authorize, [class*='authorize']"
      );
      const chevron = summaryElement.querySelector(".opblock-control-arrow");
      const viewLineLink = summaryElement.querySelector(
        ".view-line-link, [class*='view-line']"
      );
      let insertBeforeElement = null;
      let insertAfterElement = null;
      if (lockButton && lockButton.parentNode === summaryElement) {
        insertBeforeElement = lockButton;
      } else if (chevron && chevron.parentNode === summaryElement) {
        insertBeforeElement = chevron;
      } else if (viewLineLink && viewLineLink.parentNode === summaryElement) {
        insertAfterElement = viewLineLink;
      }
      const container = document.createElement("div");
      container.className = "copy-compact-container";
      const copyButton = document.createElement("button");
      copyButton.className = "copy-compact-btn";
      copyButton.title = "Copy compact";
      const svgIcon = window.createIcon("copy", {
        width: 24,
        height: 24,
        fill: "stroke"
      });
      copyButton.appendChild(svgIcon);
      copyButton.addEventListener("click", function(e) {
        e.stopPropagation();
        const defaultMode = getDefaultCopyMode();
        copyWithMode(operationElement, defaultMode);
      });
      const expandButton = document.createElement("button");
      expandButton.className = "copy-compact-expand-btn";
      expandButton.title = "Copy variants";
      const caretIcon = window.createIcon("caret", {
        width: 12,
        height: 12
      });
      expandButton.appendChild(caretIcon);
      let dropdown = null;
      function closeDropdown() {
        if (dropdown && dropdown.parentNode) {
          dropdown.parentNode.removeChild(dropdown);
          dropdown = null;
          expandButton.classList.remove("is-open");
        }
      }
      expandButton.addEventListener("click", function(e) {
        e.stopPropagation();
        if (dropdown && dropdown.parentNode) {
          closeDropdown();
          return;
        }
        document.querySelectorAll(".copy-compact-dropdown").forEach(function(dd) {
          if (dd.parentNode) {
            dd.parentNode.removeChild(dd);
          }
        });
        dropdown = createDropdownMenu(container, operationElement, closeDropdown);
        expandButton.classList.add("is-open");
      });
      document.addEventListener("click", function(e) {
        if (dropdown && !container.contains(e.target)) {
          closeDropdown();
        }
      });
      container.appendChild(copyButton);
      container.appendChild(expandButton);
      summaryElement.style.display = "flex";
      summaryElement.style.alignItems = "center";
      if (insertBeforeElement) {
        summaryElement.insertBefore(container, insertBeforeElement);
      } else if (insertAfterElement) {
        if (insertAfterElement.nextSibling) {
          summaryElement.insertBefore(container, insertAfterElement.nextSibling);
        } else {
          summaryElement.appendChild(container);
        }
      } else {
        const children = Array.from(summaryElement.children);
        const methodElement = summaryElement.querySelector(
          ".opblock-summary-method"
        );
        const pathElement = summaryElement.querySelector(".opblock-summary-path");
        for (let i = children.length - 1; i >= 0; i--) {
          const child = children[i];
          if (child !== methodElement && child !== pathElement && child !== container) {
            summaryElement.insertBefore(container, child);
            return;
          }
        }
        summaryElement.appendChild(container);
      }
    }
    function processOperations() {
      const operations = document.querySelectorAll(".opblock");
      operations.forEach(function(operation) {
        addCopyCompactButton(operation);
      });
    }
    function init() {
      let observer = null;
      let initTimeout = null;
      function initialize() {
        const swaggerContainer = document.querySelector(".swagger-ui");
        if (!swaggerContainer) {
          return;
        }
        processOperations();
        if (!observer) {
          observer = new MutationObserver(function() {
            clearTimeout(initTimeout);
            initTimeout = setTimeout(processOperations, 100);
          });
          observer.observe(swaggerContainer, {
            childList: true,
            subtree: true
          });
        }
      }
      function waitForSwaggerUI2() {
        const swaggerContainer = document.querySelector(".swagger-ui");
        if (swaggerContainer) {
          setTimeout(initialize, 300);
        } else {
          setTimeout(waitForSwaggerUI2, 100);
        }
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", waitForSwaggerUI2);
      } else {
        waitForSwaggerUI2();
      }
    }
    window.CopyCompactPlugin = {
      init,
      name: "copy-compact"
    };
  })();
  (function() {
    const STORAGE_KEY = "favorites-endpoints";
    const FILTER_STORAGE_KEY = "favorites-filter-enabled";
    function getEndpointId(operationElement) {
      const methodElement = operationElement.querySelector(
        ".opblock-summary-method"
      );
      const pathElement = operationElement.querySelector(".opblock-summary-path");
      if (!methodElement || !pathElement) {
        return null;
      }
      const method = methodElement.textContent.trim().toUpperCase();
      const path = pathElement.textContent.trim();
      return `${method}-${path}`;
    }
    function getFavorites() {
      return window.getStorageItem(STORAGE_KEY, []);
    }
    function setFavorites(favorites) {
      window.setStorageItem(STORAGE_KEY, favorites);
    }
    function isFavorite(endpointId) {
      const favorites = getFavorites();
      return favorites.includes(endpointId);
    }
    function toggleFavorite(endpointId) {
      const favorites = getFavorites();
      const index = favorites.indexOf(endpointId);
      if (index > -1) {
        console.log("remove favorite", endpointId);
        favorites.splice(index, 1);
      } else {
        console.log("add favorite", endpointId);
        favorites.push(endpointId);
      }
      setFavorites(favorites);
    }
    function isFilterEnabled() {
      return window.getStorageItem(FILTER_STORAGE_KEY, false);
    }
    function setFilterEnabled(enabled) {
      console.log("Favorites filter enabled: ", enabled);
      window.setStorageItem(FILTER_STORAGE_KEY, enabled);
    }
    function updateAllEndpointsVisibility() {
      const filterEnabled = isFilterEnabled();
      const operations = document.querySelectorAll(".opblock");
      operations.forEach(function(operation) {
        if (!filterEnabled) {
          operation.style.display = "";
          return;
        }
        const endpointId = getEndpointId(operation);
        if (endpointId && isFavorite(endpointId)) {
          operation.style.display = "";
        } else {
          operation.style.display = "none";
        }
      });
    }
    function updateStarIcon(starButton, endpointId) {
      const isFav = isFavorite(endpointId);
      const svg = starButton.querySelector("svg");
      const starContainer = starButton.closest(".favorite-star-container");
      if (!svg) {
        return;
      }
      svg.remove();
      const iconType = isFav ? "star" : "starOutline";
      const iconColor = isFav ? "#ffc107" : "#97918a";
      const newIcon = window.createIcon(iconType, {
        width: 18,
        height: 18,
        color: iconColor,
        fill: "fill"
      });
      if (newIcon) {
        starButton.insertBefore(newIcon, starButton.firstChild);
      }
      if (isFav) {
        starButton.classList.add("favorite-active");
        if (starContainer) {
          starContainer.classList.add("favorite-visible");
        }
      } else {
        starButton.classList.remove("favorite-active");
        if (starContainer) {
          starContainer.classList.remove("favorite-visible");
        }
      }
    }
    function addStarButton(operationElement) {
      if (operationElement.querySelector(".favorite-star-btn")) {
        return;
      }
      const summaryElement = operationElement.querySelector(".opblock-summary");
      if (!summaryElement) {
        return;
      }
      const endpointId = getEndpointId(operationElement);
      if (!endpointId) {
        return;
      }
      const isFav = isFavorite(endpointId);
      const starContainer = document.createElement("div");
      starContainer.className = "favorite-star-container";
      if (isFav) {
        starContainer.classList.add("favorite-visible");
      }
      const starButton = document.createElement("button");
      starButton.className = "favorite-star-btn";
      if (isFav) {
        starButton.classList.add("favorite-active");
      }
      starButton.title = isFav ? "Remove from favorites" : "Add to favorites";
      starButton.setAttribute("aria-label", starButton.title);
      const iconType = isFav ? "star" : "starOutline";
      const iconColor = isFav ? "#ffc107" : "#97918a";
      const starIcon = window.createIcon(iconType, {
        width: 18,
        height: 18,
        color: iconColor,
        fill: "fill"
      });
      if (starIcon) {
        starButton.appendChild(starIcon);
      }
      starButton.addEventListener("click", function(e) {
        e.stopPropagation();
        toggleFavorite(endpointId);
        updateStarIcon(starButton, endpointId);
        updateAllEndpointsVisibility();
      });
      starContainer.appendChild(starButton);
      const firstChild = summaryElement.firstChild;
      if (firstChild) {
        summaryElement.insertBefore(starContainer, firstChild);
      } else {
        summaryElement.appendChild(starContainer);
      }
    }
    function addFilterButton() {
      if (document.querySelector(".favorites-filter-btn")) {
        return;
      }
      const authWrapper = document.querySelector(
        "section.schemes.wrapper.block.col-12 .auth-wrapper"
      );
      if (!authWrapper) {
        return;
      }
      const filterButton = document.createElement("button");
      filterButton.className = "btn favorites-filter-btn";
      filterButton.setAttribute("aria-label", "Show only favorites");
      const span = document.createElement("span");
      span.textContent = "Favorites";
      const starIcon = window.createIcon("star", {
        width: 20,
        height: 20,
        color: "#97918a",
        fill: "fill"
      });
      if (starIcon) {
        filterButton.appendChild(starIcon);
      }
      filterButton.appendChild(span);
      function updateFilterButtonState() {
        const enabled = isFilterEnabled();
        const svg = filterButton.querySelector("svg");
        const path = svg ? svg.querySelector("path") : null;
        if (path) {
          if (enabled) {
            filterButton.classList.add("active");
            path.setAttribute("fill", "#ffc107");
          } else {
            filterButton.classList.remove("active");
            path.setAttribute("fill", "#97918a");
          }
        }
      }
      filterButton.addEventListener("click", function(e) {
        e.stopPropagation();
        setFilterEnabled(!isFilterEnabled());
        updateFilterButtonState();
        updateAllEndpointsVisibility();
      });
      const authorizeButton = authWrapper.querySelector(".btn.authorize");
      if (authorizeButton) {
        authWrapper.insertBefore(filterButton, authorizeButton);
      } else {
        authWrapper.appendChild(filterButton);
      }
      updateFilterButtonState();
    }
    function initialize() {
      addFilterButton();
      const operations = document.querySelectorAll(".opblock");
      operations.forEach(function(operation) {
        addStarButton(operation);
      });
      updateAllEndpointsVisibility();
    }
    function init() {
      function waitForSwaggerUI2() {
        const swaggerContainer = document.querySelector(".swagger-ui");
        if (swaggerContainer) {
          setTimeout(initialize, 300);
        } else {
          setTimeout(waitForSwaggerUI2, 100);
        }
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", waitForSwaggerUI2);
      } else {
        waitForSwaggerUI2();
      }
    }
    window.FavoritesPlugin = {
      init,
      name: "favorites"
    };
  })();
  (function() {
    let hotkeyHandlerAdded = false;
    const METHOD_COLORS = {
      get: "#61affe",
      post: "#49cc90",
      put: "#fca130",
      patch: "#50e3c2",
      delete: "#f93e3e",
      head: "#9012fe",
      options: "#0d5aa7"
    };
    function getAllEndpoints() {
      const operations = document.querySelectorAll(".opblock");
      const endpoints = [];
      operations.forEach(function(operation) {
        const methodElement = operation.querySelector(".opblock-summary-method");
        const pathElement = operation.querySelector(".opblock-summary-path");
        if (methodElement && pathElement) {
          const method = methodElement.textContent.trim().toUpperCase();
          const path = pathElement.textContent.trim();
          endpoints.push({
            element: operation,
            method,
            path
          });
        }
      });
      return endpoints;
    }
    function detectHttpMethod(text) {
      const methods = [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "HEAD",
        "OPTIONS"
      ];
      const upperText = text.toUpperCase();
      for (let method of methods) {
        if (upperText.startsWith(method)) {
          const afterMethod = text.substring(method.length);
          if (afterMethod.length === 0 || /^\s/.test(afterMethod)) {
            return method;
          }
        }
      }
      return null;
    }
    function findAutocompleteSuggestion(input, paths) {
      if (!input || paths.length === 0) {
        return null;
      }
      const matchingPaths = paths.filter(function(path) {
        return path.toLowerCase().startsWith(input.toLowerCase());
      });
      if (matchingPaths.length === 0) {
        return null;
      }
      const firstPath = matchingPaths[0];
      if (matchingPaths.length === 1) {
        const nextSlash = firstPath.indexOf("/", input.length);
        if (nextSlash !== -1) {
          return firstPath.substring(input.length, nextSlash + 1);
        }
        return firstPath.substring(input.length);
      }
      let commonPrefix = matchingPaths[0];
      for (let i = 1; i < matchingPaths.length; i++) {
        const path = matchingPaths[i];
        let j = input.length;
        const minLen = Math.min(commonPrefix.length, path.length);
        while (j < minLen && commonPrefix[j].toLowerCase() === path[j].toLowerCase()) {
          j++;
        }
        commonPrefix = commonPrefix.substring(0, j);
      }
      if (commonPrefix.length > input.length) {
        const continuation = commonPrefix.substring(input.length);
        const nextSlash = continuation.indexOf("/");
        if (nextSlash !== -1) {
          return continuation.substring(0, nextSlash + 1);
        }
        return continuation;
      }
      if (firstPath.length > input.length) {
        const nextSlash = firstPath.indexOf("/", input.length);
        if (nextSlash !== -1) {
          return firstPath.substring(input.length, nextSlash + 1);
        }
        return firstPath.substring(input.length);
      }
      return null;
    }
    function filterEndpoints(query, endpoints) {
      if (!query || query.trim() === "") {
        return endpoints;
      }
      const queryLower = query.toLowerCase().trim();
      let method = null;
      let searchText = queryLower;
      const detectedMethod = detectHttpMethod(query);
      if (detectedMethod) {
        method = detectedMethod;
        searchText = query.substring(detectedMethod.length).trim();
      }
      return endpoints.filter(function(endpoint) {
        if (method && endpoint.method !== method) {
          return false;
        }
        if (!searchText) {
          return true;
        }
        const pathLower = endpoint.path.toLowerCase();
        return pathLower.includes(searchText);
      });
    }
    function updateHighlight(highlightElement, inputElement, value) {
      if (!value) {
        highlightElement.innerHTML = "";
        return;
      }
      const method = detectHttpMethod(value);
      let html = "";
      let remainingText = value;
      if (method) {
        const methodColor = METHOD_COLORS[method.toLowerCase()] || "#000";
        const methodText = method.toUpperCase();
        html += `<span style="color: ${methodColor}; font-weight: 600;">${escapeHtml(
          methodText
        )}</span>`;
        remainingText = value.substring(method.length);
      }
      const endpoints = getAllEndpoints();
      const filteredEndpoints = filterEndpoints(value, endpoints);
      const paths = filteredEndpoints.map(function(e) {
        return e.path;
      });
      if (method) {
        const searchText = remainingText.trim();
        const suggestion = findAutocompleteSuggestion(searchText, paths);
        if (suggestion) {
          html += escapeHtml(remainingText);
          html += `<span style="color: #999;">${escapeHtml(suggestion)}</span>`;
        } else {
          html += escapeHtml(remainingText);
        }
      } else {
        const trimmedValue = value.trim();
        if (trimmedValue.startsWith("/")) {
          const suggestion = findAutocompleteSuggestion(trimmedValue, paths);
          if (suggestion) {
            html += escapeHtml(value);
            html += `<span style="color: #999;">${escapeHtml(suggestion)}</span>`;
          } else {
            html += escapeHtml(value);
          }
        } else {
          const allPaths = endpoints.map(function(e) {
            return e.method + " " + e.path;
          });
          const suggestion = findAutocompleteSuggestion(value, allPaths);
          if (suggestion) {
            html += escapeHtml(value);
            html += `<span style="color: #999;">${escapeHtml(suggestion)}</span>`;
          } else {
            html += escapeHtml(value);
          }
        }
      }
      highlightElement.innerHTML = html;
    }
    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
    function applyFilter(query) {
      const endpoints = getAllEndpoints();
      const filtered = filterEndpoints(query, endpoints);
      endpoints.forEach(function(endpoint) {
        if (filtered.includes(endpoint)) {
          endpoint.element.style.display = "";
        } else {
          endpoint.element.style.display = "none";
        }
      });
    }
    function getAutocomplete(value) {
      if (!value) {
        return null;
      }
      const endpoints = getAllEndpoints();
      const method = detectHttpMethod(value);
      if (method) {
        const searchText = value.substring(method.length).trim();
        const filtered = filterEndpoints(value, endpoints);
        const paths = filtered.map(function(e) {
          return e.path;
        });
        return findAutocompleteSuggestion(searchText, paths);
      } else {
        const trimmedValue = value.trim();
        if (trimmedValue.startsWith("/")) {
          const filtered = filterEndpoints(value, endpoints);
          const paths = filtered.map(function(e) {
            return e.path;
          });
          return findAutocompleteSuggestion(trimmedValue, paths);
        } else {
          const allPaths = endpoints.map(function(e) {
            return e.method + " " + e.path;
          });
          return findAutocompleteSuggestion(value, allPaths);
        }
      }
    }
    function addSearchInput() {
      if (document.querySelector(".wrapper.swagger-search-wrapper")) {
        return;
      }
      const authWrapper = document.querySelector(
        "section.schemes.wrapper.block.col-12 .auth-wrapper"
      );
      if (!authWrapper) {
        return;
      }
      const wrapper = document.createElement("div");
      wrapper.className = "wrapper swagger-search-wrapper";
      const innerWrapper = document.createElement("div");
      innerWrapper.className = "swagger-search-inner-wrapper";
      const highlight = document.createElement("pre");
      highlight.className = "highlight";
      highlight.id = "swagger-search-hl";
      const input = document.createElement("input");
      input.type = "text";
      input.className = "swagger-search-input";
      input.placeholder = "Search endpoints (e.g., 'post /api' or '/api')";
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "swagger-search-clear-btn";
      clearButton.setAttribute("aria-label", "Clear search");
      const clearIcon = window.createIcon("x", {
        width: 16,
        height: 16
      });
      if (clearIcon) {
        clearIcon.style.color = "#8c959f";
        clearButton.appendChild(clearIcon);
      }
      function updateClearButton() {
        if (input.value && input.value.trim().length > 0) {
          clearButton.style.display = "flex";
        } else {
          clearButton.style.display = "none";
        }
      }
      clearButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        input.value = "";
        handleInput();
        input.focus();
      });
      function handleInput() {
        let value = input.value;
        const method = detectHttpMethod(value);
        if (method) {
          const methodInValue = value.substring(0, method.length);
          if (methodInValue !== method) {
            value = method + value.substring(method.length);
            input.value = value;
          }
        }
        updateHighlight(highlight, input, value);
        applyFilter(value);
        updateClearButton();
      }
      input.addEventListener("input", handleInput);
      input.addEventListener("keydown", function(e) {
        if (e.key === "Tab" || e.key === "Enter") {
          e.preventDefault();
          const value = input.value;
          const autocomplete = getAutocomplete(value);
          if (autocomplete) {
            const method = detectHttpMethod(value);
            let newValue;
            if (method) {
              const searchText = value.substring(method.length).trim();
              newValue = value.substring(0, method.length) + " " + searchText + autocomplete;
            } else {
              newValue = value + autocomplete;
            }
            input.value = newValue;
            handleInput();
            setTimeout(function() {
              input.setSelectionRange(newValue.length, newValue.length);
            }, 0);
          }
        } else if (e.key === "Escape") {
          input.value = "";
          handleInput();
          input.blur();
        }
      });
      innerWrapper.appendChild(highlight);
      innerWrapper.appendChild(input);
      innerWrapper.appendChild(clearButton);
      wrapper.appendChild(innerWrapper);
      const favoritesButton = authWrapper.querySelector(".favorites-filter-btn");
      const authorizeButton = authWrapper.querySelector(".btn.authorize");
      if (favoritesButton) {
        authWrapper.insertBefore(wrapper, favoritesButton);
      } else if (authorizeButton) {
        authWrapper.insertBefore(wrapper, authorizeButton);
      } else {
        authWrapper.appendChild(wrapper);
      }
      if (!hotkeyHandlerAdded) {
        let handleHotkey = function(e) {
          if ((e.ctrlKey || e.metaKey) && // Ctrl on Windows/Linux or Cmd on Mac
          e.shiftKey && e.key === "F") {
            const searchInput = document.querySelector(".swagger-search-input");
            if (searchInput && searchInput.offsetParent !== null) {
              e.preventDefault();
              e.stopPropagation();
              searchInput.focus();
              if (searchInput.value) {
                searchInput.select();
              }
            }
          }
        };
        document.addEventListener("keydown", handleHotkey);
        hotkeyHandlerAdded = true;
      }
    }
    function init() {
      function waitForSwaggerUI2() {
        const swaggerContainer = document.querySelector(".swagger-ui");
        if (swaggerContainer) {
          setTimeout(function() {
            addSearchInput();
            const observer = new MutationObserver(function() {
              clearTimeout(observer.timeout);
              observer.timeout = setTimeout(function() {
                if (!document.querySelector(".wrapper.swagger-search-wrapper")) {
                  addSearchInput();
                }
              }, 100);
            });
            observer.observe(swaggerContainer, {
              childList: true,
              subtree: true
            });
          }, 500);
        } else {
          setTimeout(waitForSwaggerUI2, 100);
        }
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", waitForSwaggerUI2);
      } else {
        waitForSwaggerUI2();
      }
    }
    window.SearchPlugin = {
      init,
      name: "search"
    };
  })();
  (function() {
    const STORAGE_KEY_SECTIONS = "swagger-sections-state";
    let schemasClosed = false;
    function closeSchemasSection() {
      if (schemasClosed) {
        return;
      }
      setTimeout(function() {
        const modelsControl2 = document.querySelector(".models-control");
        if (modelsControl2) {
          const isExpanded = modelsControl2.getAttribute("aria-expanded") === "true";
          if (isExpanded) {
            modelsControl2.click();
            schemasClosed = true;
          }
        }
      }, 100);
      const modelsControl = document.querySelector(".models-control");
      if (modelsControl) {
        const isExpanded = modelsControl.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
          modelsControl.click();
          schemasClosed = true;
        }
      } else {
        console.log("[UtilsPlugin] modelsControl not found");
      }
    }
    function restoreSectionsState(attempt = 0) {
      const closedSections = window.getStorageItem(STORAGE_KEY_SECTIONS, {});
      const sections = document.querySelectorAll(".opblock-tag-section");
      if (sections.length === 0 && attempt < 10) {
        setTimeout(function() {
          restoreSectionsState(attempt + 1);
        }, 200);
        return;
      }
      sections.forEach(function(section) {
        var _a;
        const tagElement = section.querySelector(".opblock-tag");
        if (!tagElement) {
          return;
        }
        const text = (_a = section.querySelector(".opblock-tag a")) == null ? void 0 : _a.textContent;
        if (!text) {
          return;
        }
        const isCurrentlyOpen = section.classList.contains("is-open");
        const shouldBeClosed = closedSections[text] === false;
        if (isCurrentlyOpen && shouldBeClosed) {
          tagElement.click();
        }
      });
    }
    function setupSectionsTracking() {
      const swaggerContainer = document.querySelector(".swagger-ui");
      if (!swaggerContainer) {
        return;
      }
      swaggerContainer.addEventListener(
        "click",
        function(e) {
          var _a;
          const section = e.target.closest(".opblock-tag-section");
          if (!section) {
            return;
          }
          const tagElement = section.querySelector(".opblock-tag");
          if (!tagElement || e.target !== tagElement && !tagElement.contains(e.target)) {
            return;
          }
          const text = (_a = section.querySelector(".opblock-tag a")) == null ? void 0 : _a.textContent;
          if (!text) {
            return;
          }
          setTimeout(function() {
            const isOpen = section.classList.contains("is-open");
            const closedSections = window.getStorageItem(
              STORAGE_KEY_SECTIONS,
              {}
            );
            if (isOpen) {
              delete closedSections[text];
            } else {
              closedSections[text] = false;
            }
            window.setStorageItem(STORAGE_KEY_SECTIONS, closedSections);
          }, 0);
        },
        true
      );
    }
    function init() {
      closeSchemasSection();
      restoreSectionsState();
      setupSectionsTracking();
    }
    window.UtilsPlugin = {
      init,
      name: "utils"
    };
  })();
  (function() {
    const textareaHandlers = /* @__PURE__ */ new WeakMap();
    const textareaOverlays = /* @__PURE__ */ new WeakMap();
    let openApiSpecCache = null;
    let openApiSpecPromise = null;
    function isRequestBodyElement(element, operationElement) {
      if (!element || !operationElement) return false;
      const responsesWrapper = operationElement.querySelector(".responses-wrapper");
      if (responsesWrapper && responsesWrapper.contains(element)) {
        return false;
      }
      const requestBodySection = element.closest(
        ".opblock-section-request-body, .request-body, .body-param"
      );
      if (requestBodySection) {
        return true;
      }
      if (responsesWrapper) {
        const allElements = Array.from(operationElement.querySelectorAll("*"));
        const elementIndex = allElements.indexOf(element);
        const responsesIndex = allElements.indexOf(responsesWrapper);
        if (elementIndex !== -1 && responsesIndex !== -1) {
          return elementIndex < responsesIndex;
        }
      }
      return false;
    }
    function validateJSON(text) {
      if (!text || !text.trim()) {
        return {
          valid: true,
          error: null,
          position: null,
          line: null,
          column: null
        };
      }
      try {
        JSON.parse(text);
        return {
          valid: true,
          error: null,
          position: null,
          line: null,
          column: null
        };
      } catch (e) {
        let position = null;
        let line = null;
        let column = null;
        const match = e.message.match(/position (\d+)/);
        if (match) {
          position = parseInt(match[1], 10);
          const textBeforeError = text.substring(0, position);
          const lines = textBeforeError.split("\n");
          line = lines.length;
          column = lines[lines.length - 1].length + 1;
        }
        return {
          valid: false,
          error: e.message,
          position,
          line,
          column
        };
      }
    }
    function findErrorRanges(text, errorPosition) {
      if (errorPosition === null || errorPosition === void 0 || errorPosition < 0 || errorPosition >= text.length) {
        return [];
      }
      let start = errorPosition;
      let end = errorPosition;
      if (/\s/.test(text[errorPosition])) {
        let leftPos = errorPosition;
        while (leftPos > 0 && /\s/.test(text[leftPos - 1])) {
          leftPos--;
        }
        let rightPos = errorPosition;
        while (rightPos < text.length && /\s/.test(text[rightPos])) {
          rightPos++;
        }
        if (leftPos > 0 && !/[{\[}\],:]/.test(text[leftPos - 1])) {
          start = leftPos;
          end = leftPos;
        } else if (rightPos < text.length && !/[{\[}\],:]/.test(text[rightPos])) {
          start = rightPos;
          end = rightPos;
        } else {
          return [
            {
              start: errorPosition,
              end: Math.min(errorPosition + 1, text.length)
            }
          ];
        }
      }
      while (start > 0 && !/[{\[}\],:\s\n\r\t]/.test(text[start - 1])) {
        start--;
      }
      while (end < text.length && !/[{\[}\],:\s\n\r\t]/.test(text[end])) {
        end++;
      }
      if (start === end) {
        end = Math.min(start + 1, text.length);
      }
      return [{ start, end }];
    }
    function resolveSchemaRef(ref, spec) {
      if (!ref || typeof ref !== "string") {
        return null;
      }
      if (ref.startsWith("#/components/schemas/")) {
        const schemaName = ref.replace("#/components/schemas/", "");
        if (spec.components && spec.components.schemas) {
          return spec.components.schemas[schemaName] || null;
        }
      } else if (ref.startsWith("#/definitions/")) {
        const schemaName = ref.replace("#/definitions/", "");
        if (spec.definitions) {
          return spec.definitions[schemaName] || null;
        }
      } else if (ref.startsWith("#/components/requestBodies/")) {
        const bodyName = ref.replace("#/components/requestBodies/", "");
        if (spec.components && spec.components.requestBodies) {
          const requestBody = spec.components.requestBodies[bodyName];
          if (requestBody && requestBody.content) {
            const jsonContent = requestBody.content["application/json"] || requestBody.content["application/*"] || requestBody.content["*/*"];
            return jsonContent ? jsonContent.schema : null;
          }
        }
      }
      return null;
    }
    function resolveSchema(schema, spec, visited = /* @__PURE__ */ new Set()) {
      if (!schema || typeof schema !== "object") {
        return schema;
      }
      const schemaKey = JSON.stringify(schema);
      if (visited.has(schemaKey)) {
        return schema;
      }
      visited.add(schemaKey);
      if (schema.$ref) {
        const resolved = resolveSchemaRef(schema.$ref, spec);
        if (resolved) {
          const merged = { ...resolved, ...schema };
          delete merged.$ref;
          return resolveSchema(merged, spec, visited);
        }
      }
      if (schema.properties) {
        const resolvedProperties = {};
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          resolvedProperties[key] = resolveSchema(propSchema, spec, visited);
        }
        schema = { ...schema, properties: resolvedProperties };
      }
      if (schema.items) {
        schema = { ...schema, items: resolveSchema(schema.items, spec, visited) };
      }
      if (schema.allOf && Array.isArray(schema.allOf)) {
        schema = {
          ...schema,
          allOf: schema.allOf.map((s) => resolveSchema(s, spec, visited))
        };
      }
      if (schema.oneOf && Array.isArray(schema.oneOf)) {
        schema = {
          ...schema,
          oneOf: schema.oneOf.map((s) => resolveSchema(s, spec, visited))
        };
      }
      if (schema.anyOf && Array.isArray(schema.anyOf)) {
        schema = {
          ...schema,
          anyOf: schema.anyOf.map((s) => resolveSchema(s, spec, visited))
        };
      }
      return schema;
    }
    async function loadOpenApiSpec() {
      if (openApiSpecCache) {
        return openApiSpecCache;
      }
      if (openApiSpecPromise) {
        return openApiSpecPromise;
      }
      const possiblePaths = [
        "openapi.json",
        "swagger.json",
        "/openapi.json",
        "/swagger.json",
        "./openapi.json",
        "./swagger.json"
      ];
      const currentUrl = new URL(window.location.href);
      const basePath = currentUrl.pathname.substring(
        0,
        currentUrl.pathname.lastIndexOf("/") + 1
      );
      possiblePaths.push(basePath + "openapi.json");
      possiblePaths.push(basePath + "swagger.json");
      if (window.ui && window.ui.specSelectors) {
        try {
          const url = window.ui.specSelectors.url ? window.ui.specSelectors.url() : null;
          if (url) {
            possiblePaths.unshift(url);
          }
        } catch (e) {
        }
      }
      openApiSpecPromise = (async () => {
        for (const path of possiblePaths) {
          try {
            const url = new URL(path, window.location.origin);
            const response = await fetch(url.toString(), {
              method: "GET",
              headers: {
                Accept: "application/json"
              }
            });
            if (response.ok) {
              const spec = await response.json();
              openApiSpecCache = spec;
              openApiSpecPromise = null;
              return spec;
            }
          } catch (e) {
            continue;
          }
        }
        openApiSpecPromise = null;
        console.warn(
          "[JSONValidationPlugin] Failed to load OpenAPI specification from any path"
        );
        return null;
      })();
      return openApiSpecPromise;
    }
    async function getRequestSchema(operationElement) {
      try {
        const spec = await loadOpenApiSpec();
        if (!spec || !spec.paths) {
          return null;
        }
        const pathElement = operationElement.querySelector(
          ".opblock-summary-path"
        );
        const methodElement = operationElement.querySelector(
          ".opblock-summary-method"
        );
        if (!pathElement || !methodElement) {
          return null;
        }
        const path = pathElement.textContent.trim();
        const method = methodElement.textContent.trim().toLowerCase();
        const pathSpec = spec.paths[path];
        if (!pathSpec || !pathSpec[method]) {
          return null;
        }
        const operation = pathSpec[method];
        if (!operation.requestBody) {
          return null;
        }
        let requestBody = operation.requestBody;
        if (requestBody.$ref) {
          const resolved = resolveSchemaRef(requestBody.$ref, spec);
          if (resolved) {
            requestBody = resolved;
          }
        }
        const content = requestBody.content;
        if (!content) {
          return null;
        }
        const jsonContent = content["application/json"] || content["application/*"] || content["*/*"];
        if (!jsonContent) {
          return null;
        }
        let schema = jsonContent.schema;
        if (!schema && jsonContent.schemaRef) {
          if (jsonContent.schemaRef.$ref) {
            schema = resolveSchemaRef(jsonContent.schemaRef.$ref, spec);
          } else {
            schema = jsonContent.schemaRef;
          }
        }
        if (schema) {
          schema = resolveSchema(schema, spec);
        }
        return schema || null;
      } catch (e) {
        console.warn("[JSONValidationPlugin] Error getting schema:", e);
        return null;
      }
    }
    function isTypeMatch(value, expectedType) {
      if (expectedType === "integer") {
        return typeof value === "number" && !isNaN(value) && isFinite(value) && Number.isInteger(value);
      }
      if (expectedType === "number") {
        return typeof value === "number" && !isNaN(value) && isFinite(value);
      }
      const actualType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
      return actualType === expectedType;
    }
    function validateSchema(data, schema) {
      const errors = [];
      if (!schema || typeof schema !== "object") {
        return errors;
      }
      if (schema.required && Array.isArray(schema.required)) {
        for (const field of schema.required) {
          if (!(field in data)) {
            errors.push({
              path: field,
              message: `Required field "${field}" is missing`
            });
          }
        }
      }
      if (schema.properties && typeof schema.properties === "object") {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (key in data) {
            const value = data[key];
            const valueType = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
            if (propSchema.type && !isTypeMatch(value, propSchema.type)) {
              if (!(value === null && propSchema.nullable)) {
                errors.push({
                  path: key,
                  message: `Field "${key}" must be of type ${propSchema.type}, got ${valueType}`
                });
              }
            }
            if (propSchema.type === "object" && propSchema.properties && valueType === "object" && value !== null) {
              const nestedErrors = validateSchema(value, propSchema);
              nestedErrors.forEach((error) => {
                errors.push({
                  path: `${key}.${error.path}`,
                  message: error.message
                });
              });
            }
            if (propSchema.type === "array" && propSchema.items) {
              if (Array.isArray(value)) {
                value.forEach((item, index) => {
                  if (propSchema.items.type) {
                    const itemType2 = Array.isArray(item) ? "array" : item === null ? "null" : typeof item;
                    if (!isTypeMatch(item, propSchema.items.type)) {
                      errors.push({
                        path: `${key}[${index}]`,
                        message: `Array element "${key}[${index}]" must be of type ${propSchema.items.type}, got ${itemType2}`
                      });
                    }
                  }
                  if (propSchema.items.type === "object" && propSchema.items.properties && itemType === "object" && item !== null) {
                    const nestedErrors = validateSchema(item, propSchema.items);
                    nestedErrors.forEach((error) => {
                      errors.push({
                        path: `${key}[${index}].${error.path}`,
                        message: error.message
                      });
                    });
                  }
                });
              }
            }
          }
        }
      }
      return errors;
    }
    function createJsonErrorElement(textarea) {
      const wrapper = textarea.closest(".json-validation-wrapper");
      const parent = wrapper || textarea.parentElement;
      let errorElement = parent.querySelector(".json-validation-error");
      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.className = "json-validation-error";
        parent.appendChild(errorElement);
      }
      return errorElement;
    }
    function createSchemaErrorElement(textarea) {
      const wrapper = textarea.closest(".json-validation-wrapper");
      const parent = wrapper || textarea.parentElement;
      let errorElement = parent.querySelector(".json-validation-schema-error");
      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.className = "json-validation-schema-error";
        parent.appendChild(errorElement);
      }
      return errorElement;
    }
    function removeErrorElement(textarea) {
      const wrapper = textarea.closest(".json-validation-wrapper");
      const parent = wrapper || textarea.parentElement;
      const jsonErrorElement = parent.querySelector(".json-validation-error");
      if (jsonErrorElement) {
        jsonErrorElement.remove();
      }
      const schemaErrorElement = parent.querySelector(
        ".json-validation-schema-error"
      );
      if (schemaErrorElement) {
        schemaErrorElement.remove();
      }
    }
    function highlightErrors(textarea, errorMessage, errorPosition) {
      if (errorMessage) {
        textarea.classList.add("json-validation-error-input");
      } else {
        textarea.classList.remove("json-validation-error-input");
      }
    }
    function findFieldPosition(text, path) {
      try {
        const data = JSON.parse(text);
        const pathParts = path.split(".");
        let current = data;
        let jsonPath = "";
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];
          const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
          if (arrayMatch) {
            const fieldName2 = arrayMatch[1];
            const index = parseInt(arrayMatch[2], 10);
            jsonPath += (jsonPath ? "." : "") + fieldName2;
            if (current && typeof current === "object" && fieldName2 in current) {
              current = current[fieldName2];
              if (Array.isArray(current) && current[index] !== void 0) {
                current = current[index];
                jsonPath += `[${index}]`;
              } else {
                return null;
              }
            } else {
              return null;
            }
          } else {
            jsonPath += (jsonPath ? "." : "") + part;
            if (current && typeof current === "object" && part in current) {
              current = current[part];
            } else {
              return null;
            }
          }
        }
        const fieldName = pathParts[pathParts.length - 1].replace(/\[\d+\]$/, "");
        const searchPattern = new RegExp(
          `"${fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*:`,
          "g"
        );
        let match;
        let lastMatch = null;
        while ((match = searchPattern.exec(text)) !== null) {
          lastMatch = match;
          const beforeMatch = text.substring(0, match.index);
          const openBraces = (beforeMatch.match(/{/g) || []).length;
          const closeBraces = (beforeMatch.match(/}/g) || []).length;
          const openBrackets = (beforeMatch.match(/\[/g) || []).length;
          const closeBrackets = (beforeMatch.match(/\]/g) || []).length;
          if (openBraces - closeBraces >= pathParts.length - 1) {
            let valueStart = match.index + match[0].length;
            while (valueStart < text.length && /\s/.test(text[valueStart])) {
              valueStart++;
            }
            let valueEnd = valueStart;
            if (text[valueStart] === '"') {
              valueEnd = text.indexOf('"', valueStart + 1);
              if (valueEnd !== -1) valueEnd++;
            } else if (text[valueStart] === "{") {
              let depth = 1;
              valueEnd = valueStart + 1;
              while (valueEnd < text.length && depth > 0) {
                if (text[valueEnd] === "{") depth++;
                else if (text[valueEnd] === "}") depth--;
                valueEnd++;
              }
            } else if (text[valueStart] === "[") {
              let depth = 1;
              valueEnd = valueStart + 1;
              while (valueEnd < text.length && depth > 0) {
                if (text[valueEnd] === "[") depth++;
                else if (text[valueEnd] === "]") depth--;
                valueEnd++;
              }
            } else {
              while (valueEnd < text.length && !/[,\]\}\s]/.test(text[valueEnd])) {
                valueEnd++;
              }
            }
            return {
              start: valueStart,
              end: valueEnd
            };
          }
        }
        if (lastMatch) {
          let valueStart = lastMatch.index + lastMatch[0].length;
          while (valueStart < text.length && /\s/.test(text[valueStart])) {
            valueStart++;
          }
          let valueEnd = valueStart;
          while (valueEnd < text.length && !/[,\]\}\s]/.test(text[valueEnd])) {
            valueEnd++;
          }
          return { start: valueStart, end: valueEnd };
        }
        return null;
      } catch (e) {
        return null;
      }
    }
    function updateOverlay(textarea, text, errorRanges, schemaErrors, errorType) {
      let overlay = textareaOverlays.get(textarea);
      if (!overlay) {
        return;
      }
      if (!text || !text.trim()) {
        overlay.innerHTML = "";
        return;
      }
      const highlightClass = errorType === "schema" ? "json-validation-schema-highlight" : "json-validation-highlight";
      let html = "";
      let lastIndex = 0;
      const allRanges = [...errorRanges];
      if (schemaErrors && schemaErrors.length > 0 && errorType === "schema") {
        for (const error of schemaErrors) {
          const position = findFieldPosition(text, error.path);
          if (position) {
            allRanges.push(position);
          }
        }
      }
      allRanges.sort((a, b) => a.start - b.start);
      const mergedRanges = [];
      for (const range of allRanges) {
        if (mergedRanges.length === 0) {
          mergedRanges.push({ start: range.start, end: range.end });
        } else {
          const last = mergedRanges[mergedRanges.length - 1];
          if (range.start <= last.end) {
            last.end = Math.max(last.end, range.end);
          } else {
            mergedRanges.push({ start: range.start, end: range.end });
          }
        }
      }
      for (const range of mergedRanges) {
        if (range.start > lastIndex) {
          const beforeText = escapeHtml(text.substring(lastIndex, range.start));
          html += beforeText;
        }
        const errorText = escapeHtml(text.substring(range.start, range.end));
        html += `<span class="${highlightClass}">${errorText}</span>`;
        lastIndex = range.end;
      }
      if (lastIndex < text.length) {
        const afterText = escapeHtml(text.substring(lastIndex));
        html += afterText;
      }
      overlay.innerHTML = html;
    }
    function createOverlay(textarea) {
      if (textareaOverlays.has(textarea)) {
        return;
      }
      let wrapper = textarea.parentElement.querySelector(
        ".json-validation-wrapper"
      );
      if (!wrapper) {
        wrapper = document.createElement("div");
        wrapper.className = "json-validation-wrapper";
        textarea.parentElement.insertBefore(wrapper, textarea);
        wrapper.appendChild(textarea);
      }
      const overlay = document.createElement("div");
      overlay.className = "json-validation-overlay";
      wrapper.appendChild(overlay);
      textareaOverlays.set(textarea, overlay);
      syncOverlayStyles(textarea, overlay);
      textarea.addEventListener("scroll", function() {
        overlay.scrollTop = textarea.scrollTop;
        overlay.scrollLeft = textarea.scrollLeft;
      });
      const resizeObserver = new ResizeObserver(function() {
        syncOverlayStyles(textarea, overlay);
      });
      resizeObserver.observe(textarea);
    }
    function syncOverlayStyles(textarea, overlay) {
      overlay.style.width = textarea.offsetWidth + "px";
      overlay.style.height = textarea.offsetHeight + "px";
    }
    function validateTextarea(textarea, operationElement) {
      const text = textarea.value;
      const jsonValidation = validateJSON(text);
      removeErrorElement(textarea);
      textarea.classList.remove("json-validation-error-input");
      createOverlay(textarea);
      const overlay = textareaOverlays.get(textarea);
      if (!text || !text.trim()) {
        if (overlay) {
          overlay.innerHTML = "";
        }
        return;
      }
      if (!jsonValidation.valid) {
        highlightErrors(textarea, jsonValidation.error, jsonValidation.position);
        const wrapper = textarea.closest(".json-validation-wrapper");
        const parent = wrapper || textarea.parentElement;
        const schemaErrorElement = parent.querySelector(
          ".json-validation-schema-error"
        );
        if (schemaErrorElement) {
          schemaErrorElement.remove();
        }
        const errorElement = createJsonErrorElement(textarea);
        errorElement.innerHTML = `
        <div class="json-validation-error-message">${escapeHtml(
          jsonValidation.error
        )}</div>
      `;
        if (overlay) {
          const errorRanges = findErrorRanges(text, jsonValidation.position);
          updateOverlay(textarea, text, errorRanges, [], "json");
        }
        return;
      }
      try {
        const data = JSON.parse(text);
        getRequestSchema(operationElement).then((schema) => {
          if (schema) {
            const schemaErrors = validateSchema(data, schema);
            if (schemaErrors.length > 0) {
              textarea.classList.add("json-validation-schema-error-input");
              const wrapper = textarea.closest(".json-validation-wrapper");
              const parent = wrapper || textarea.parentElement;
              const jsonErrorElement = parent.querySelector(
                ".json-validation-error"
              );
              if (jsonErrorElement) {
                jsonErrorElement.remove();
              }
              const errorElement = createSchemaErrorElement(textarea);
              const errorsHtml = schemaErrors.map(
                (error) => `<div class="json-validation-error-item">
                      <span class="json-validation-error-path">${escapeHtml(
                  error.path
                )}:</span>
                      <span class="json-validation-error-text">${escapeHtml(
                  error.message
                )}</span>
                    </div>`
              ).join("");
              errorElement.innerHTML = `
                <div class="json-validation-error-list">${errorsHtml}</div>
              `;
              if (overlay) {
                updateOverlay(textarea, text, [], schemaErrors, "schema");
              }
            } else {
              textarea.classList.remove("json-validation-schema-error-input");
              removeErrorElement(textarea);
              if (overlay) {
                overlay.innerHTML = "";
              }
            }
          } else {
            textarea.classList.remove("json-validation-schema-error-input");
            const wrapper = textarea.closest(".json-validation-wrapper");
            const parent = wrapper || textarea.parentElement;
            const schemaErrorElement = parent.querySelector(
              ".json-validation-schema-error"
            );
            if (schemaErrorElement) {
              schemaErrorElement.remove();
            }
            if (overlay) {
              overlay.innerHTML = "";
            }
          }
        }).catch((e) => {
          console.warn("[JSONValidationPlugin] Error validating schema:", e);
          if (overlay) {
            overlay.innerHTML = "";
          }
        });
      } catch (e) {
        console.warn("[JSONValidationPlugin] Unexpected error:", e);
        if (overlay) {
          overlay.innerHTML = "";
        }
      }
    }
    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
    function addValidationToTextarea(textarea, operationElement) {
      if (!isRequestBodyElement(textarea, operationElement)) {
        return;
      }
      if (textareaHandlers.has(textarea)) {
        return;
      }
      let timeoutId = null;
      const handler = function() {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function() {
          validateTextarea(textarea, operationElement);
        }, 300);
      };
      textarea.addEventListener("input", handler);
      textarea.addEventListener("change", handler);
      textareaHandlers.set(textarea, handler);
      if (textarea.value && textarea.value.trim()) {
        validateTextarea(textarea, operationElement);
      }
    }
    function processOperation(operationElement) {
      const textareas = operationElement.querySelectorAll("textarea");
      textareas.forEach(function(textarea) {
        addValidationToTextarea(textarea, operationElement);
      });
    }
    function processOperations() {
      const operations = document.querySelectorAll(".opblock");
      operations.forEach(function(operation) {
        processOperation(operation);
      });
    }
    function init() {
      let observer = null;
      let initTimeout = null;
      function initialize() {
        const swaggerContainer = document.querySelector(".swagger-ui");
        if (!swaggerContainer) {
          return;
        }
        processOperations();
        if (!observer) {
          observer = new MutationObserver(function() {
            clearTimeout(initTimeout);
            initTimeout = setTimeout(processOperations, 100);
          });
          observer.observe(swaggerContainer, {
            childList: true,
            subtree: true
          });
        }
      }
      function waitForSwaggerUI2() {
        const swaggerContainer = document.querySelector(".swagger-ui");
        if (swaggerContainer) {
          setTimeout(initialize, 300);
        } else {
          setTimeout(waitForSwaggerUI2, 100);
        }
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", waitForSwaggerUI2);
      } else {
        waitForSwaggerUI2();
      }
    }
    window.JSONValidationPlugin = {
      init,
      name: "json-validation"
    };
  })();
  (function() {
    const STORAGE_KEY = "request-timing-stats";
    const activeRequests = /* @__PURE__ */ new Map();
    function getEndpointId(url, method) {
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        return `${method.toUpperCase()}_${path}`;
      } catch (e) {
        return `${method.toUpperCase()}_${url}`;
      }
    }
    function getEndpointStats(endpointId) {
      const allStats = window.getStorageItem(STORAGE_KEY, {});
      return allStats[endpointId] || {
        requests: [],
        min: null,
        max: null,
        avg: null,
        last: null
      };
    }
    function clearEndpointStats(endpointId) {
      const allStats = window.getStorageItem(STORAGE_KEY, {});
      if (allStats[endpointId]) {
        delete allStats[endpointId];
        window.setStorageItem(STORAGE_KEY, allStats);
      }
    }
    function saveEndpointStats(endpointId, timingData) {
      const allStats = window.getStorageItem(STORAGE_KEY, {});
      let stats = allStats[endpointId] || { requests: [] };
      stats.requests.push(timingData);
      if (stats.requests.length > 100) {
        stats.requests = stats.requests.slice(-100);
      }
      const durations = stats.requests.map((r) => r.totalTime).filter((t) => t > 0);
      const dnsTimes = stats.requests.map((r) => r.dnsTime).filter((t) => t > 0);
      const tcpTimes = stats.requests.map((r) => r.tcpTime).filter((t) => t > 0);
      const tlsTimes = stats.requests.map((r) => r.tlsTime).filter((t) => t > 0);
      const requestTimes = stats.requests.map((r) => r.requestTime).filter((t) => t > 0);
      const responseTimes = stats.requests.map((r) => r.responseTime).filter((t) => t > 0);
      const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      stats.last = timingData;
      stats.min = {
        totalTime: durations.length > 0 ? Math.min(...durations) : null,
        dnsTime: dnsTimes.length > 0 ? Math.min(...dnsTimes) : null,
        tcpTime: tcpTimes.length > 0 ? Math.min(...tcpTimes) : null,
        tlsTime: tlsTimes.length > 0 ? Math.min(...tlsTimes) : null,
        requestTime: requestTimes.length > 0 ? Math.min(...requestTimes) : null,
        responseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : null
      };
      stats.max = {
        totalTime: durations.length > 0 ? Math.max(...durations) : null,
        dnsTime: dnsTimes.length > 0 ? Math.max(...dnsTimes) : null,
        tcpTime: tcpTimes.length > 0 ? Math.max(...tcpTimes) : null,
        tlsTime: tlsTimes.length > 0 ? Math.max(...tlsTimes) : null,
        requestTime: requestTimes.length > 0 ? Math.max(...requestTimes) : null,
        responseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : null
      };
      stats.avg = {
        totalTime: avg(durations),
        dnsTime: avg(dnsTimes),
        tcpTime: avg(tcpTimes),
        tlsTime: avg(tlsTimes),
        requestTime: avg(requestTimes),
        responseTime: avg(responseTimes)
      };
      allStats[endpointId] = stats;
      window.setStorageItem(STORAGE_KEY, allStats);
      return stats;
    }
    function getPerformanceTiming(url) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const entries = performance.getEntriesByType("resource");
          const sortedEntries = entries.filter((e) => e instanceof PerformanceResourceTiming).sort((a, b) => b.startTime - a.startTime);
          let entry = null;
          try {
            const urlObj = new URL(url);
            entry = sortedEntries.find((e) => {
              try {
                const eUrl = new URL(e.name);
                return eUrl.pathname === urlObj.pathname && eUrl.hostname === urlObj.hostname && (eUrl.port === urlObj.port || !eUrl.port && !urlObj.port);
              } catch {
                return false;
              }
            });
            if (!entry) {
              entry = sortedEntries.find((e) => {
                try {
                  const eUrl = new URL(e.name);
                  return eUrl.pathname === urlObj.pathname;
                } catch {
                  return e.name.includes(urlObj.pathname);
                }
              });
            }
          } catch (e) {
            entry = sortedEntries.find(
              (e2) => e2.name === url || e2.name.includes(url)
            );
          }
          if (entry && entry instanceof PerformanceResourceTiming) {
            const timing = {
              dnsTime: Math.max(
                0,
                entry.domainLookupEnd - entry.domainLookupStart
              ),
              tcpTime: Math.max(0, entry.connectEnd - entry.connectStart),
              tlsTime: entry.secureConnectionStart > 0 ? Math.max(0, entry.connectEnd - entry.secureConnectionStart) : 0,
              requestTime: Math.max(0, entry.responseStart - entry.requestStart),
              responseTime: Math.max(0, entry.responseEnd - entry.responseStart),
              totalTime: Math.max(0, entry.responseEnd - entry.fetchStart),
              transferSize: entry.transferSize || 0,
              encodedBodySize: entry.encodedBodySize || 0,
              decodedBodySize: entry.decodedBodySize || 0
            };
            resolve(timing);
          } else {
            resolve(null);
          }
        }, 200);
      });
    }
    function interceptFetch() {
      const originalFetch = window.fetch;
      window.fetch = async function(...args) {
        var _a;
        const url = typeof args[0] === "string" ? args[0] : args[0].url;
        const method = ((_a = args[1]) == null ? void 0 : _a.method) || "GET";
        if (url.includes("swagger.json") || url.includes("openapi.json")) {
          return originalFetch.apply(this, args);
        }
        const requestId = `${method}_${url}_${Date.now()}`;
        const startTime = performance.now();
        activeRequests.set(requestId, {
          url,
          method,
          startTime,
          requestId
        });
        try {
          const response = await originalFetch.apply(this, args);
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);
          const status = response.status;
          const contentType = response.headers.get("content-type") || "";
          const perfTiming = await getPerformanceTiming(url);
          const timingData = perfTiming || {
            dnsTime: 0,
            tcpTime: 0,
            tlsTime: 0,
            requestTime: 0,
            responseTime: duration,
            totalTime: duration,
            transferSize: 0,
            encodedBodySize: 0,
            decodedBodySize: 0
          };
          const endpointId = getEndpointId(url, method);
          const stats = saveEndpointStats(endpointId, timingData);
          const requestInfo = activeRequests.get(requestId);
          if (requestInfo) {
            requestInfo.endTime = endTime;
            requestInfo.duration = duration;
            requestInfo.status = status;
            requestInfo.contentType = contentType;
            requestInfo.timingData = timingData;
            requestInfo.stats = stats;
            requestInfo.endpointId = endpointId;
            displayRequestAnalytics(requestInfo);
          }
          return response;
        } catch (error) {
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);
          const requestInfo = activeRequests.get(requestId);
          if (requestInfo) {
            requestInfo.endTime = endTime;
            requestInfo.duration = duration;
            requestInfo.error = error.message;
            displayRequestAnalytics(requestInfo);
          }
          throw error;
        } finally {
          setTimeout(() => {
            activeRequests.delete(requestId);
          }, 5e3);
        }
      };
    }
    function formatDuration(ms) {
      if (ms === null || ms === void 0 || ms < 0) return "N/A";
      if (ms < 1) return `${ms.toFixed(1)} ms`;
      if (ms < 1e3) return `${Math.round(ms)} ms`;
      return `${(ms / 1e3).toFixed(2)} с`;
    }
    function formatTimingData(data) {
      if (!data) return "<span>N/A</span>";
      const parts = [];
      const titles = {
        responseTime: "Time to load the response body (from first to last byte)",
        dnsTime: "Time for DNS name resolution to IP address",
        tcpTime: "Time to establish TCP connection (handshake)",
        tlsTime: "Time for TLS/SSL handshake for HTTPS connection",
        requestTime: "Time from starting the request to receiving the first byte of the response (TTFB)",
        totalTime: "Total request time from start to complete finish"
      };
      if (data.dnsTime !== null && data.dnsTime !== void 0 && data.dnsTime > 0) {
        parts.push(
          `<span title="${titles.dnsTime}">DNS Lookup: <span class="headerline">${formatDuration(
            data.dnsTime
          )}</span></span>`
        );
      }
      if (data.tcpTime !== null && data.tcpTime !== void 0 && data.tcpTime > 0) {
        parts.push(
          `<span title="${titles.tcpTime}">TCP Connection: <span class="headerline">${formatDuration(
            data.tcpTime
          )}</span></span>`
        );
      }
      if (data.tlsTime !== null && data.tlsTime !== void 0 && data.tlsTime > 0) {
        parts.push(
          `<span title="${titles.tlsTime}">TLS Handshake: <span class="headerline">${formatDuration(
            data.tlsTime
          )}</span></span>`
        );
      }
      if (data.requestTime !== null && data.requestTime !== void 0 && data.requestTime > 0) {
        parts.push(
          `<span title="${titles.requestTime}">Request (TTFB): <span class="headerline">${formatDuration(
            data.requestTime
          )}</span></span>`
        );
      }
      if (data.responseTime !== null && data.responseTime !== void 0) {
        parts.push(
          `<span title="${titles.responseTime}">Response (Data Transfer): <span class="headerline">${formatDuration(
            data.responseTime
          )}</span></span>`
        );
      }
      if (data.totalTime !== null && data.totalTime !== void 0) {
        parts.push(
          `<span title="${titles.totalTime}">Total Time: <span class="headerline">${formatDuration(
            data.totalTime
          )}</span></span>`
        );
      }
      return parts.length > 0 ? parts.join("\n") : "<span>N/A</span>";
    }
    function formatMinAvgMax(minData, avgData, maxData) {
      if (!minData || !avgData || !maxData) return "<span>N/A</span>";
      const parts = [];
      const titles = {
        responseTime: "Time to load the response body (from first to last byte)",
        dnsTime: "Time for DNS name resolution to IP address",
        tcpTime: "Time to establish TCP connection (handshake)",
        tlsTime: "Time for TLS/SSL handshake for HTTPS connection",
        requestTime: "Time from starting the request to receiving the first byte of the response (TTFB)",
        totalTime: "Total request time from start to complete finish"
      };
      if (minData.dnsTime !== null && minData.dnsTime !== void 0 && minData.dnsTime > 0) {
        parts.push(
          `<span title="${titles.dnsTime}">DNS Lookup: <span class="headerline">${formatDuration(
            minData.dnsTime
          )}</span> / <span class="headerline">${formatDuration(
            avgData.dnsTime
          )}</span> / <span class="headerline">${formatDuration(
            maxData.dnsTime
          )}</span></span>`
        );
      }
      if (minData.tcpTime !== null && minData.tcpTime !== void 0 && minData.tcpTime > 0) {
        parts.push(
          `<span title="${titles.tcpTime}">TCP Connection: <span class="headerline">${formatDuration(
            minData.tcpTime
          )}</span> / <span class="headerline">${formatDuration(
            avgData.tcpTime
          )}</span> / <span class="headerline">${formatDuration(
            maxData.tcpTime
          )}</span></span>`
        );
      }
      if (minData.tlsTime !== null && minData.tlsTime !== void 0 && minData.tlsTime > 0) {
        parts.push(
          `<span title="${titles.tlsTime}">TLS Handshake: <span class="headerline">${formatDuration(
            minData.tlsTime
          )}</span> / <span class="headerline">${formatDuration(
            avgData.tlsTime
          )}</span> / <span class="headerline">${formatDuration(
            maxData.tlsTime
          )}</span></span>`
        );
      }
      if (minData.requestTime !== null && minData.requestTime !== void 0 && minData.requestTime > 0) {
        parts.push(
          `<span title="${titles.requestTime}">Request (TTFB): <span class="headerline">${formatDuration(
            minData.requestTime
          )}</span> / <span class="headerline">${formatDuration(
            avgData.requestTime
          )}</span> / <span class="headerline">${formatDuration(
            maxData.requestTime
          )}</span></span>`
        );
      }
      if (minData.responseTime !== null && minData.responseTime !== void 0) {
        parts.push(
          `<span title="${titles.responseTime}">Response (Data Transfer): <span class="headerline">${formatDuration(
            minData.responseTime
          )}</span> / <span class="headerline">${formatDuration(
            avgData.responseTime
          )}</span> / <span class="headerline">${formatDuration(
            maxData.responseTime
          )}</span></span>`
        );
      }
      if (minData.totalTime !== null && minData.totalTime !== void 0) {
        parts.push(
          `<span title="${titles.totalTime}">Total Time: <span class="headerline">${formatDuration(
            minData.totalTime
          )}</span> / <span class="headerline">${formatDuration(
            avgData.totalTime
          )}</span> / <span class="headerline">${formatDuration(
            maxData.totalTime
          )}</span></span>`
        );
      }
      return parts.length > 0 ? parts.join("\n") : "<span>N/A</span>";
    }
    function displayRequestAnalytics(requestInfo) {
      let attempts = 0;
      const maxAttempts = 10;
      const delay = 100;
      function tryDisplay() {
        attempts++;
        const activeOperation = document.querySelector(".opblock.is-open");
        if (!activeOperation) {
          if (attempts < maxAttempts) {
            setTimeout(tryDisplay, delay);
          }
          return;
        }
        const responsesTable = activeOperation.querySelector(
          "table.responses-table.live-responses-table"
        );
        if (!responsesTable) {
          if (attempts < maxAttempts) {
            setTimeout(tryDisplay, delay);
          }
          return;
        }
        const responseCol = responsesTable.querySelector(
          "tbody td.response-col_description"
        );
        if (!responseCol) {
          if (attempts < maxAttempts) {
            setTimeout(tryDisplay, delay);
          }
          return;
        }
        let analyticsBlock = responseCol.querySelector(
          ".request-timing-analytics"
        );
        if (!analyticsBlock) {
          analyticsBlock = document.createElement("div");
          analyticsBlock.className = "request-timing-analytics";
          const lastDiv = responseCol.querySelector("div:last-of-type");
          if (lastDiv) {
            responseCol.insertBefore(analyticsBlock, lastDiv.nextSibling);
          } else {
            responseCol.appendChild(analyticsBlock);
          }
        }
        const stats = requestInfo.stats || getEndpointStats(requestInfo.endpointId);
        const endpointId = requestInfo.endpointId;
        let html = `
        <div class="request-timing-analytics-column">
          <h5>Last Request</h5>
          <pre class="microlight">
${formatTimingData(stats.last)}
          </pre>
        </div>
        <div class="request-timing-analytics-column">
          <h5>Min / Average / Max <button class="request-timing-clear-btn" data-endpoint-id="${endpointId}" title="Clear analytics for this endpoint">Clear</button></h5>
          <pre class="microlight">
${formatMinAvgMax(stats.min, stats.avg, stats.max)}
          </pre>
        </div>
      `;
        analyticsBlock.innerHTML = html;
        const clearButtons = analyticsBlock.querySelectorAll(
          ".request-timing-clear-btn"
        );
        clearButtons.forEach((button) => {
          button.addEventListener("click", function(e) {
            e.stopPropagation();
            const endpointIdToClear = button.getAttribute("data-endpoint-id");
            if (endpointIdToClear) {
              clearEndpointStats(endpointIdToClear);
              if (analyticsBlock && analyticsBlock.parentNode) {
                analyticsBlock.parentNode.removeChild(analyticsBlock);
              }
            }
          });
        });
      }
      setTimeout(tryDisplay, 100);
    }
    function init() {
      interceptFetch();
    }
    window.RequestTimingPlugin = {
      init,
      name: "request-timing"
    };
  })();
  function injectCss(css) {
    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }
  injectCss(petodoCss);
  const PLUGINS = [
    { id: "copy-compact", name: "CopyCompactPlugin" },
    { id: "favorites", name: "FavoritesPlugin" },
    { id: "search", name: "SearchPlugin" },
    { id: "utils", name: "UtilsPlugin" },
    { id: "json-validation", name: "JSONValidationPlugin" },
    { id: "request-timing", name: "RequestTimingPlugin" }
  ];
  function initPlugins() {
    const hasSwagger = !!document.getElementById("swagger-ui");
    if (!hasSwagger) {
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
  function waitForSwaggerUI() {
    if (window.__petodoSwaggerInitialized) {
      return;
    }
    const MAX_WAIT_TIME = 3e3;
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
      if (window.__petodoSwaggerInitialized) {
        cleanup();
        return;
      }
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime >= MAX_WAIT_TIME) {
        cleanup();
        return;
      }
      if (initPlugins()) {
        console.log("[Petodo Swagger] Utils successfully initialized");
        window.__petodoSwaggerInitialized = true;
        cleanup();
        return;
      }
    };
    observer = new MutationObserver(() => {
      checkForSwagger();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
    timeoutId = setTimeout(() => {
      checkForSwagger();
      intervalId = setInterval(() => {
        checkForSwagger();
      }, CHECK_INTERVAL);
    }, INITIAL_DELAY);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForSwaggerUI);
  } else {
    waitForSwaggerUI();
  }
})();
