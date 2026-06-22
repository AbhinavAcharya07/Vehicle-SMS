import apiClient from "./client";

export const getCurrentUser = () =>
  apiClient.get("/customer/me").then((res) => res.data);

export function logoutUser() {
  localStorage.removeItem("autotrack_token");
  localStorage.removeItem("autotrack_user");
}