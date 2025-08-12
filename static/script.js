const canvas = document.getElementById("lineChart");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 150;

const points = [
  [0, 130],
  [100, 120],
  [150, 90],
  [200, 130],
  [260, 80],
  [320, 100],
  [400, 60],
  [500, 110],
  [600, 70],
  [700, 90],
  [800, 50],
  [900, 80],
  [1000, 70],
];

ctx.beginPath();
ctx.moveTo(points[0][0], points[0][1]);

for (let i = 1; i < points.length; i++) {
  ctx.lineTo(points[i][0], points[i][1]);
}

ctx.strokeStyle = "#e29191";
ctx.lineWidth = 3;
ctx.stroke();

const animateLine = (ctx, points, duration = 1200) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  const totalLength = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return 0;
    const dx = pt[0] - arr[i - 1][0];
    const dy = pt[1] - arr[i - 1][1];
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);
  let start = null;
  function drawFrame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const progress = Math.min(elapsed / duration, 1);
    let drawnLength = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const segLength = Math.sqrt(
        (curr[0] - prev[0]) ** 2 + (curr[1] - prev[1]) ** 2,
      );
      if (drawnLength + segLength > totalLength * progress) {
        const remain = totalLength * progress - drawnLength;
        const t = remain / segLength;
        const x = prev[0] + t * (curr[0] - prev[0]);
        const y = prev[1] + t * (curr[1] - prev[1]);
        ctx.lineTo(x, y);
        break;
      } else {
        ctx.lineTo(curr[0], curr[1]);
        drawnLength += segLength;
      }
    }
    ctx.strokeStyle = "#e29191";
    ctx.lineWidth = 3;
    ctx.stroke();
    if (progress < 1) {
      requestAnimationFrame(drawFrame);
    }
  }
  requestAnimationFrame(drawFrame);
};

const viralInput = document.getElementById("viral-input");
if (viralInput) {
  const text = "how do i go viral?";
  viralInput.value = "";
  let i = 0;
  function typeWriter() {
    if (i < text.length) {
      viralInput.value += text.charAt(i);
      i++;
      setTimeout(typeWriter, 20); // Adjust speed here (ms per letter)
    }
  }
  typeWriter();
}

const minX = points[0][0];
const maxX = points[points.length - 1][0];
const scaledPoints = points.map(([x, y]) => [
  ((x - minX) / (maxX - minX)) * canvas.width,
  y,
]);
animateLine(ctx, scaledPoints, 1200);

const fileUpload = document.getElementById("file-upload");
if (fileUpload) {
  fileUpload.addEventListener("change", function () {
    const progress = document.getElementById("progress-fill");
    const status = document.getElementById("status");

    if (this.files.length > 0) {
      status.style.display = "block";
      progress.style.width = "0%";
      setTimeout(() => {
        progress.style.width = "60%";
      }, 100);
      setTimeout(() => {
        progress.style.width = "100%";
      }, 3000);
    }
  });
}

