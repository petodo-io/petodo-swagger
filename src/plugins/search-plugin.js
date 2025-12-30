// Swagger UI plugin for endpoint search
(function () {
  "use strict";

  // Flag to track hotkey handler addition
  let hotkeyHandlerAdded = false;

  // HTTP method colors (from standard Swagger UI styles)
  const METHOD_COLORS = {
    get: "#61affe",
    post: "#49cc90",
    put: "#fca130",
    patch: "#50e3c2",
    delete: "#f93e3e",
    head: "#9012fe",
    options: "#0d5aa7",
  };

  function getAllEndpoints() {
    const operations = document.querySelectorAll(".opblock");
    const endpoints = [];

    operations.forEach(function (operation) {
      const methodElement = operation.querySelector(".opblock-summary-method");
      const pathElement = operation.querySelector(".opblock-summary-path");

      if (methodElement && pathElement) {
        const method = methodElement.textContent.trim().toUpperCase();
        const path = pathElement.textContent.trim();
        endpoints.push({
          element: operation,
          method: method,
          path: path,
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
      "OPTIONS",
    ];
    const upperText = text.toUpperCase();
    for (let method of methods) {
      if (upperText.startsWith(method)) {
        // Check that after method there is a space or end of string
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

    // Find all paths that start with input
    const matchingPaths = paths.filter(function (path) {
      return path.toLowerCase().startsWith(input.toLowerCase());
    });

    if (matchingPaths.length === 0) {
      return null;
    }

    // Take first matching path
    const firstPath = matchingPaths[0];

    // If there is only one path, return its continuation until next /
    if (matchingPaths.length === 1) {
      const nextSlash = firstPath.indexOf("/", input.length);
      if (nextSlash !== -1) {
        return firstPath.substring(input.length, nextSlash + 1);
      }
      return firstPath.substring(input.length);
    }

    // If multiple paths, find common prefix until next /
    let commonPrefix = matchingPaths[0];
    for (let i = 1; i < matchingPaths.length; i++) {
      const path = matchingPaths[i];
      let j = input.length;
      const minLen = Math.min(commonPrefix.length, path.length);
      while (
        j < minLen &&
        commonPrefix[j].toLowerCase() === path[j].toLowerCase()
      ) {
        j++;
      }
      commonPrefix = commonPrefix.substring(0, j);
    }

    // If common prefix is longer than input, find next / in common prefix
    if (commonPrefix.length > input.length) {
      const continuation = commonPrefix.substring(input.length);
      const nextSlash = continuation.indexOf("/");
      if (nextSlash !== -1) {
        // Return until next / inclusive
        return continuation.substring(0, nextSlash + 1);
      }
      // If / is not in common prefix, return entire common prefix
      return continuation;
    }

    // If common prefix equals input, take first path and return until its next /
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

    // Check if query starts with method
    const detectedMethod = detectHttpMethod(query);
    if (detectedMethod) {
      method = detectedMethod;
      // Remove method from search text
      searchText = query.substring(detectedMethod.length).trim();
    }

    return endpoints.filter(function (endpoint) {
      // If method is specified, check it
      if (method && endpoint.method !== method) {
        return false;
      }

      // If there is no text to search, return all with needed method
      if (!searchText) {
        return true;
      }

      // Search by path
      const pathLower = endpoint.path.toLowerCase();
      return pathLower.includes(searchText);
    });
  }

  function updateHighlight(highlightElement, inputElement, value) {
    if (!value) {
      highlightElement.innerHTML = "";
      return;
    }

    // Detect method
    const method = detectHttpMethod(value);
    let html = "";
    let remainingText = value;

    if (method) {
      // Highlight method (always uppercase)
      const methodColor = METHOD_COLORS[method.toLowerCase()] || "#000";
      const methodText = method.toUpperCase(); // Use method in uppercase
      html += `<span style="color: ${methodColor}; font-weight: 600;">${escapeHtml(
        methodText
      )}</span>`;
      remainingText = value.substring(method.length);
    }

    // Get all endpoints for autocomplete
    const endpoints = getAllEndpoints();
    const filteredEndpoints = filterEndpoints(value, endpoints);
    const paths = filteredEndpoints.map(function (e) {
      return e.path;
    });

    // Find autocomplete
    if (method) {
      // If there is method, search by path
      // Use trim() only for autocomplete search, but preserve spaces for display
      const searchText = remainingText.trim();
      const suggestion = findAutocompleteSuggestion(searchText, paths);
      if (suggestion) {
        // Display remainingText preserving spaces, then suggestion
        html += escapeHtml(remainingText);
        html += `<span style="color: #999;">${escapeHtml(suggestion)}</span>`;
      } else {
        html += escapeHtml(remainingText);
      }
    } else {
      // If no method, check if input starts with /
      const trimmedValue = value.trim();
      if (trimmedValue.startsWith("/")) {
        // If starts with /, search only by path
        const suggestion = findAutocompleteSuggestion(trimmedValue, paths);
        if (suggestion) {
          html += escapeHtml(value);
          html += `<span style="color: #999;">${escapeHtml(suggestion)}</span>`;
        } else {
          html += escapeHtml(value);
        }
      } else {
        // If doesn't start with /, search by full path (method + path)
        const allPaths = endpoints.map(function (e) {
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

    endpoints.forEach(function (endpoint) {
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
      // If there is method, search by path
      const searchText = value.substring(method.length).trim();
      const filtered = filterEndpoints(value, endpoints);
      const paths = filtered.map(function (e) {
        return e.path;
      });
      return findAutocompleteSuggestion(searchText, paths);
    } else {
      // If no method, search by path (if input starts with /) or by full path
      const trimmedValue = value.trim();
      if (trimmedValue.startsWith("/")) {
        // If starts with /, search only by path
        const filtered = filterEndpoints(value, endpoints);
        const paths = filtered.map(function (e) {
          return e.path;
        });
        return findAutocompleteSuggestion(trimmedValue, paths);
      } else {
        // If doesn't start with /, search by full path (method + path)
        const allPaths = endpoints.map(function (e) {
          return e.method + " " + e.path;
        });
        return findAutocompleteSuggestion(value, allPaths);
      }
    }
  }

  function addSearchInput() {
    // Check if input is already added
    if (document.querySelector(".wrapper.swagger-search-wrapper")) {
      return;
    }

    // Find element for insertion (same authWrapper as for favorites)
    const authWrapper = document.querySelector(
      "section.schemes.wrapper.block.col-12 .auth-wrapper"
    );
    if (!authWrapper) {
      return;
    }

    // Create search container
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper swagger-search-wrapper";

    // Create inner wrapper for highlighting (use same class for compatibility)
    const innerWrapper = document.createElement("div");
    innerWrapper.className = "swagger-search-inner-wrapper";

    // Create pre for highlighting
    const highlight = document.createElement("pre");
    highlight.className = "highlight";
    highlight.id = "swagger-search-hl";

    // Create input
    const input = document.createElement("input");
    input.type = "text";
    input.className = "swagger-search-input";
    input.placeholder = "Search endpoints (e.g., 'post /api' or '/api')";

    // Create clear button
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "swagger-search-clear-btn";
    clearButton.setAttribute("aria-label", "Clear search");

    const clearIcon = window.createIcon("x", {
      width: 16,
      height: 16,
    });
    if (clearIcon) {
      clearIcon.style.color = "#8c959f";
      clearButton.appendChild(clearIcon);
    }

    // Function to update clear button visibility
    function updateClearButton() {
      if (input.value && input.value.trim().length > 0) {
        clearButton.style.display = "flex";
      } else {
        clearButton.style.display = "none";
      }
    }

    // Clear button click handler
    clearButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      input.value = "";
      handleInput();
      input.focus();
    });

    // Input handler
    function handleInput() {
      let value = input.value;

      // Convert method to uppercase if it's at the beginning
      const method = detectHttpMethod(value);
      if (method) {
        const methodInValue = value.substring(0, method.length);
        if (methodInValue !== method) {
          // Replace method with uppercase
          value = method + value.substring(method.length);
          input.value = value;
        }
      }

      updateHighlight(highlight, input, value);
      applyFilter(value);
      updateClearButton();
    }

    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        const value = input.value;
        const autocomplete = getAutocomplete(value);

        if (autocomplete) {
          const method = detectHttpMethod(value);
          let newValue;
          if (method) {
            const searchText = value.substring(method.length).trim();
            newValue =
              value.substring(0, method.length) +
              " " +
              searchText +
              autocomplete;
          } else {
            newValue = value + autocomplete;
          }
          input.value = newValue;
          handleInput();
          // Set cursor to end
          setTimeout(function () {
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

    // Insert before favorites button (or before authorize if favorites doesn't exist)
    const favoritesButton = authWrapper.querySelector(".favorites-filter-btn");
    const authorizeButton = authWrapper.querySelector(".btn.authorize");

    if (favoritesButton) {
      authWrapper.insertBefore(wrapper, favoritesButton);
    } else if (authorizeButton) {
      authWrapper.insertBefore(wrapper, authorizeButton);
    } else {
      authWrapper.appendChild(wrapper);
    }

    // Add hotkey handler Ctrl+Shift+F to focus search field
    // (only once)
    if (!hotkeyHandlerAdded) {
      function handleHotkey(e) {
        // Check Ctrl+Shift+F combination
        if (
          (e.ctrlKey || e.metaKey) && // Ctrl on Windows/Linux or Cmd on Mac
          e.shiftKey &&
          e.key === "F"
        ) {
          // Find search field
          const searchInput = document.querySelector(".swagger-search-input");
          // Check that search field exists and is visible
          if (searchInput && searchInput.offsetParent !== null) {
            e.preventDefault();
            e.stopPropagation();
            searchInput.focus();
            // Select all text if it exists
            if (searchInput.value) {
              searchInput.select();
            }
          }
        }
      }

      // Add handler at document level
      document.addEventListener("keydown", handleHotkey);
      hotkeyHandlerAdded = true;
    }
  }

  function init() {
    // Wait for Swagger UI to load
    function waitForSwaggerUI() {
      const swaggerContainer = document.querySelector(".swagger-ui");
      if (swaggerContainer) {
        // Small delay for full Swagger UI initialization
        setTimeout(function () {
          addSearchInput();

          // Use MutationObserver to track dynamic changes
          const observer = new MutationObserver(function () {
            // Debounce to avoid excessive calls
            clearTimeout(observer.timeout);
            observer.timeout = setTimeout(function () {
              if (!document.querySelector(".wrapper.swagger-search-wrapper")) {
                addSearchInput();
              }
            }, 100);
          });

          // Observe changes in Swagger UI container
          observer.observe(swaggerContainer, {
            childList: true,
            subtree: true,
          });
        }, 500);
      } else {
        // If Swagger UI is not loaded yet, wait
        setTimeout(waitForSwaggerUI, 100);
      }
    }

    // Handle on load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", waitForSwaggerUI);
    } else {
      waitForSwaggerUI();
    }
  }

  // Export initialization function
  window.SearchPlugin = {
    init: init,
    name: "search",
  };
})();
