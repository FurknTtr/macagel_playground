// API Base URL
const isDev = typeof window !== "undefined" && window.location.hostname === 'localhost';

export const API_BASE_URL = isDev 
  ? "http://localhost:3000"
  : "https://macagel-backend-production.up.railway.app";

console.log("API Base URL:", API_BASE_URL);