function normalizeDate(d) {
  const dt = new Date(d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

const parseDate = d3.utcParse("%Y-%m-%d");
// === Analyze Channel Section Logic ===
document.addEventListener("DOMContentLoaded", function () {
  const channelInput = document.getElementById("channel-id");
  const csvInput = document.getElementById("analytics-csv");
  const analyzeBtn = document.getElementById("analyze-btn");
  const uploadCsvBtn = document.getElementById("upload-csv-btn");
  const progressSection = document.querySelector(".analysis-progress");
  const progressSteps = document.querySelectorAll(".progress-steps .step");
  const progressFill = document.getElementById("progress-fill-analysis");
  const statusText = document.getElementById("analysis-status");
  let errorBox = document.getElementById("input-error");
  let channelAnalysisComplete = false;
  let csvUploadComplete = false;

  // Load saved channel ID from localStorage
  const savedChannelId = localStorage.getItem("lastChannelId");
  if (savedChannelId && channelInput) {
    channelInput.value = savedChannelId;
  }

  // Add clear saved data functionality
  function clearSavedData() {
    localStorage.removeItem("lastChannelId");
    localStorage.removeItem("analysisComplete");
    localStorage.removeItem("csvUploadComplete");
    localStorage.removeItem("cachedApiData");
    localStorage.removeItem("cachedCsvData");
    console.log("Cleared all saved data");

    // Reset UI state
    channelAnalysisComplete = false;
    csvUploadComplete = false;
    if (channelInput) channelInput.value = "";

    // Relock sections
    if (dashboardOverlay) dashboardOverlay.style.display = "block";
    if (csvOverlay) csvOverlay.style.display = "block";
    if (analyticsOverlay) analyticsOverlay.style.display = "block";

    // Reload page to reset everything
    window.location.reload();
  }

  // Add clear button to the page (optional)
  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear Saved Data";
  clearButton.className = "clear-data-button";
  clearButton.addEventListener("click", clearSavedData);
  document.body.appendChild(clearButton);

  // Lock overlays
  const dashboardOverlay = document.getElementById("dashboard-lock-overlay");
  const csvOverlay = document.getElementById("csv-lock-overlay");
  const analyticsOverlay = document.getElementById("analytics-lock-overlay");

  // Restore analysis state from localStorage (after overlays are defined)
  const savedAnalysisState = localStorage.getItem("analysisComplete");
  const cachedApiData = localStorage.getItem("cachedApiData");
  const cachedCsvData = localStorage.getItem("cachedCsvData");

  if (savedAnalysisState === "true" && savedChannelId && cachedApiData) {
    channelAnalysisComplete = true;
    csvUploadComplete = localStorage.getItem("csvUploadComplete") === "true";

    try {
      const parsedData = JSON.parse(cachedApiData);

      // Unlock sections based on saved state (no cached results display)

      if (dashboardOverlay) {
        dashboardOverlay.style.display = "none";
        dashboardOverlay.style.opacity = "1";
      }
      if (csvOverlay) {
        csvOverlay.style.display = "none";
        csvOverlay.style.opacity = "1";
      }
      if (analyticsOverlay && csvUploadComplete) {
        analyticsOverlay.style.display = "none";
        analyticsOverlay.style.opacity = "1";
      }

      // Load dashboard if it was previously loaded
      setTimeout(() => {
        if (window.loadDashboard) {
          window.loadDashboard();
        }
      }, 100);

      // Restore CSV data and analytics if available
      if (csvUploadComplete && cachedCsvData) {
        try {
          const parsedCsvData = JSON.parse(cachedCsvData);

          // Display CSV success message
          const template = document.getElementById("csv-success-template");
          const successDiv = template.content.cloneNode(true);
          successDiv.querySelector("#peaks-count").textContent =
            parsedCsvData.sub_peaks.length;
          successDiv.querySelector("#attributions-count").textContent =
            parsedCsvData.attributions.length;

          const csvReservedSpace = document.querySelector(
            ".csv-dynamic-content-reserved-space",
          );
          const csvPlaceholder = csvReservedSpace.querySelector(
            ".csv-success-placeholder",
          );
          if (csvPlaceholder) {
            csvPlaceholder.innerHTML = "";
            csvPlaceholder.appendChild(successDiv);
          }

          // Restore analytics chart with cached data
          // Handle flexible column names - use first column for date, second for metric
          const subsData = parsedCsvData.sub_stats.map((d) => {
            const keys = Object.keys(d);
            const dateKey = keys[0]; // First column
            const metricKey = keys[1]; // Second column
            return {
              Date: d[dateKey] ? new Date(d[dateKey]) : undefined,
              Subscribers: +d[metricKey] || 0,
            };
          });
          const cleanSubs = subsData.filter((d) => d.Subscribers >= 0);

          const shortsByDay = parsedCsvData.shorts_by_day.map((d) => ({
            date: parseDate(d.date),
            avg_views: +d.avg_views,
            count_shorts: +d.count_shorts,
            thumbnail_urls: d.thumbnail_urls,
          }));

          const subPeaks = parsedCsvData.sub_peaks.map((d) => ({
            date: new Date(d.date),
            value: +d.value,
          }));

          const attributions = parsedCsvData.attributions.map((d) => ({
            peak_date: new Date(d.peak_date),
            candidate_video_id: d.candidate_video_id,
            title: d.title,
            views: +d.views,
            narrative: d.narrative,
          }));

          drawSubsTimeSeriesResponsive(
            cleanSubs, // main line (subscriber gains)
            shortsByDay, // daily blocks
            subPeaks, // peaks
            attributions, // attributions
          );
        } catch (e) {
          console.error("Error parsing cached CSV data:", e);
          // Clear invalid cached CSV data
          localStorage.removeItem("cachedCsvData");
          localStorage.removeItem("csvUploadComplete");
          csvUploadComplete = false;
        }
      }
    } catch (e) {
      console.error("Error parsing cached API data:", e);
      // Clear invalid cached data and reset state
      localStorage.removeItem("cachedApiData");
      localStorage.removeItem("cachedCsvData");
      localStorage.removeItem("analysisComplete");
      localStorage.removeItem("csvUploadComplete");
      channelAnalysisComplete = false;
      csvUploadComplete = false;
    }
  } else if (
    savedAnalysisState === "true" &&
    savedChannelId &&
    !cachedApiData
  ) {
    // We have saved state but no cached data - clear the invalid state

    localStorage.removeItem("analysisComplete");
    localStorage.removeItem("csvUploadComplete");
    localStorage.removeItem("cachedApiData");
    localStorage.removeItem("cachedCsvData");
    channelAnalysisComplete = false;
    csvUploadComplete = false;
  }

  // Dashboard will be loaded after channel analysis is complete
  const dashboardSection = document.getElementById("dashboard-section");
  const csvSection = document.getElementById("csv-upload-section");
  const analyticsSection = document.getElementById("analytics-section");
  const allPages = document.querySelectorAll(".page");

  // Add error box if not present
  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.id = "input-error";
    errorBox.style.color = "#e29191";
    errorBox.style.margin = "12px 0";
    errorBox.style.textAlign = "center";
    errorBox.style.display = "none";
    // Insert after the input panel
    const inputPanel = document.querySelector(".input-panel");
    if (inputPanel) {
      inputPanel.parentNode.insertBefore(errorBox, inputPanel.nextSibling);
    }
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  }
  function clearError() {
    errorBox.textContent = "";
    errorBox.style.display = "none";
  }
  function setStep(stepIdx) {
    progressSteps.forEach((step, i) => {
      step.classList.remove("active", "completed");
      if (i < stepIdx) step.classList.add("completed");
      else if (i === stepIdx) step.classList.add("active");
    });
    progressFill.style.width = `${(stepIdx / (progressSteps.length - 1)) * 100}%`;
  }

  // Helper: get the vertical offset of a section
  function getSectionTop(section) {
    const rect = section.getBoundingClientRect();
    return window.scrollY + rect.top;
  }

  // Prevent scroll to locked sections
  let scrollTimeout = null;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Check dashboard section
        if (
          !channelAnalysisComplete &&
          dashboardOverlay &&
          dashboardOverlay.style.display !== "none"
        ) {
          const rect = dashboardSection.getBoundingClientRect();
          if (rect.top < 80 && rect.bottom > 0) {
            const prevSection = allPages[1]; // channel-id-section
            if (prevSection) {
              prevSection.scrollIntoView({ behavior: "smooth" });
            }
          }
        }

        // Check CSV section
        if (
          !channelAnalysisComplete &&
          csvOverlay &&
          csvOverlay.style.display !== "none"
        ) {
          const rect = csvSection.getBoundingClientRect();
          if (rect.top < 80 && rect.bottom > 0) {
            const prevSection = allPages[1]; // channel-id-section
            if (prevSection) {
              prevSection.scrollIntoView({ behavior: "smooth" });
            }
          }
        }

        // Check analytics section
        if (
          (!channelAnalysisComplete || !csvUploadComplete) &&
          analyticsOverlay &&
          analyticsOverlay.style.display !== "none"
        ) {
          const rect = analyticsSection.getBoundingClientRect();
          if (rect.top < 80 && rect.bottom > 0) {
            const prevSection = allPages[3]; // csv-upload-section
            if (prevSection) {
              prevSection.scrollIntoView({ behavior: "smooth" });
            }
          }
        }
      }, 60);
    },
    { passive: true },
  );

  // Channel ID Analysis
  analyzeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    clearError();
    const channelId = channelInput.value.trim();

    // Check if this is a new channel ID
    const lastChannelId = localStorage.getItem("lastChannelId");
    if (lastChannelId && lastChannelId !== channelId) {
      // Clear previous analysis state when starting new analysis for different channel
      localStorage.removeItem("analysisComplete");
      localStorage.removeItem("csvUploadComplete");
      localStorage.removeItem("cachedApiData");
    }

    if (!channelId) {
      showError("Please enter a YouTube Channel ID.");
      return;
    }

    // Basic channel ID validation (should start with UC and be 24 chars)
    if (!/^UC[\w-]{22,23}$/.test(channelId)) {
      showError(
        "Channel ID should start with 'UC' and be 24 or 25 characters long.",
      );
      return;
    }

    // Show progress and disable button
    progressSection.classList.add("visible");
    setStep(0);
    statusText.textContent = "Fetching videos from YouTube...";
    analyzeBtn.disabled = true;

    // Create FormData for the request (without CSV file for now)
    const formData = new FormData();
    formData.append("channelId", channelId);
    // Add a dummy CSV file for API mode compatibility
    const dummyCsv = new File([""], "dummy.csv", { type: "text/csv" });
    formData.append("csvFile", dummyCsv);

    // Make API call to backend
    fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON: " + text.substring(0, 200));
        }
      })
      .then((data) => {
        setStep(3);
        statusText.textContent = "Analysis complete!";

        // Check if we have an error response
        if (data.error) {
          throw new Error(data.error);
        }

        // Check if we have valid data
        if (!data || !data.data || !data.data.summary) {
          throw new Error("Invalid response format from server");
        }

        // Display results
        const summary = data.data.summary;

        // Clone the template
        const template = document.getElementById("analysis-results-template");
        const resultsDiv = template.content.cloneNode(true);

        // Update the values
        resultsDiv.querySelector("#total-shorts").textContent =
          summary.total_shorts;
        resultsDiv.querySelector("#total-views").textContent =
          summary.total_views.toLocaleString();
        resultsDiv.querySelector("#avg-views").textContent = Math.round(
          summary.avg_views_per_short,
        ).toLocaleString();
        resultsDiv.querySelector("#date-range").textContent =
          `${new Date(summary.date_range.start).toLocaleDateString()} - ${new Date(summary.date_range.end).toLocaleDateString()}`;

        analyzeBtn.disabled = false;
        channelAnalysisComplete = true;

        // Save the channel ID and API response data to localStorage for persistence
        const channelId = channelInput.value.trim();
        localStorage.setItem("lastChannelId", channelId);
        localStorage.setItem("analysisComplete", "true");
        localStorage.setItem("cachedApiData", JSON.stringify(data));

        // UNLOCK dashboard section
        if (dashboardOverlay) {
          dashboardOverlay.style.opacity = "0";
          setTimeout(() => {
            dashboardOverlay.style.display = "none";
            dashboardOverlay.style.opacity = "1";
            // Load the React dashboard after a short delay to ensure the section is visible
            setTimeout(() => {
              if (window.loadDashboard) {
                window.loadDashboard();
              }
            }, 100);
          }, 300);
        }

        // UNLOCK CSV upload section
        if (csvOverlay) {
          csvOverlay.style.opacity = "0";
          setTimeout(() => {
            csvOverlay.style.display = "none";
            csvOverlay.style.opacity = "1";
          }, 300);
        }

        // Scroll to dashboard section
        setTimeout(() => {
          dashboardSection.scrollIntoView({ behavior: "smooth" });
        }, 500);
      })
      .catch((error) => {
        console.error("Error:", error);
        showError(error.message || "An error occurred during analysis");
        analyzeBtn.disabled = false;
        progressSection.classList.remove("visible");
      });
  });

  // CSV Upload
  uploadCsvBtn.addEventListener("click", function (e) {
    e.preventDefault();
    clearError();
    const csvFile = csvInput.files[0];

    // Add error box for CSV section if not present
    let csvErrorBox = document.getElementById("csv-input-error");
    if (!csvErrorBox) {
      csvErrorBox = document.createElement("div");
      csvErrorBox.id = "csv-input-error";
      csvErrorBox.style.color = "#e29191";
      csvErrorBox.style.margin = "12px 0";
      csvErrorBox.style.textAlign = "center";
      csvErrorBox.style.display = "none";
      // Insert after the CSV input panel
      const csvInputPanel = document.querySelector(
        ".csv-upload-section .input-panel",
      );
      if (csvInputPanel) {
        csvInputPanel.parentNode.insertBefore(
          csvErrorBox,
          csvInputPanel.nextSibling,
        );
      }
    }

    function showCsvError(msg) {
      csvErrorBox.textContent = msg;
      csvErrorBox.style.display = "block";
    }
    function clearCsvError() {
      csvErrorBox.textContent = "";
      csvErrorBox.style.display = "none";
    }

    clearCsvError();

    if (!csvFile) {
      showCsvError("Please upload your analytics CSV file.");
      return;
    }

    if (!channelAnalysisComplete) {
      showCsvError("Please complete the channel analysis first.");
      return;
    }

    // Show progress and disable button
    uploadCsvBtn.disabled = true;
    const btnText = uploadCsvBtn.querySelector(".btn-text");
    const btnLoading = uploadCsvBtn.querySelector(".btn-loading");
    btnText.style.display = "none";
    btnLoading.style.display = "inline";

    // Create FormData for the request
    const formData = new FormData();
    formData.append("channelId", channelInput.value.trim());
    formData.append("csvFile", csvFile);

    // Make API call to backend
    fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON: " + text.substring(0, 200));
        }
      })
      .then((data) => {
        // Check if we have an error response
        if (data.error) {
          throw new Error(data.error);
        }

        // Check if we have valid data
        if (!data || !data.sub_peaks || !data.attributions) {
          throw new Error("Invalid response format from server");
        }

        // Display success message
        // Clone the template
        const template = document.getElementById("csv-success-template");
        const successDiv = template.content.cloneNode(true);

        // Update the values
        successDiv.querySelector("#peaks-count").textContent =
          data.sub_peaks.length;
        successDiv.querySelector("#attributions-count").textContent =
          data.attributions.length;

        // Insert success message into the CSV reserved space
        const csvReservedSpace = document.querySelector(
          ".csv-dynamic-content-reserved-space",
        );
        const csvPlaceholder = csvReservedSpace.querySelector(
          ".csv-success-placeholder",
        );
        if (csvPlaceholder) {
          csvPlaceholder.innerHTML = "";
          csvPlaceholder.appendChild(successDiv);
        }

        uploadCsvBtn.disabled = false;
        btnText.style.display = "inline";
        btnLoading.style.display = "none";
        csvUploadComplete = true;

        // Save CSV upload state and data to localStorage for persistence
        localStorage.setItem("csvUploadComplete", "true");
        localStorage.setItem("cachedCsvData", JSON.stringify(data));

        // UNLOCK analytics section
        if (analyticsOverlay) {
          analyticsOverlay.style.opacity = "0";
          setTimeout(() => {
            analyticsOverlay.style.display = "none";
            analyticsOverlay.style.opacity = "1";
          }, 300);
        }

        // --- Use backend data for chart ---
        // Handle flexible column names - use first column for date, second for metric
        const subsData = data.sub_stats.map((d) => {
          const keys = Object.keys(d);
          const dateKey = keys[0]; // First column
          const metricKey = keys[1]; // Second column
          return {
            Date: d[dateKey] ? new Date(d[dateKey]) : undefined,
            Subscribers: +d[metricKey] || 0,
          };
        });
        const cleanSubs = subsData.filter((d) => d.Subscribers >= 0);

        const shortsByDay = data.shorts_by_day.map((d) => ({
          date: parseDate(d.date),
          avg_views: +d.avg_views,
          count_shorts: +d.count_shorts,
          thumbnail_urls: d.thumbnail_urls,
        }));

        const subPeaks = data.sub_peaks.map((d) => ({
          date: new Date(d.date),
          value: +d.value,
        }));

        const attributions = data.attributions.map((d) => ({
          peak_date: new Date(d.peak_date),
          candidate_video_id: d.candidate_video_id,
          title: d.title,
          views: +d.views,
          narrative: d.narrative,
        }));

        drawSubsTimeSeriesResponsive(
          cleanSubs, // main line (subscriber gains)
          shortsByDay, // daily blocks
          subPeaks, // peaks
          attributions, // attributions
        );

        // Scroll to analytics section
        setTimeout(() => {
          analyticsSection.scrollIntoView({ behavior: "smooth" });
        }, 500);
      })
      .catch((error) => {
        console.error("Error:", error);
        showCsvError(error.message || "An error occurred during CSV upload");
        uploadCsvBtn.disabled = false;
        btnText.style.display = "inline";
        btnLoading.style.display = "none";
      });
  });

  // File upload progress bar logic
  const fileUpload = document.getElementById("file-upload");
  const progressArea = document.getElementById("progress-area");
  const progressFillUpload = document.getElementById("progress-fill");
  const status = document.getElementById("status");

  if (fileUpload && progressArea && progressFillUpload && status) {
    fileUpload.addEventListener("change", function () {
      if (this.files.length > 0) {
        progressArea.style.display = "block";
        progressFillUpload.style.width = "0%";
        status.textContent = "Generating...";
        setTimeout(() => {
          progressFillUpload.style.width = "60%";
        }, 100);
        setTimeout(() => {
          progressFillUpload.style.width = "100%";
          status.textContent = "Upload complete!";
        }, 3000);
      } else {
        progressArea.style.display = "none";
        progressFillUpload.style.width = "0%";
        status.textContent = "Generating...";
      }
    });
  }
});
// Responsive chart drawing with 2:1 aspect ratio
function drawSubsTimeSeriesResponsive(
  subsData,
  dailyData,
  peakData,
  attributionData,
) {
  const container = document.getElementById("time-series").parentNode;
  const width = container.offsetWidth;
  const height = width / 2; // 2:1 aspect ratio
  const svg = d3
    .select("#time-series")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMinYMin meet");
  svg.selectAll("*").remove();

  const margin = { top: 20, right: 100, bottom: 100, left: 120 };

  // Add a clipPath to cut off the line and blocks at the chart area
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "chart-clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom + 100); // to leave room for blocks

  const content = svg
    .append("g")
    .attr("class", "content")
    .attr("clip-path", "url(#chart-clip)");

  const initialRange = 30 * 24 * 60 * 60 * 1000;
  const startDate = d3.min(subsData, (d) => d.Date);
  const endDate = new Date(startDate.getTime() + initialRange);

  const x = d3
    .scaleTime()
    .domain([startDate, endDate])
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(subsData, (d) => d.Subscribers) +
        0.5 * d3.max(subsData, (d) => d.Subscribers),
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

  let currentRange = [startDate, endDate];

  const xAxisGroup = svg
    .append("g")
    .attr("class", "x-axis axis")
    .attr("transform", `translate(-8, ${height - margin.bottom})`)
    .call(
      d3.axisBottom(x).ticks(30).tickFormat(d3.utcFormat("%-d")).tickSize(0),
    );
  xAxisGroup.select(".domain").remove();
  xAxisGroup.selectAll("text").attr("dy", "1.2em");

  svg
    .append("text")
    .attr("class", "month-year-label")
    .attr("x", margin.left - 120)
    .attr("y", height - margin.bottom + 30)
    .attr("text-anchor", "end")
    .attr("font-size", "1.1rem")
    .attr("fill", "#666")
    .text(`${d3.utcFormat("%B")(startDate)} ${d3.utcFormat("%Y")(startDate)}`);

  svg
    .append("g")
    .attr("class", "y-axis axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(6).tickSize(0).tickFormat(d3.format(",")));

  // Add custom horizontal lines at y-axis ticks (not using D3 grid)
  const yTicks = [...y.ticks(7)];
  svg
    .selectAll(".custom-y-line")
    .data(yTicks)
    .join("line")
    .attr("class", "custom-y-line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d));

  svg.selectAll(".custom-y-line").lower();

  const line = d3
    .line()
    .x((d) => x(d.Date))
    .y((d) => y(d.Subscribers));

  const path = content
    .append("path")
    .datum(subsData)
    .attr("fill", "none")
    .attr("stroke", "#e29191")
    .attr("stroke-width", 2)
    .attr("d", line);

  const focus = content
    .append("g")
    .attr("class", "focus")
    .style("display", "none");

  focus.append("circle").attr("r", 5).attr("fill", "#e29191");

  let lineTooltip = d3.select("#line-tooltip");
  if (lineTooltip.empty()) {
    lineTooltip = d3
      .select("body")
      .append("div")
      .attr("id", "line-tooltip")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("opacity", 0);
  }

  svg
    .insert("rect", ":first-child")
    .attr("class", "line-hover-overlay")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", () => {
      focus.style("display", null);
      lineTooltip.style("opacity", 1);
    })
    .on("mouseout", () => {
      focus.style("display", "none");
      lineTooltip.style("opacity", 0);
    })
    .on("mousemove", function (event) {
      const mouseX = d3.pointer(event, this)[0];
      const date = x.invert(mouseX);
      const closestData = subsData.reduce((a, b) =>
        Math.abs(a.Date - date) < Math.abs(b.Date - date) ? a : b,
      );
      focus.attr(
        "transform",
        `translate(${x(closestData.Date)},${y(closestData.Subscribers)})`,
      );
      lineTooltip
        .html(
          `<div class="tooltip-content">
            <strong>${d3.utcFormat("%m/%d/%Y")(closestData.Date)}</strong><br/>
            Subscribers gained: ${d3.format(",")(closestData.Subscribers)}
          </div>`,
        )
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY - 18}px`);
    });

  const maxAvg = d3.max(dailyData, (d) => d.avg_views);
  const colorScale = d3
    .scaleLog()
    .domain([1, maxAvg])
    .range(["#ffe5e5", "#e29191"]);

  const blockY = height - margin.bottom + 40;
  const blockH = 30;
  const blockW = (width - margin.left - margin.right) / 30;

  const tooltip = d3.select("#tooltip").empty()
    ? d3.select("body").append("div").attr("id", "tooltip")
    : d3.select("#tooltip");

  const blocksGroup = content.append("g").attr("class", "daily-blocks");
  blocksGroup
    .selectAll("rect")
    .data(dailyData)
    .join("rect")
    .attr("class", "block-rect")
    .attr("x", (d) => x(d.date) - 20)
    .attr("y", blockY)
    .attr("width", blockW)
    .attr("height", blockH)
    .attr("fill", (d) => colorScale(d.avg_views))
    .attr("opacity", 0.8)
    .on("mousemove", function (event, d) {
      d3.select(this).classed("hovered", true);
      const thumbs = d.thumbnail_urls.split(",");
      tooltip
        .style("opacity", 1)
        .html(
          `<div class="tooltip-content">
            <span class="tooltip-date">${d3.utcFormat("%m/%d/%Y")(d.date)}</span><br/>
            ${
              d.count_shorts === 1
                ? `Views: ${d3.format(",")(Math.round(d.avg_views))}<br/>`
                : `Average Views: ${d3.format(",")(Math.round(d.avg_views))}<br/>`
            }
            ${thumbs.map((u) => `<img src="${u}" class="block-thumbnail"/>`).join("")}
          </div>`,
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 120}px`);
    })
    .on("mouseout", function () {
      d3.select(this).classed("hovered", false);
      tooltip.style("opacity", 0);
    });

  svg.on("mouseleave", removeThumbnailGroup);
  svg.on("mousedown", removeThumbnailGroup);
  // Use native event listener with passive flag for touchstart
  svg
    .node()
    .addEventListener("touchstart", removeThumbnailGroup, { passive: true });

  const dataMin = d3.min(subsData, (d) => d.Date).getTime();
  const dataMax = d3.max(subsData, (d) => d.Date).getTime();

  const attributionByDate = d3.group(attributionData, (d) =>
    d3.timeFormat("%Y-%m-%d")(d.peak_date),
  );

  const peakGroup = content.append("g").attr("class", "peaks");

  const thumbW = 150,
    thumbH = 130,
    spacing = 10;

  let hoverTimeout = null;
  let isMarkerHovered = false;
  let isThumbHovered = false;

  function showThumbnails(px, py, attribs, peak) {
    removeThumbnailGroup();
    const totalWidth = attribs.length * thumbW + (attribs.length - 1) * spacing;
    // Chart area bounds
    const chartLeft = margin.left;
    const chartRight = width - margin.right;
    // Default: center the tooltip
    let tooltipX = px - totalWidth / 2;
    // If it would be clipped on the left, shift right
    if (tooltipX < chartLeft) {
      tooltipX = chartLeft;
    }
    // If it would be clipped on the right, shift left
    if (tooltipX + totalWidth > chartRight) {
      tooltipX = chartRight - totalWidth;
    }
    const g = svg
      .append("g")
      .attr("class", "thumbnail-group")
      .attr("transform", `translate(${tooltipX},${py - thumbH - 40})`)
      .on("mouseenter", function () {
        isThumbHovered = true;
        if (hoverTimeout) clearTimeout(hoverTimeout);
      })
      .on("mouseleave", function () {
        isThumbHovered = false;
        hoverTimeout = setTimeout(() => {
          if (!isMarkerHovered && !isThumbHovered) removeThumbnailGroup();
        }, 100);
      });

    g.append("foreignObject")
      .attr("x", 0)
      .attr("y", -58)
      .attr("width", totalWidth)
      .style("overflow", "visible")
      .html(
        `<div class="thumbnail-tooltip-group">
          <div class="thumbnail-summary">
            On ${d3.timeFormat("%B %-d, %Y")(peak.date)}, subscriber gains spiked to ${d3.format(",")(peak.value)}.<br>
            Here are the videos that performed well and were posted before then:
          </div>
          <div style='display:flex;gap:${spacing}px;'>
            ${attribs
              .map(
                (d) => `
              <div class="thumbnail-flex-col" style="width:${thumbW}px;">
                <img src="https://img.youtube.com/vi/${d.candidate_video_id}/hqdefault.jpg" class="peak-thumbnail" data-id="${d.candidate_video_id}"/>
                <div class="thumbnail-caption">${d.narrative || d.title || ""}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>`,
      );
    // Attach click handler to all images
    g.selectAll("foreignObject img").on("click", function (event) {
      const id = this.getAttribute("data-id");
      window.open(`https://www.youtube.com/shorts/${id}`, "_blank");
    });
  }

  function removeThumbnailGroup() {
    d3.selectAll(".thumbnail-group").remove();
  }

  peakGroup
    .selectAll("circle")
    .data(peakData)
    .join("circle")
    .attr("cx", (d) => x(d.date))
    .attr("cy", (d) => y(d.value))
    .attr("r", 7)
    .attr("fill", "#e29191")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .on("mouseenter", function (event, d) {
      isMarkerHovered = true;
      if (hoverTimeout) clearTimeout(hoverTimeout);
      const dateStr = d3.timeFormat("%Y-%m-%d")(d.date);
      const attribs = attributionByDate.get(dateStr);
      if (!attribs) return;
      const px = x(d.date),
        py = y(d.value);
      showThumbnails(px, py, attribs, d); // pass peak info
    })
    .on("mouseleave", function () {
      isMarkerHovered = false;
      hoverTimeout = setTimeout(() => {
        if (!isMarkerHovered && !isThumbHovered) removeThumbnailGroup();
      }, 100);
    })
    .append("title")
    .text(
      (d) => `Peak: ${d3.timeFormat("%Y-%m-%d")(d.date)} (${d.value} subs)`,
    );

  let scrollVelocity = 0;
  let isScrolling = false;

  function smoothScroll() {
    if (Math.abs(scrollVelocity) < 0.1) {
      scrollVelocity = 0;
      isScrolling = false;
      return;
    }
    const innerW = width - margin.left - margin.right;
    const spanMs = currentRange[1] - currentRange[0];
    const timeOffset = scrollVelocity * (spanMs / innerW);

    let newStart = currentRange[0].getTime() + timeOffset;
    let newEnd = currentRange[1].getTime() + timeOffset;
    if (newStart < dataMin) (newStart = dataMin), (newEnd = dataMin + spanMs);
    else if (newEnd > dataMax)
      (newEnd = dataMax), (newStart = dataMax - spanMs);

    currentRange = [new Date(newStart), new Date(newEnd)];
    x.domain(currentRange);

    svg
      .select(".x-axis")
      .call(
        d3.axisBottom(x).ticks(30).tickFormat(d3.utcFormat("%-d")).tickSize(0),
      )
      .selectAll("text")
      .attr("dy", "1.2em");
    path.attr("d", line);

    peakGroup
      .selectAll("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.value));

    blocksGroup
      .selectAll("rect")
      .attr("x", (d) => x(d.date) - 20)
      .attr("width", blockW);

    svg
      .select(".month-year-label")
      .text(
        `${d3.utcFormat("%B")(currentRange[0])} ${d3.utcFormat("%Y")(currentRange[0])}`,
      );

    scrollVelocity *= 0.9;
    requestAnimationFrame(smoothScroll);
  }

  // Use native event listener for wheel to control passive behavior
  svg.node().addEventListener(
    "wheel",
    function (event) {
      removeThumbnailGroup();
      lineTooltip.style("opacity", 0);
      event.preventDefault();
      scrollVelocity += -event.deltaY * 0.3;
      focus.style("display", "none");
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(smoothScroll);
      }
    },
    { passive: false },
  ); // passive: false because we need preventDefault()

  svg.on("mouseleave", function () {
    lineTooltip.style("opacity", 0);
    removeThumbnailGroup();
  });
}
