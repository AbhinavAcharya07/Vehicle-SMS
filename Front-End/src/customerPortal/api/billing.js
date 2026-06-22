import apiClient from "./client";


export const getLiveBillingRequest = (vehicleId) =>
  apiClient
    .get(`/vehicles/${vehicleId}/billing/live`)
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 404) return null;
      throw err;
    });


export const acceptBillingRequest = (billId) =>
  apiClient.post(`/billing/${billId}/accept`).then((res) => res.data);

export const declineBillingRequest = (billId, reason) =>
  apiClient
    .post(`/billing/${billId}/decline`, { reason })
    .then((res) => res.data);

export const getRecentBillingRequests = (vehicleId) =>
  apiClient
    .get(`/vehicles/${vehicleId}/billing/recent`)
    .then((res) => res.data);

    export const getMyBillingHistory = () =>
  apiClient
    .get("/vehicles/my/billing/recent")
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 404) return [];
      throw err;
    });