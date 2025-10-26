import axios from "axios";

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Extract listing data using AI
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