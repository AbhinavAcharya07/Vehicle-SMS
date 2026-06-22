import apiClient from "./client";



export const createJobCard = (payload) =>
  apiClient.post("/admin/job-cards", payload).then((res) => res.data);

export const listJobCards = () =>
  apiClient.get("/admin/job-cards").then((res) => res.data);

export const getJobCard = (id) =>
  apiClient.get(`/admin/job-cards/${id}`).then((res) => res.data);

export const updateProgress = (id, payload) =>
  apiClient.patch(`/admin/job-cards/${id}/progress`, payload).then((res) => res.data);

export const pushToBilling = (id) =>
  apiClient.post(`/admin/job-cards/${id}/push-to-billing`).then((res) => res.data);