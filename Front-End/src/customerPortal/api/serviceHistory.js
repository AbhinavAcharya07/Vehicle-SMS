import apiClient from "./client";


export const getServiceHistory = (vehicleId) =>
  apiClient.get(`/vehicles/${vehicleId}/service-history`).then((res) => res.data);
