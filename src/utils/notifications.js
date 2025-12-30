(function () {
  "use strict";

  /**
   * Shows a notification to the user
   * @param {string} message - Notification text
   * @param {boolean} isError - Whether the notification is an error
   */
  window.showNotification = function (message, isError = false) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className =
      "petodo-notification " +
      (isError ? "petodo-notification-error" : "petodo-notification-success");

    document.body.appendChild(notification);

    setTimeout(function () {
      notification.style.animation = "none";
      void notification.offsetWidth;
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(function () {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 2000);
  };
})();
