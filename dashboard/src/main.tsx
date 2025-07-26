import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./App.css";

// Extend Window interface
declare global {
  interface Window {
    reactRootCreated?: boolean;
  }
  interface HTMLElement {
    _reactRootContainer?: any;
  }
}

// Find the dashboard root - try both possible IDs
let dashboardRoot = document.getElementById("dashboard-root");
if (!dashboardRoot) {
  dashboardRoot = document.getElementById("root");
}

if (dashboardRoot) {
  // Check if React is already rendered in this element
  if (dashboardRoot._reactRootContainer) {
    // React root already exists, skip initialization
  } else {
    window.reactRootCreated = true;

    try {
      // Clear any existing content
      dashboardRoot.innerHTML = "";

      // Create React root
      const root = ReactDOM.createRoot(dashboardRoot);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
    } catch (error) {
      console.error("Error initializing React app:", error);
      // Reset the flag if initialization fails
      window.reactRootCreated = false;
    }
  }
}
