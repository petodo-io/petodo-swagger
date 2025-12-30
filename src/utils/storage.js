// Utilities for working with localStorage
(function () {
  "use strict";

  const STORAGE_PREFIX = "petodo-swagger-";

  window.getStorageItem = function (key, defaultValue = null) {
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

  /**
   * Saves a value to localStorage with a prefix
   */
  window.setStorageItem = function (key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error("Error writing to localStorage:", e);
    }
  };

  /**
   * Removes a value from localStorage
   */
  window.removeStorageItem = function (key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (e) {
      console.error("Error removing from localStorage:", e);
    }
  };
})();
