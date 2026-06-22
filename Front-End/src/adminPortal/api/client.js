import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("autotrack_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("autotrack_token");
      window.location.href = "/admin/login";
    }
    const message = error.response?.data?.message || error.message || "Something went wrong";
    const cleanError = new Error(message);
    cleanError.response = error.response; 
    return Promise.reject(cleanError);
  }
);

export default apiClient;