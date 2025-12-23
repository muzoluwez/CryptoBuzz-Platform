import axios from "axios";

const API_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
