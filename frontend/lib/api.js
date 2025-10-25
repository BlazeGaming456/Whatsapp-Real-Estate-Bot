import axios from "axios";

// Create an axios instance with base configuration
// This makes it easier to make API calls to our backend
const api = axios.create({
  baseURL: "http://localhost:3001", // Backend server URL
  timeout: 10000, // Request timeout after 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// API functions for different endpoints

// Fetch listings with search, filter, and pagination
export const fetchListings = async (params = {}) => {
  try {
    const response = await api.get("/api/listings", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

// Fetch dashboard statistics
export const fetchStats = async () => {
  try {
    const response = await api.get("/api/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};

// Extract listing data using AI (if needed for testing)
export const extractListing = async (prompt, chatName) => {
  try {
    const response = await api.post("/extract", { prompt, chatName });
    return response.data;
  } catch (error) {
    console.error("Error extracting listing:", error);
    throw error;
  }
};

export default api;
