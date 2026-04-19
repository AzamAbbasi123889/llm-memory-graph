import Axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

const api = Axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    "Content-Type": "application/json"
  }
});

export const getFriendlyErrorMessage = (error, fallback = "Something went wrong.") => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    fallback;

  if (message.toLowerCase().includes("network")) {
    return "No connection to server.";
  }

  return message;
};

api.interceptors.request.use(
  (config) => {
    let persistedToken = null;
    try {
      persistedToken = JSON.parse(localStorage.getItem("neurograph.auth") || "{}")?.token;
    } catch (error) {
      persistedToken = null;
    }

    const token = useAuthStore.getState().token || persistedToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Request Failed:", error);
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRequest && useAuthStore.getState().isAuthenticated) {
      toast.error("Session expired. Please log in again.");
      useAuthStore.getState().logout("/login");
    } else if (status === 503) {
      toast.error("Server is unavailable. Please try again.");
    } else if (!error?.response) {
      toast.error("No connection to server.");
    } else {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
