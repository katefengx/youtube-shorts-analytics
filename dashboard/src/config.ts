// Configuration for API endpoints
export const config = {
  // Development: use Vite proxy (relative URL)
  development: {
    apiBaseUrl: "",
  },

  production: {
    apiBaseUrl: "https://web-production-d6c78.up.railway.app",
  },
};

// Get current environment
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const currentConfig = isDevelopment ? config.development : config.production;

export const API_BASE_URL = currentConfig.apiBaseUrl;
