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

// Prevent multiple React root creation
console.log("main.tsx: Starting React app initialization...");
if (!window.reactRootCreated) {
  console.log("main.tsx: Creating React root...");
  window.reactRootCreated = true;

  // Find the dashboard root - try both possible IDs
  let dashboardRoot = document.getElementById("dashboard-root");
  if (!dashboardRoot) {
    dashboardRoot = document.getElementById("root");
  }
  if (dashboardRoot) {
    try {
      // Check if React is already rendered in this element
      if (dashboardRoot._reactRootContainer) {
        console.warn("React root already exists, skipping initialization");
      } else {
        // Clear any existing content
        dashboardRoot.innerHTML = "";

        // Create React root
        console.log("main.tsx: Creating React root for dashboard...");
        const root = ReactDOM.createRoot(dashboardRoot);
        root.render(
          <React.StrictMode>
            <App />
          </React.StrictMode>,
        );
        console.log("main.tsx: React app rendered successfully");
      }
    } catch (error) {
      console.error("Error initializing React app:", error);
      // Reset the flag if initialization fails
      window.reactRootCreated = false;
    }
  }
}
