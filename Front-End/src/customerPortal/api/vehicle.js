import apiClient from "./client";

export const getMyVehicle = () =>
  apiClient
    .get("/vehicles/me")
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 404) return null;
      throw err;
    });

export const getServiceTracking = (vehicleId) =>
  apiClient
    .get(`/vehicles/${vehicleId}/tracking`)
    .then((res) => res.data)
    .catch((err) => {
      if (err.response?.status === 404) return null;
      throw err;
    });
