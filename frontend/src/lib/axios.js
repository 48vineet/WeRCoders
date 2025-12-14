import axios from "axios";

// Use correct axios key `baseURL`; default to local API for dev.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export default axiosInstance;
