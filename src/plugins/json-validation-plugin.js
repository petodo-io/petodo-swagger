// JSON validation plugin for Swagger UI
(function () {
  "use strict";

  // Storage for textarea handlers
  const textareaHandlers = new WeakMap();
  // Storage for overlay elements
  const textareaOverlays = new WeakMap();

  function isRequestBodyElement(element, operationElement) {
    if (!element || !operationElement) return false;

    // Check that element is not in responses section
    const responsesWrapper =
      operationElement.querySelector(".responses-wrapper");
    if (responsesWrapper && responsesWrapper.contains(element)) {
      return false;
    }

    // Check that element is in request body section
    const requestBodySection = element.closest(
      ".opblock-section-request-body, .request-body, .body-param"
    );
    if (requestBodySection) {
      return true;
    }

    // Check that element is before responses
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
        column: null,
      };
    }

    try {
      JSON.parse(text);
      return {
        valid: true,
        error: null,
        position: null,
        line: null,
        column: null,
      };
    } catch (e) {
      // Try to extract error position from message
      let position = null;
      let line = null;
      let column = null;

      const match = e.message.match(/position (\d+)/);
      if (match) {
        position = parseInt(match[1], 10);
        // Calculate line and column
        const textBeforeError = text.substring(0, position);
        const lines = textBeforeError.split("\n");
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      return {
        valid: false,
        error: e.message,
        position: position,
        line: line,
        column: column,
      };
    }
  }

  function findErrorRanges(text, errorPosition) {
    if (
      errorPosition === null ||
      errorPosition === undefined ||
      errorPosition < 0 ||
      errorPosition >= text.length
    ) {
      return [];
    }

    // Find start and end of problematic token
    let start = errorPosition;
    let end = errorPosition;

    // If position points to whitespace or newline, find nearest token
    if (/\s/.test(text[errorPosition])) {
      // Search for token on the left
      let leftPos = errorPosition;
      while (leftPos > 0 && /\s/.test(text[leftPos - 1])) {
        leftPos--;
      }
      // Search for token on the right
      let rightPos = errorPosition;
      while (rightPos < text.length && /\s/.test(text[rightPos])) {
        rightPos++;
      }

      // Choose nearest token
      if (leftPos > 0 && !/[{\[}\],:]/.test(text[leftPos - 1])) {
        start = leftPos;
        end = leftPos;
      } else if (rightPos < text.length && !/[{\[}\],:]/.test(text[rightPos])) {
        start = rightPos;
        end = rightPos;
      } else {
        // If token not found, highlight current position
        return [
          {
            start: errorPosition,
            end: Math.min(errorPosition + 1, text.length),
          },
        ];
      }
    }

    // Find token start (search backwards until whitespace, comma, bracket, etc.)
    while (start > 0 && !/[{\[}\],:\s\n\r\t]/.test(text[start - 1])) {
      start--;
    }

    // Find token end
    while (end < text.length && !/[{\[}\],:\s\n\r\t]/.test(text[end])) {
      end++;
    }

    // If token not found, highlight at least one character
    if (start === end) {
      end = Math.min(start + 1, text.length);
    }

    return [{ start: start, end: end }];
  }

  function getRequestSchema(operationElement) {
    // Try to get schema via Swagger UI API
    try {
      let spec = null;

      // Try different ways to get specification
      if (window.ui && window.ui.specSelectors) {
        if (typeof window.ui.specSelectors.specJson === "function") {
          spec = window.ui.specSelectors.specJson();
        } else if (
          window.ui.specSelectors.spec &&
          typeof window.ui.specSelectors.spec === "function"
        ) {
          spec = window.ui.specSelectors.spec();
        }
      }

      // Alternative way via window.ui.getSystem()
      if (!spec && window.ui && window.ui.getSystem) {
        try {
          const system = window.ui.getSystem();
          if (system && system.specSelectors) {
            if (typeof system.specSelectors.specJson === "function") {
              spec = system.specSelectors.specJson();
            } else if (
              system.specSelectors.spec &&
              typeof system.specSelectors.spec === "function"
            ) {
              spec = system.specSelectors.spec();
            }
          }
        } catch (e) {
          // Ignore errors
        }
      }

      if (!spec || !spec.paths) {
        return null;
      }

      // Find path and method
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

      // Find operation in specification
      const pathSpec = spec.paths[path];
      if (!pathSpec || !pathSpec[method]) {
        return null;
      }

      const operation = pathSpec[method];
      if (!operation.requestBody) {
        return null;
      }

      // Get schema from content
      const content = operation.requestBody.content;
      if (!content) {
        return null;
      }

      // Look for application/json or */*
      const jsonContent =
        content["application/json"] ||
        content["application/*"] ||
        content["*/*"];
      if (!jsonContent) {
        return null;
      }

      // Get schema directly or via $ref
      let schema = jsonContent.schema;
      if (!schema && jsonContent.schemaRef) {
        // Try to resolve schema reference
        const ref = jsonContent.schemaRef.$ref;
        if (ref && ref.startsWith("#/components/schemas/")) {
          const schemaName = ref.replace("#/components/schemas/", "");
          if (spec.components && spec.components.schemas) {
            schema = spec.components.schemas[schemaName];
          }
        }
      }

      // If schema references another schema via $ref
      if (schema && schema.$ref) {
        const ref = schema.$ref;
        if (ref.startsWith("#/components/schemas/")) {
          const schemaName = ref.replace("#/components/schemas/", "");
          if (spec.components && spec.components.schemas) {
            schema = spec.components.schemas[schemaName];
          }
        } else if (ref.startsWith("#/definitions/")) {
          // OpenAPI 2.0 uses definitions instead of components/schemas
          const schemaName = ref.replace("#/definitions/", "");
          if (spec.definitions) {
            schema = spec.definitions[schemaName];
          }
        }
      }

      return schema || null;
    } catch (e) {
      console.warn("[JSONValidationPlugin] Error getting schema:", e);
      return null;
    }
  }

  function validateSchema(data, schema) {
    const errors = [];

    if (!schema || typeof schema !== "object") {
      return errors;
    }

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push({
            path: field,
            message: `Required field "${field}" is missing`,
          });
        }
      }
    }

    // Check properties
    if (schema.properties && typeof schema.properties === "object") {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in data) {
          const value = data[key];
          const valueType = Array.isArray(value)
            ? "array"
            : value === null
            ? "null"
            : typeof value;

          // Check type
          if (propSchema.type && propSchema.type !== valueType) {
            // Exception: null can be allowed if nullable: true
            if (!(value === null && propSchema.nullable)) {
              errors.push({
                path: key,
                message: `Field "${key}" must be of type ${propSchema.type}, got ${valueType}`,
              });
            }
          }

          // Recursive check for nested objects
          if (
            propSchema.type === "object" &&
            propSchema.properties &&
            valueType === "object" &&
            value !== null
          ) {
            const nestedErrors = validateSchema(value, propSchema);
            nestedErrors.forEach((error) => {
              errors.push({
                path: `${key}.${error.path}`,
                message: error.message,
              });
            });
          }

          // Check arrays
          if (propSchema.type === "array" && propSchema.items) {
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (propSchema.items.type) {
                  const itemType = Array.isArray(item)
                    ? "array"
                    : item === null
                    ? "null"
                    : typeof item;
                  if (itemType !== propSchema.items.type) {
                    errors.push({
                      path: `${key}[${index}]`,
                      message: `Array element "${key}[${index}]" must be of type ${propSchema.items.type}, got ${itemType}`,
                    });
                  }
                }
                // Recursive check for objects in array
                if (
                  propSchema.items.type === "object" &&
                  propSchema.items.properties &&
                  itemType === "object" &&
                  item !== null
                ) {
                  const nestedErrors = validateSchema(item, propSchema.items);
                  nestedErrors.forEach((error) => {
                    errors.push({
                      path: `${key}[${index}].${error.path}`,
                      message: error.message,
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

  function createErrorElement(textarea) {
    // Check in wrapper if it exists
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

  function removeErrorElement(textarea) {
    // Check in wrapper if it exists
    const wrapper = textarea.closest(".json-validation-wrapper");
    const parent = wrapper || textarea.parentElement;
    const errorElement = parent.querySelector(".json-validation-error");
    if (errorElement) {
      errorElement.remove();
    }
  }

  function highlightErrors(textarea, errorMessage, errorPosition) {
    if (errorMessage) {
      textarea.classList.add("json-validation-error-input");
    } else {
      textarea.classList.remove("json-validation-error-input");
    }
  }

  function updateOverlay(textarea, text, errorRanges, schemaErrors) {
    let overlay = textareaOverlays.get(textarea);
    if (!overlay) {
      return;
    }

    if (!text || !text.trim()) {
      overlay.innerHTML = "";
      return;
    }

    // Create HTML with error highlighting
    let html = "";
    let lastIndex = 0;

    // Combine all error ranges
    const allRanges = [...errorRanges];

    // Add schema errors (for now just show general error)
    // TODO: can be improved to highlight specific fields

    // Sort ranges by position
    allRanges.sort((a, b) => a.start - b.start);

    // Merge overlapping ranges
    const mergedRanges = [];
    for (const range of allRanges) {
      if (mergedRanges.length === 0) {
        mergedRanges.push({ start: range.start, end: range.end });
      } else {
        const last = mergedRanges[mergedRanges.length - 1];
        if (range.start <= last.end) {
          // Overlapping, merge
          last.end = Math.max(last.end, range.end);
        } else {
          // Not overlapping, add new
          mergedRanges.push({ start: range.start, end: range.end });
        }
      }
    }

    // Create HTML with highlighting
    for (const range of mergedRanges) {
      // Add text before error
      if (range.start > lastIndex) {
        const beforeText = escapeHtml(text.substring(lastIndex, range.start));
        html += beforeText;
      }

      // Add highlighted error text
      const errorText = escapeHtml(text.substring(range.start, range.end));
      html += `<span class="json-validation-highlight">${errorText}</span>`;

      lastIndex = range.end;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const afterText = escapeHtml(text.substring(lastIndex));
      html += afterText;
    }

    overlay.innerHTML = html;
  }

  function createOverlay(textarea) {
    // Check if overlay already exists
    if (textareaOverlays.has(textarea)) {
      return;
    }

    // Create wrapper if it doesn't exist
    let wrapper = textarea.parentElement.querySelector(
      ".json-validation-wrapper"
    );
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "json-validation-wrapper";

      // Insert wrapper before textarea
      textarea.parentElement.insertBefore(wrapper, textarea);
      // Move textarea inside wrapper
      wrapper.appendChild(textarea);
    }

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "json-validation-overlay";
    wrapper.appendChild(overlay);

    // Save overlay
    textareaOverlays.set(textarea, overlay);

    // Sync sizes and styles
    syncOverlayStyles(textarea, overlay);

    // Sync scroll
    textarea.addEventListener("scroll", function () {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    });

    // Sync on resize
    const resizeObserver = new ResizeObserver(function () {
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

    // Remove previous errors
    removeErrorElement(textarea);
    textarea.classList.remove("json-validation-error-input");

    // Create overlay if it doesn't exist
    createOverlay(textarea);
    const overlay = textareaOverlays.get(textarea);

    // If text is empty, don't show errors
    if (!text || !text.trim()) {
      if (overlay) {
        overlay.innerHTML = "";
      }
      return;
    }

    // Check JSON validity
    if (!jsonValidation.valid) {
      highlightErrors(textarea, jsonValidation.error, jsonValidation.position);
      const errorElement = createErrorElement(textarea);
      errorElement.innerHTML = `
        <div class="json-validation-error-message">${escapeHtml(
          jsonValidation.error
        )}</div>
      `;

      // Highlight error in overlay
      if (overlay) {
        const errorRanges = findErrorRanges(text, jsonValidation.position);
        updateOverlay(textarea, text, errorRanges, []);
      }
      return;
    }

    // If JSON is valid, check schema
    try {
      const data = JSON.parse(text);
      const schema = getRequestSchema(operationElement);

      if (schema) {
        const schemaErrors = validateSchema(data, schema);
        if (schemaErrors.length > 0) {
          textarea.classList.add("json-validation-schema-error-input");
          const errorElement = createErrorElement(textarea);
          const errorsHtml = schemaErrors
            .map(
              (error) =>
                `<div class="json-validation-error-item">
                  <span class="json-validation-error-path">${escapeHtml(
                    error.path
                  )}:</span>
                  <span class="json-validation-error-text">${escapeHtml(
                    error.message
                  )}</span>
                </div>`
            )
            .join("");
          errorElement.innerHTML = `
            <div class="json-validation-error-title">Schema errors:</div>
            <div class="json-validation-error-list">${errorsHtml}</div>
          `;

          // For now don't highlight schema errors in overlay (can be improved)
          if (overlay) {
            updateOverlay(textarea, text, [], schemaErrors);
          }
          return;
        } else {
          textarea.classList.remove("json-validation-schema-error-input");
        }
      }

      // If everything is valid, clear overlay
      if (overlay) {
        overlay.innerHTML = "";
      }
    } catch (e) {
      // This shouldn't happen since we already checked JSON
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
    // Check that this is a request body textarea
    if (!isRequestBodyElement(textarea, operationElement)) {
      return;
    }

    // Check that handler is not already added
    if (textareaHandlers.has(textarea)) {
      return;
    }

    // Add handler with debounce
    let timeoutId = null;
    const handler = function () {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(function () {
        validateTextarea(textarea, operationElement);
      }, 300); // Debounce 300ms
    };

    textarea.addEventListener("input", handler);
    textarea.addEventListener("change", handler);

    // Save handler
    textareaHandlers.set(textarea, handler);

    // Validate immediately if there is content
    if (textarea.value && textarea.value.trim()) {
      validateTextarea(textarea, operationElement);
    }
  }

  function processOperation(operationElement) {
    const textareas = operationElement.querySelectorAll("textarea");
    textareas.forEach(function (textarea) {
      addValidationToTextarea(textarea, operationElement);
    });
  }

  function processOperations() {
    const operations = document.querySelectorAll(".opblock");
    operations.forEach(function (operation) {
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

      // Process operations
      processOperations();

      // Setup MutationObserver to track dynamic changes
      if (!observer) {
        observer = new MutationObserver(function () {
          clearTimeout(initTimeout);
          initTimeout = setTimeout(processOperations, 100);
        });

        observer.observe(swaggerContainer, {
          childList: true,
          subtree: true,
        });
      }
    }

    function waitForSwaggerUI() {
      const swaggerContainer = document.querySelector(".swagger-ui");
      if (swaggerContainer) {
        setTimeout(initialize, 300);
      } else {
        setTimeout(waitForSwaggerUI, 100);
      }
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", waitForSwaggerUI);
    } else {
      waitForSwaggerUI();
    }
  }

  // Export initialization function
  window.JSONValidationPlugin = {
    init: init,
    name: "json-validation",
  };
})();
