import axios from "axios";

const axiosInstance = axios.create({
  baseUrl: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default axiosInstance;
