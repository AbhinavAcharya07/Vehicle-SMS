import apiClient from "./client";

export const getBillingOverview = () =>
  apiClient.get("/admin/billing").then((res) => res.data);

export const saveBillingDraft = (id, payload) =>
  apiClient.patch(`/admin/job-cards/${id}/save-draft`, payload).then((res) => res.data);

export const markDoneAndSend = (id, payload) =>
  apiClient.post(`/admin/job-cards/${id}/mark-done-and-send`, payload).then((res) => res.data);

export const closeBilling = (id) =>
  apiClient.post(`/admin/job-cards/${id}/close`).then((res) => res.data);