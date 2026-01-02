// Request timing plugin with detailed analytics
(function () {
  "use strict";

  const STORAGE_KEY = "request-timing-stats";
  const activeRequests = new Map();

  /**
   * Gets endpoint identifier from URL
   */
  function getEndpointId(url, method) {
    try {
      const urlObj = new URL(url);
      // Remove query parameters for grouping
      const path = urlObj.pathname;
      return `${method.toUpperCase()}_${path}`;
    } catch (e) {
      return `${method.toUpperCase()}_${url}`;
    }
  }

  /**
   * Gets statistics for endpoint
   */
  function getEndpointStats(endpointId) {
    const allStats = window.getStorageItem(STORAGE_KEY, {});
    return (
      allStats[endpointId] || {
        requests: [],
        min: null,
        max: null,
        avg: null,
        last: null,
      }
    );
  }

  /**
   * Clears statistics for endpoint
   */
  function clearEndpointStats(endpointId) {
    const allStats = window.getStorageItem(STORAGE_KEY, {});
    if (allStats[endpointId]) {
      delete allStats[endpointId];
      window.setStorageItem(STORAGE_KEY, allStats);
    }
  }

  /**
   * Saves statistics for endpoint
   */
  function saveEndpointStats(endpointId, timingData) {
    const allStats = window.getStorageItem(STORAGE_KEY, {});
    let stats = allStats[endpointId] || { requests: [] };

    // Add new request
    stats.requests.push(timingData);

    // Limit number of requests (keep last 100)
    if (stats.requests.length > 100) {
      stats.requests = stats.requests.slice(-100);
    }

    // Calculate Min, Max, and Average
    const durations = stats.requests
      .map((r) => r.totalTime)
      .filter((t) => t > 0);
    const dnsTimes = stats.requests.map((r) => r.dnsTime).filter((t) => t > 0);
    const tcpTimes = stats.requests.map((r) => r.tcpTime).filter((t) => t > 0);
    const tlsTimes = stats.requests.map((r) => r.tlsTime).filter((t) => t > 0);
    const requestTimes = stats.requests
      .map((r) => r.requestTime)
      .filter((t) => t > 0);
    const responseTimes = stats.requests
      .map((r) => r.responseTime)
      .filter((t) => t > 0);

    // Helper function to calculate average
    const avg = (arr) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    stats.last = timingData;
    stats.min = {
      totalTime: durations.length > 0 ? Math.min(...durations) : null,
      dnsTime: dnsTimes.length > 0 ? Math.min(...dnsTimes) : null,
      tcpTime: tcpTimes.length > 0 ? Math.min(...tcpTimes) : null,
      tlsTime: tlsTimes.length > 0 ? Math.min(...tlsTimes) : null,
      requestTime: requestTimes.length > 0 ? Math.min(...requestTimes) : null,
      responseTime:
        responseTimes.length > 0 ? Math.min(...responseTimes) : null,
    };
    stats.max = {
      totalTime: durations.length > 0 ? Math.max(...durations) : null,
      dnsTime: dnsTimes.length > 0 ? Math.max(...dnsTimes) : null,
      tcpTime: tcpTimes.length > 0 ? Math.max(...tcpTimes) : null,
      tlsTime: tlsTimes.length > 0 ? Math.max(...tlsTimes) : null,
      requestTime: requestTimes.length > 0 ? Math.max(...requestTimes) : null,
      responseTime:
        responseTimes.length > 0 ? Math.max(...responseTimes) : null,
    };
    stats.avg = {
      totalTime: avg(durations),
      dnsTime: avg(dnsTimes),
      tcpTime: avg(tcpTimes),
      tlsTime: avg(tlsTimes),
      requestTime: avg(requestTimes),
      responseTime: avg(responseTimes),
    };

    allStats[endpointId] = stats;
    window.setStorageItem(STORAGE_KEY, allStats);

    return stats;
  }

  /**
   * Gets detailed performance information for request
   */
  function getPerformanceTiming(url) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const entries = performance.getEntriesByType("resource");
        // Sort by time to get the most recent request
        const sortedEntries = entries
          .filter((e) => e instanceof PerformanceResourceTiming)
          .sort((a, b) => b.startTime - a.startTime);

        // Search for entry by URL (may be with or without query parameters)
        let entry = null;
        try {
          const urlObj = new URL(url);
          // First, search for exact match
          entry = sortedEntries.find((e) => {
            try {
              const eUrl = new URL(e.name);
              return (
                eUrl.pathname === urlObj.pathname &&
                eUrl.hostname === urlObj.hostname &&
                (eUrl.port === urlObj.port || (!eUrl.port && !urlObj.port))
              );
            } catch {
              return false;
            }
          });

          // If not found, search by pathname
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
          // If URL is invalid, search by string
          entry = sortedEntries.find(
            (e) => e.name === url || e.name.includes(url)
          );
        }

        if (entry && entry instanceof PerformanceResourceTiming) {
          const timing = {
            dnsTime: Math.max(
              0,
              entry.domainLookupEnd - entry.domainLookupStart
            ),
            tcpTime: Math.max(0, entry.connectEnd - entry.connectStart),
            tlsTime:
              entry.secureConnectionStart > 0
                ? Math.max(0, entry.connectEnd - entry.secureConnectionStart)
                : 0,
            requestTime: Math.max(0, entry.responseStart - entry.requestStart),
            responseTime: Math.max(0, entry.responseEnd - entry.responseStart),
            totalTime: Math.max(0, entry.responseEnd - entry.fetchStart),
            transferSize: entry.transferSize || 0,
            encodedBodySize: entry.encodedBodySize || 0,
            decodedBodySize: entry.decodedBodySize || 0,
          };

          resolve(timing);
        } else {
          resolve(null);
        }
      }, 200);
    });
  }

  /**
   * Intercepts fetch API
   */
  function interceptFetch() {
    const originalFetch = window.fetch;

    window.fetch = async function (...args) {
      const url = typeof args[0] === "string" ? args[0] : args[0].url;
      const method = args[1]?.method || "GET";

      // Ignore service requests
      if (url.includes("swagger.json") || url.includes("openapi.json")) {
        return originalFetch.apply(this, args);
      }

      const requestId = `${method}_${url}_${Date.now()}`;
      const startTime = performance.now();

      activeRequests.set(requestId, {
        url,
        method,
        startTime,
        requestId,
      });

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        const status = response.status;
        const contentType = response.headers.get("content-type") || "";

        // Get detailed performance metrics
        const perfTiming = await getPerformanceTiming(url);

        // If no Performance API data, use basic duration
        const timingData = perfTiming || {
          dnsTime: 0,
          tcpTime: 0,
          tlsTime: 0,
          requestTime: 0,
          responseTime: duration,
          totalTime: duration,
          transferSize: 0,
          encodedBodySize: 0,
          decodedBodySize: 0,
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

          // Display analytics
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
        }, 5000);
      }
    };
  }

  /**
   * Formats time in readable format
   */
  function formatDuration(ms) {
    if (ms === null || ms === undefined || ms < 0) return "N/A";
    if (ms < 1) return `${ms.toFixed(1)} ms`;
    // if (ms < 1000) return `${Math.round(ms)} мс`;
    if (ms < 1000) return `${Math.round(ms)} ms`;
    return `${(ms / 1000).toFixed(2)} с`;
  }

  /**
   * Formats data for display
   */
  function formatTimingData(data) {
    if (!data) return "<span>N/A</span>";
    const parts = [];

    // Definitions for title attributes
    const titles = {
      responseTime: "Time to load the response body (from first to last byte)",
      dnsTime: "Time for DNS name resolution to IP address",
      tcpTime: "Time to establish TCP connection (handshake)",
      tlsTime: "Time for TLS/SSL handshake for HTTPS connection",
      requestTime:
        "Time from starting the request to receiving the first byte of the response (TTFB)",
      totalTime: "Total request time from start to complete finish",
    };

    if (
      data.dnsTime !== null &&
      data.dnsTime !== undefined &&
      data.dnsTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.dnsTime
        }">DNS Lookup: <span class="headerline">${formatDuration(
          data.dnsTime
        )}</span></span>`
      );
    }
    if (
      data.tcpTime !== null &&
      data.tcpTime !== undefined &&
      data.tcpTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.tcpTime
        }">TCP Connection: <span class="headerline">${formatDuration(
          data.tcpTime
        )}</span></span>`
      );
    }
    if (
      data.tlsTime !== null &&
      data.tlsTime !== undefined &&
      data.tlsTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.tlsTime
        }">TLS Handshake: <span class="headerline">${formatDuration(
          data.tlsTime
        )}</span></span>`
      );
    }
    if (
      data.requestTime !== null &&
      data.requestTime !== undefined &&
      data.requestTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.requestTime
        }">Request (TTFB): <span class="headerline">${formatDuration(
          data.requestTime
        )}</span></span>`
      );
    }
    if (data.responseTime !== null && data.responseTime !== undefined) {
      parts.push(
        `<span title="${
          titles.responseTime
        }">Response (Data Transfer): <span class="headerline">${formatDuration(
          data.responseTime
        )}</span></span>`
      );
    }
    if (data.totalTime !== null && data.totalTime !== undefined) {
      parts.push(
        `<span title="${
          titles.totalTime
        }">Total Time: <span class="headerline">${formatDuration(
          data.totalTime
        )}</span></span>`
      );
    }

    return parts.length > 0 ? parts.join("\n") : "<span>N/A</span>";
  }

  /**
   * Formats Min/Avg/Max data for display in format "min / avg / max"
   */
  function formatMinAvgMax(minData, avgData, maxData) {
    if (!minData || !avgData || !maxData) return "<span>N/A</span>";
    const parts = [];

    // Definitions for title attributes
    const titles = {
      responseTime: "Time to load the response body (from first to last byte)",
      dnsTime: "Time for DNS name resolution to IP address",
      tcpTime: "Time to establish TCP connection (handshake)",
      tlsTime: "Time for TLS/SSL handshake for HTTPS connection",
      requestTime:
        "Time from starting the request to receiving the first byte of the response (TTFB)",
      totalTime: "Total request time from start to complete finish",
    };

    if (
      minData.dnsTime !== null &&
      minData.dnsTime !== undefined &&
      minData.dnsTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.dnsTime
        }">DNS Lookup: <span class="headerline">${formatDuration(
          minData.dnsTime
        )}</span> / <span class="headerline">${formatDuration(
          avgData.dnsTime
        )}</span> / <span class="headerline">${formatDuration(
          maxData.dnsTime
        )}</span></span>`
      );
    }
    if (
      minData.tcpTime !== null &&
      minData.tcpTime !== undefined &&
      minData.tcpTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.tcpTime
        }">TCP Connection: <span class="headerline">${formatDuration(
          minData.tcpTime
        )}</span> / <span class="headerline">${formatDuration(
          avgData.tcpTime
        )}</span> / <span class="headerline">${formatDuration(
          maxData.tcpTime
        )}</span></span>`
      );
    }
    if (
      minData.tlsTime !== null &&
      minData.tlsTime !== undefined &&
      minData.tlsTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.tlsTime
        }">TLS Handshake: <span class="headerline">${formatDuration(
          minData.tlsTime
        )}</span> / <span class="headerline">${formatDuration(
          avgData.tlsTime
        )}</span> / <span class="headerline">${formatDuration(
          maxData.tlsTime
        )}</span></span>`
      );
    }
    if (
      minData.requestTime !== null &&
      minData.requestTime !== undefined &&
      minData.requestTime > 0
    ) {
      parts.push(
        `<span title="${
          titles.requestTime
        }">Request (TTFB): <span class="headerline">${formatDuration(
          minData.requestTime
        )}</span> / <span class="headerline">${formatDuration(
          avgData.requestTime
        )}</span> / <span class="headerline">${formatDuration(
          maxData.requestTime
        )}</span></span>`
      );
    }
    if (minData.responseTime !== null && minData.responseTime !== undefined) {
      parts.push(
        `<span title="${
          titles.responseTime
        }">Response (Data Transfer): <span class="headerline">${formatDuration(
          minData.responseTime
        )}</span> / <span class="headerline">${formatDuration(
          avgData.responseTime
        )}</span> / <span class="headerline">${formatDuration(
          maxData.responseTime
        )}</span></span>`
      );
    }
    if (minData.totalTime !== null && minData.totalTime !== undefined) {
      parts.push(
        `<span title="${
          titles.totalTime
        }">Total Time: <span class="headerline">${formatDuration(
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

  /**
   * Displays request analytics in the appropriate place
   */
  function displayRequestAnalytics(requestInfo) {
    // Try to find element multiple times with delay
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 100;

    function tryDisplay() {
      attempts++;

      // Find open operation block
      const activeOperation = document.querySelector(".opblock.is-open");
      if (!activeOperation) {
        if (attempts < maxAttempts) {
          setTimeout(tryDisplay, delay);
        }
        return;
      }

      // Find responses table inside open block
      const responsesTable = activeOperation.querySelector(
        "table.responses-table.live-responses-table"
      );
      if (!responsesTable) {
        if (attempts < maxAttempts) {
          setTimeout(tryDisplay, delay);
        }
        return;
      }

      // Find response description cell
      const responseCol = responsesTable.querySelector(
        "tbody td.response-col_description"
      );
      if (!responseCol) {
        if (attempts < maxAttempts) {
          setTimeout(tryDisplay, delay);
        }
        return;
      }

      // Check if analytics block is already added
      let analyticsBlock = responseCol.querySelector(
        ".request-timing-analytics"
      );

      if (!analyticsBlock) {
        analyticsBlock = document.createElement("div");
        analyticsBlock.className = "request-timing-analytics";
        // Insert after last div with header (Response headers)
        const lastDiv = responseCol.querySelector("div:last-of-type");
        if (lastDiv) {
          responseCol.insertBefore(analyticsBlock, lastDiv.nextSibling);
        } else {
          responseCol.appendChild(analyticsBlock);
        }
      }

      const stats =
        requestInfo.stats || getEndpointStats(requestInfo.endpointId);
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

      // Add event handlers for Clear buttons
      const clearButtons = analyticsBlock.querySelectorAll(
        ".request-timing-clear-btn"
      );
      clearButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
          e.stopPropagation();
          const endpointIdToClear = button.getAttribute("data-endpoint-id");
          if (endpointIdToClear) {
            clearEndpointStats(endpointIdToClear);
            // Remove analytics block
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
    init: init,
    name: "request-timing",
  };
})();
