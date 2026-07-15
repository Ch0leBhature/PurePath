import apiClient from "./apiClient";

const getSavedRoutes = async () => {
  const response = await apiClient.get("/api/saved");
  return response.data;
};

const saveRoute = async (route) => {
  const payload = {
    source: route.src || route.source,
    destination: route.dest || route.destination,
    aqi: route.avgAqi ?? route.aqi,
    exposure: route.exposure,
    eta: route.eta,
    distance: route.distance,
    coordinates: Array.isArray(route.coordinates)
      ? route.coordinates
      : undefined,
  };

  const response = await apiClient.post("/api/saved/save", payload);
  return response.data;
};

const deleteRoute = async (id) => {
  const response = await apiClient.delete(`/api/saved/${id}`);
  return response.data;
};

export { getSavedRoutes, saveRoute, deleteRoute };
