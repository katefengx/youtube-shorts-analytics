import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Find the dashboard root
const dashboardRoot = document.getElementById("dashboard-root");
if (dashboardRoot) {
  // Attach a shadow root
  const shadow = dashboardRoot.attachShadow({ mode: "open" });

  // Create a container for React to render into
  const reactRoot = document.createElement("div");
  shadow.appendChild(reactRoot);

  // Inject your CSS into the shadow root
  const style = document.createElement("style");
  style.textContent = `
    @import url('/static/dashboard/assets/index-D8b4DHJx.css');
  `;
  shadow.appendChild(style);

  // Render your app inside the shadow root
  ReactDOM.createRoot(reactRoot).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
