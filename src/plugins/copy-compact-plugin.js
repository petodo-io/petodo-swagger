// Copy compact plugin
(function () {
  "use strict";

  function getRequestBody(operationElement) {
    // Get request method
    const methodElement = operationElement.querySelector(
      ".opblock-summary-method"
    );
    const method = methodElement
      ? methodElement.textContent.trim().toUpperCase()
      : "";

    // GET, HEAD, DELETE usually don't have request body
    if (method === "GET" || method === "HEAD" || method === "DELETE") {
      return null;
    }

    // Get responses section for checking
    const responsesWrapper =
      operationElement.querySelector(".responses-wrapper");

    // Check if element is before responses section in DOM and not inside responses
    function isRequestBodyElement(element) {
      if (!element) return false;

      // If responsesWrapper exists, check that element is not inside it
      if (responsesWrapper && responsesWrapper.contains(element)) {
        return false;
      }

      // Check if element is not in response section
      const responseSection = element.closest(".responses-wrapper, .response");
      if (responseSection) {
        return false;
      }

      // Check position of elements in DOM
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

    // Function to extract text from element
    function extractTextFromElement(element) {
      if (!element) return null;

      // First try textarea (this is the most reliable indicator of request body)
      const textarea = element.querySelector("textarea");
      if (textarea && textarea.value && textarea.value.trim().length > 0) {
        try {
          const json = JSON.parse(textarea.value);
          return JSON.stringify(json, null, 2);
        } catch (e) {
          return textarea.value.trim();
        }
      }

      // Try pre code (for example values)
      const preCode = element.querySelector("pre code");
      if (preCode) {
        const codeText = preCode.textContent.trim();
        if (codeText && codeText.length > 0) {
          // Check if this is not response
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

      // Try highlight-code or microlight only if this is explicitly request body
      const codeBlock = element.querySelector(".highlight-code, .microlight");
      if (codeBlock) {
        const codeText = codeBlock.textContent.trim();
        if (codeText && codeText.length > 0) {
          // Check if this is not response (response usually doesn't have textarea)
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

    // 1. Search block with class opblock-section-request-body (the most reliable way)
    const opblockSectionRequestBody = operationElement.querySelector(
      ".opblock-section-request-body"
    );
    if (
      opblockSectionRequestBody &&
      isRequestBodyElement(opblockSectionRequestBody)
    ) {
      // Search block pre inside
      const preElement = opblockSectionRequestBody.querySelector("pre");
      if (preElement) {
        // Search code inside pre or take text directly from pre
        const codeElement = preElement.querySelector("code");
        const textSource = codeElement || preElement;
        const codeText = textSource.textContent
          ? textSource.textContent.trim()
          : null;

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

    // 2. Search in request-body (backup way)
    const requestBodySection = operationElement.querySelector(".request-body");
    if (requestBodySection && isRequestBodyElement(requestBodySection)) {
      const text = extractTextFromElement(requestBodySection);
      if (text) return text;
    }

    // 3. Search textarea in any place before responses
    const allTextareas = operationElement.querySelectorAll("textarea");
    for (let textarea of allTextareas) {
      if (
        isRequestBodyElement(textarea) &&
        textarea.value &&
        textarea.value.trim().length > 0
      ) {
        try {
          const json = JSON.parse(textarea.value);
          return JSON.stringify(json, null, 2);
        } catch (e) {
          return textarea.value.trim();
        }
      }
    }

    // 4. Search in parameters-container in body-param
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

    // 5. Search body-param directly (but not in responses)
    const allBodyParams = operationElement.querySelectorAll(".body-param");
    for (let bodyParam of allBodyParams) {
      if (isRequestBodyElement(bodyParam)) {
        const text = extractTextFromElement(bodyParam);
        if (text) return text;
      }
    }

    return null;
  }

  // Function to get query parameters
  function getQueryParameters(operationElement) {
    // Search parameters container in different ways
    let parametersContainer = operationElement.querySelector(
      ".parameters-container"
    );

    // If not found, try to find table of parameters directly
    if (!parametersContainer) {
      parametersContainer = operationElement.querySelector("table.parameters");
    }

    // If still not found, search any table with parameters
    if (!parametersContainer) {
      parametersContainer = operationElement.querySelector(
        "[class*='parameter']"
      );
    }

    if (!parametersContainer) {
      return null;
    }

    const queryParams = [];

    // Search all rows with data-param-in="query"
    const parameterRows = operationElement.querySelectorAll(
      'tr[data-param-in="query"]'
    );

    for (let paramRow of parameterRows) {
      // Get parameter name from data-attribute (the most reliable way)
      let paramName = paramRow.dataset.paramName || "";

      // If not found in data-attribute, search in .parameter__name
      if (!paramName) {
        const paramNameElement = paramRow.querySelector(".parameter__name");
        if (paramNameElement) {
          paramName = paramNameElement.textContent.trim();
        }
      }

      if (!paramName) {
        continue;
      }

      // Get parameter type
      let paramType = "";
      const typeElement = paramRow.querySelector(".parameter__type");
      if (typeElement) {
        // Extract only type text, without format (for example, "integer" without "($int32)")
        const typeText = typeElement.textContent.trim();
        // Remove format in parentheses, if exists
        paramType = typeText.replace(/\([^)]*\)/g, "").trim();
      }

      // Try to find parameter value from input/select
      let paramValue = null;
      const input = paramRow.querySelector("input, select, textarea");
      if (input && input.value && input.value.trim()) {
        paramValue = input.value.trim();
      }

      // Check if parameter is required
      const isRequired =
        !!paramRow.querySelector(".parameter__required, .required") ||
        paramRow.textContent.includes("required") ||
        !!paramRow.querySelector("[required]");

      // Get parameter description
      let descText = "";
      const description = paramRow.querySelector(
        ".parameter__description, .renderedMarkdown, .parameters-col_description"
      );
      if (description) {
        // Create copy of element to not modify original
        const descriptionClone = description.cloneNode(true);
        // Remove all select elements from copy to exclude text from dropdown lists
        const selects = descriptionClone.querySelectorAll("select");
        selects.forEach(function (select) {
          select.remove();
        });
        // Extract text without select elements
        descText = descriptionClone.textContent.trim();
      }

      queryParams.push({
        name: paramName,
        type: paramType,
        value: paramValue,
        required: isRequired,
        description: descText,
      });
    }

    return queryParams.length > 0 ? queryParams : null;
  }

  // Function to get response example
  function getResponseExample(operationElement) {
    // Search section with responses
    const responsesWrapper =
      operationElement.querySelector(".responses-wrapper");
    if (!responsesWrapper) {
      return null;
    }

    // Search first successful response (200, 201, etc.)
    const responseItems = responsesWrapper.querySelectorAll(".response");
    for (let responseItem of responseItems) {
      const statusCode = responseItem.querySelector(".response-col_status");
      if (statusCode) {
        const codeText = statusCode.textContent.trim();
        const code = parseInt(codeText);
        if (code >= 200 && code < 300) {
          // Search response example in different places
          const responseBody = responseItem.querySelector(
            ".response-col_description"
          );
          if (responseBody) {
            // Search in highlight-code
            const codeBlock = responseBody.querySelector(".highlight-code");
            if (codeBlock) {
              const codeText = codeBlock.textContent.trim();
              if (codeText && codeText.length > 0) {
                try {
                  const json = JSON.parse(codeText);
                  return JSON.stringify(json, null, 2);
                } catch (e) {
                  return codeText;
                }
              }
            }

            // Search in microlight
            const microlight = responseBody.querySelector(".microlight");
            if (microlight) {
              const codeText = microlight.textContent.trim();
              if (codeText && codeText.length > 0) {
                try {
                  const json = JSON.parse(codeText);
                  return JSON.stringify(json, null, 2);
                } catch (e) {
                  return codeText;
                }
              }
            }

            // Search in pre code
            const preCode = responseBody.querySelector("pre code");
            if (preCode) {
              const codeText = preCode.textContent.trim();
              if (codeText && codeText.length > 0) {
                try {
                  const json = JSON.parse(codeText);
                  return JSON.stringify(json, null, 2);
                } catch (e) {
                  return codeText;
                }
              }
            }

            // Search in response-content-type and related elements
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
                  const codeText = example.textContent.trim();
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
            }

            // Search in response-schema
            const responseSchema =
              responseBody.querySelector(".response-schema");
            if (responseSchema) {
              const example = responseSchema.querySelector(
                "pre code, .highlight-code"
              );
              if (example) {
                const codeText = example.textContent.trim();
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
          }
        }
      }
    }

    return null;
  }

  // Function to get default copy mode
  function getDefaultCopyMode() {
    return window.getStorageItem(
      "copy-mode",
      "method-path-params-data-response"
    );
  }

  // Function to save default copy mode
  function setDefaultCopyMode(mode) {
    window.setStorageItem("copy-mode", mode);
    document.querySelectorAll(".copy-mode-radio").forEach(function (radio) {
      radio.checked = radio.value === mode;
    });
  }

  // Function to get full format of endpoint
  function getCompactFormat(operationElement, mode) {
    // If mode is not specified, use default mode
    if (!mode) {
      mode = getDefaultCopyMode();
    }

    // Search HTTP method (GET, POST, etc.)
    const methodElement = operationElement.querySelector(
      ".opblock-summary-method"
    );
    const method = methodElement ? methodElement.textContent.trim() : "";

    // Search endpoint path
    const pathElement = operationElement.querySelector(".opblock-summary-path");
    let path = pathElement ? pathElement.textContent.trim() : "";

    // Get query parameters
    const queryParams = getQueryParameters(operationElement);

    // Add query parameters to path
    if (queryParams && queryParams.length > 0) {
      const queryString = queryParams
        .map(function (param) {
          // If value exists, use it, otherwise show type
          const value = param.value || `{${param.name}}`;
          return `${param.name}=${value}`;
        })
        .join("&");
      path += `?${queryString}`;
    }

    // Form base format
    let result = "```" + `\n${method} ${path}`;

    // If mode includes parameters and data
    if (
      mode === "method-path-params-data" ||
      mode === "method-path-params-data-response"
    ) {
      // Add information about query parameters, if they exist
      if (queryParams && queryParams.length > 0) {
        result += "\n\nQuery Parameters:";
        queryParams.forEach(function (param) {
          // Form string with type and requiredness
          const typeInfo = param.type
            ? ` (${param.type}${param.required ? ", required" : ""})`
            : param.required
            ? " (required)"
            : "";
          result += `\n- ${param.name}${typeInfo}`;
          if (param.description) {
            result += `: ${param.description}`;
          }
        });
      }

      // Get request body
      const requestBody = getRequestBody(operationElement);
      if (requestBody) {
        result += `\n\nRequest Data:\n\n${requestBody}`;
      }
    }

    // If mode includes response
    if (mode === "method-path-params-data-response") {
      // Get response example
      const responseExample = getResponseExample(operationElement);
      if (responseExample) {
        result += `\n\nResponse Example:\n\n${responseExample}`;
      }
    }

    result += "\n```";

    return result;
  }

  // Function to create dropdown menu
  function createDropdownMenu(container, operationElement, closeDropdown) {
    const dropdown = document.createElement("div");
    dropdown.className = "copy-compact-dropdown";

    const modes = [
      {
        value: "method-path",
        label: "Method + Path",
      },
      {
        value: "method-path-params-data",
        label: "Method + Path + Params + Data",
      },
      {
        value: "method-path-params-data-response",
        label: "Method + Path + Params + Data + Response",
      },
    ];

    const defaultMode = getDefaultCopyMode();

    modes.forEach(function (mode) {
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

      // Click handler on row - copy, but don't change default mode
      item.addEventListener("click", function (e) {
        // Skip click if it was on radio
        if (e.target === radio || radio.contains(e.target)) {
          return;
        }
        e.stopPropagation();
        copyWithMode(operationElement, mode.value);
        closeDropdown();
      });

      // Change handler on radio - change default mode
      radio.addEventListener("change", function (e) {
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

  // Function to copy with specified mode
  function copyWithMode(operationElement, mode) {
    const compactFormat = getCompactFormat(operationElement, mode);
    if (compactFormat) {
      window.copyToClipboard(compactFormat);
    }
  }

  // Function to add "Copy Compact" button
  function addCopyCompactButton(operationElement) {
    // Check if button is already added
    if (operationElement.querySelector(".copy-compact-container")) {
      return;
    }

    const summaryElement = operationElement.querySelector(".opblock-summary");
    if (!summaryElement) {
      return;
    }

    // Search place for insertion: after standard copy icon, but before lock and chevron
    // In Swagger UI structure: [method] [path] [copy-icon] [lock] [chevron]
    // We need to insert between copy-icon and lock

    // Search elements for positioning (different versions of Swagger UI may have different classes)
    const lockButton = summaryElement.querySelector(
      ".authorization__btn, .btn-authorize, [class*='authorize']"
    );
    const chevron = summaryElement.querySelector(".opblock-control-arrow");
    const viewLineLink = summaryElement.querySelector(
      ".view-line-link, [class*='view-line']"
    );

    // Define element, before which we need to insert button
    // Priority: lock (before it) > chevron (before it, right of view-line-link) > after view-line-link
    let insertBeforeElement = null;
    let insertAfterElement = null;

    if (lockButton && lockButton.parentNode === summaryElement) {
      insertBeforeElement = lockButton;
    } else if (chevron && chevron.parentNode === summaryElement) {
      // If there is no lock, but there is chevron - insert BEFORE chevron (right of view-line-link, left of chevron)
      insertBeforeElement = chevron;
    } else if (viewLineLink && viewLineLink.parentNode === summaryElement) {
      // If standard copy icon is found, insert after it
      insertAfterElement = viewLineLink;
    }

    // Create container for buttons
    const container = document.createElement("div");
    container.className = "copy-compact-container";

    // Create copy button
    const copyButton = document.createElement("button");
    copyButton.className = "copy-compact-btn";
    copyButton.title = "Copy compact";

    // SVG copy icon
    const svgIcon = window.createIcon("copy", {
      width: 24,
      height: 24,
      fill: "stroke",
    });
    copyButton.appendChild(svgIcon);

    // Click handler on copy button
    copyButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const defaultMode = getDefaultCopyMode();
      copyWithMode(operationElement, defaultMode);
    });

    // Create expand button
    const expandButton = document.createElement("button");
    expandButton.className = "copy-compact-expand-btn";
    expandButton.title = "Copy variants";

    // SVG caret icon
    const caretIcon = window.createIcon("caret", {
      width: 12,
      height: 12,
    });
    expandButton.appendChild(caretIcon);

    // Variable to store current dropdown
    let dropdown = null;

    // Function to close dropdown
    function closeDropdown() {
      if (dropdown && dropdown.parentNode) {
        dropdown.parentNode.removeChild(dropdown);
        dropdown = null;
        expandButton.classList.remove("is-open");
      }
    }

    // Click handler on expand button (only on caret)
    expandButton.addEventListener("click", function (e) {
      e.stopPropagation();

      // If dropdown is already open, close it
      if (dropdown && dropdown.parentNode) {
        closeDropdown();
        return;
      }

      // Close all other dropdowns
      document
        .querySelectorAll(".copy-compact-dropdown")
        .forEach(function (dd) {
          if (dd.parentNode) {
            dd.parentNode.removeChild(dd);
          }
        });

      // Create new dropdown
      dropdown = createDropdownMenu(container, operationElement, closeDropdown);
      expandButton.classList.add("is-open");
    });

    // Close dropdown when clicking outside it
    document.addEventListener("click", function (e) {
      if (dropdown && !container.contains(e.target)) {
        closeDropdown();
      }
    });

    container.appendChild(copyButton);
    container.appendChild(expandButton);

    // Insert container in correct place
    summaryElement.style.display = "flex";
    summaryElement.style.alignItems = "center";

    if (insertBeforeElement) {
      // Insert before lock or chevron
      summaryElement.insertBefore(container, insertBeforeElement);
    } else if (insertAfterElement) {
      // Insert after standard copy icon
      if (insertAfterElement.nextSibling) {
        summaryElement.insertBefore(container, insertAfterElement.nextSibling);
      } else {
        summaryElement.appendChild(container);
      }
    } else {
      // Backup logic: insert before last element (usually it is chevron)
      const children = Array.from(summaryElement.children);
      const methodElement = summaryElement.querySelector(
        ".opblock-summary-method"
      );
      const pathElement = summaryElement.querySelector(".opblock-summary-path");

      // Search last element, which is not method or path
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (
          child !== methodElement &&
          child !== pathElement &&
          child !== container
        ) {
          summaryElement.insertBefore(container, child);
          return;
        }
      }

      // If nothing is found, insert at the end
      summaryElement.appendChild(container);
    }
  }

  // Function to process all operations on page
  function processOperations() {
    const operations = document.querySelectorAll(".opblock");
    operations.forEach(function (operation) {
      addCopyCompactButton(operation);
    });
  }

  // Plugin initialization
  function init() {
    let observer = null;
    let initTimeout = null;

    // Function to initialize after Swagger UI is loaded
    function initialize() {
      const swaggerContainer = document.querySelector(".swagger-ui");
      if (!swaggerContainer) {
        return;
      }

      // Process operations
      processOperations();

      // Configure MutationObserver to track dynamic changes
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
  window.CopyCompactPlugin = {
    init: init,
    name: "copy-compact",
  };
})();
