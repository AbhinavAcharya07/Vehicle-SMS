import apiClient from "./client";


export const getCurrentStaff = () =>
  apiClient.get("/staff/me").then((res) => res.data);

export function logoutStaff() {
  localStorage.removeItem("autotrack_token");
  localStorage.removeItem("autotrack_user");
}