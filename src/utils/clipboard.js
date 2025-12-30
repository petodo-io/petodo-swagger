(function () {
  "use strict";

  /**
   * Copies text to the clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<void>}
   */
  window.copyToClipboard = function (text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard
        .writeText(text)
        .then(function () {
          if (window.showNotification) {
            window.showNotification("Copied!");
          }
        })
        .catch(function (err) {
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
