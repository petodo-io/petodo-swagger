// Plugin with small utilities for Swagger UI
(function () {
  "use strict";

  const STORAGE_KEY_SECTIONS = "swagger-sections-state";
  let schemasClosed = false;

  function closeSchemasSection() {
    if (schemasClosed) {
      return;
    }
    setTimeout(function () {
      const modelsControl = document.querySelector(".models-control");
      if (modelsControl) {
        const isExpanded =
          modelsControl.getAttribute("aria-expanded") === "true";
        if (isExpanded) {
          modelsControl.click();
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
    // console.log("[UtilsPlugin] closedSections", closedSections);
    // console.log(
    // "[UtilsPlugin] sections",
    // sections,
    // "count:",
    // sections.length,
    // "attempt",
    // attempt
    // );

    if (sections.length === 0 && attempt < 10) {
      setTimeout(function () {
        restoreSectionsState(attempt + 1);
      }, 200);
      return;
    }

    sections.forEach(function (section) {
      const tagElement = section.querySelector(".opblock-tag");
      if (!tagElement) {
        // console.log("tagElement not found");
        return;
      }

      const text = section.querySelector(".opblock-tag a")?.textContent;
      if (!text) {
        // console.log("text not found");
        return;
      }

      const isCurrentlyOpen = section.classList.contains("is-open");
      // If section is in closed list, close it
      const shouldBeClosed = closedSections[text] === false;

      // console.log(
      //   text,
      //   "isCurrentlyOpen",
      //   isCurrentlyOpen,
      //   "shouldBeClosed",
      //   shouldBeClosed
      // );

      // If section is open but should be closed - close it
      if (isCurrentlyOpen && shouldBeClosed) {
        // console.log("closing", text);
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
      function (e) {
        const section = e.target.closest(".opblock-tag-section");
        if (!section) {
          return;
        }

        const tagElement = section.querySelector(".opblock-tag");
        if (
          !tagElement ||
          (e.target !== tagElement && !tagElement.contains(e.target))
        ) {
          return;
        }

        const text = section.querySelector(".opblock-tag a")?.textContent;
        if (!text) {
          return;
        }

        // Use setTimeout so state updates after Swagger UI handles click
        setTimeout(function () {
          const isOpen = section.classList.contains("is-open");
          const closedSections = window.getStorageItem(
            STORAGE_KEY_SECTIONS,
            {}
          );

          if (isOpen) {
            // If section is open, remove it from closed list
            delete closedSections[text];
          } else {
            // If section is closed, add it to closed list
            closedSections[text] = false;
          }

          window.setStorageItem(STORAGE_KEY_SECTIONS, closedSections);
        }, 0);
      },
      true
    );
  }

  function init() {
    // Close schemas section (once)
    closeSchemasSection();

    // Restore saved section states
    restoreSectionsState();

    // Setup change tracking
    setupSectionsTracking();
  }

  // Export initialization function
  window.UtilsPlugin = {
    init: init,
    name: "utils",
  };
})();
