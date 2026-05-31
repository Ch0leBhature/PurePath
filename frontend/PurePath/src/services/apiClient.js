import axios from "axios";
console.log(import.meta.env.VITE_API_URL )
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
console.log(API_BASE_URL)
// Backend is expected to allow cross-origin requests and send auth cookies.
// withCredentials:true is required so browser forwards cookies for login and saved-route requests.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;
