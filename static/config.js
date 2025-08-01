// Configuration for API endpoints
const config = {
  // Development: local Flask server
  development: {
    apiBaseUrl: "http://localhost:5001",
  },
  // Production: deployed backend (you'll need to update this URL)
  production: {
    apiBaseUrl: "https://web-production-d6c78.up.railway.app", // Replace with your actual Railway URL
  },
};

// Get current environment
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const currentConfig = isDevelopment ? config.development : config.production;

const API_BASE_URL = currentConfig.apiBaseUrl;
