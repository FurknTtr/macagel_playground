// API Base URL
export const API_BASE_URL = 
  typeof window !== "undefined"
    ? process.env.REACT_APP_API_URL || "http://localhost:3000"
    : process.env.REACT_APP_API_URL || "http://localhost:3000";

console.log("API Base URL:", API_BASE_URL);
