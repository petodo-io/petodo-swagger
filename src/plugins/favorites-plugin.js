// Swagger UI plugin for favorite endpoints
(function () {
  "use strict";

  const STORAGE_KEY = "favorites-endpoints";
  const FILTER_STORAGE_KEY = "favorites-filter-enabled";

  /**
   * Gets unique endpoint identifier
   * @param {HTMLElement} operationElement - Operation element
   * @returns {string|null}
   */
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

  /**
   * Gets list of favorite endpoints
   * @returns {Array<string>}
   */
  function getFavorites() {
    return window.getStorageItem(STORAGE_KEY, []);
  }

  /**
   * Saves list of favorite endpoints
   * @param {Array<string>} favorites
   */
  function setFavorites(favorites) {
    window.setStorageItem(STORAGE_KEY, favorites);
  }

  /**
   * Checks if endpoint is favorite
   * @param {string} endpointId
   * @returns {boolean}
   */
  function isFavorite(endpointId) {
    const favorites = getFavorites();
    return favorites.includes(endpointId);
  }

  /**
   * Toggles favorite status for endpoint
   * @param {string} endpointId
   */
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

  /**
   * Checks if favorites filter is enabled
   * @returns {boolean}
   */
  function isFilterEnabled() {
    return window.getStorageItem(FILTER_STORAGE_KEY, false);
  }

  /**
   * Sets favorites filter state
   * @param {boolean} enabled
   */
  function setFilterEnabled(enabled) {
    console.log("Favorites filter enabled: ", enabled);
    window.setStorageItem(FILTER_STORAGE_KEY, enabled);
  }

  /**
   * Updates visibility of all endpoints
   */
  function updateAllEndpointsVisibility() {
    const filterEnabled = isFilterEnabled();
    const operations = document.querySelectorAll(".opblock");

    operations.forEach(function (operation) {
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

  /**
   * Updates star icon appearance
   * @param {HTMLElement} starButton
   * @param {string} endpointId
   */
  function updateStarIcon(starButton, endpointId) {
    const isFav = isFavorite(endpointId);
    const svg = starButton.querySelector("svg");
    const starContainer = starButton.closest(".favorite-star-container");

    if (!svg) {
      return;
    }

    // Remove old icon
    svg.remove();

    // Create new icon based on state
    const iconType = isFav ? "star" : "starOutline";
    const iconColor = isFav ? "#ffc107" : "#97918a";
    const newIcon = window.createIcon(iconType, {
      width: 18,
      height: 18,
      color: iconColor,
      fill: "fill",
    });

    if (newIcon) {
      starButton.insertBefore(newIcon, starButton.firstChild);
    }

    // Update classes
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

  /**
   * Adds star icon to endpoint
   * @param {HTMLElement} operationElement
   */
  function addStarButton(operationElement) {
    // Check if button is already added
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
      fill: "fill",
    });

    if (starIcon) {
      starButton.appendChild(starIcon);
    }

    starButton.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleFavorite(endpointId);
      updateStarIcon(starButton, endpointId);
      updateAllEndpointsVisibility();
    });

    starContainer.appendChild(starButton);

    // Insert button at the beginning of summary
    const firstChild = summaryElement.firstChild;
    if (firstChild) {
      summaryElement.insertBefore(starContainer, firstChild);
    } else {
      summaryElement.appendChild(starContainer);
    }
  }

  /**
   * Adds filter button to page header
   */
  function addFilterButton() {
    // Check if button is already added
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
      fill: "fill",
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

    filterButton.addEventListener("click", function (e) {
      e.stopPropagation();
      setFilterEnabled(!isFilterEnabled());
      updateFilterButtonState();
      updateAllEndpointsVisibility();
    });

    // Insert button before Authorize button
    const authorizeButton = authWrapper.querySelector(".btn.authorize");
    if (authorizeButton) {
      authWrapper.insertBefore(filterButton, authorizeButton);
    } else {
      authWrapper.appendChild(filterButton);
    }

    // Set initial state
    updateFilterButtonState();
  }

  /**
   * Initializes plugin: adds buttons to all endpoints
   */
  function initialize() {
    addFilterButton();

    const operations = document.querySelectorAll(".opblock");
    operations.forEach(function (operation) {
      addStarButton(operation);
    });

    updateAllEndpointsVisibility();
  }

  // Plugin initialization
  function init() {
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
  window.FavoritesPlugin = {
    init: init,
    name: "favorites",
  };
})();
