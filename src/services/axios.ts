import axios from "axios";
import { API_BASE_URL } from "../config";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Ensure headers exist before modifying them
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Optionally redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        window.location.href = "/login"; // force redirect
        console.error("Unauthorized! Redirecting to login...");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
