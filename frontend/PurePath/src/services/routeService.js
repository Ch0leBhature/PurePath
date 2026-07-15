import apiClient from "./apiClient";

const getRoute = async (start, end, mode = "driving-car", preset = "balanced") => {
  try {
    const response = await apiClient.post("/api/route/api", { start, end, mode, preset });
    return response.data;
  } catch (err) {
    throw err;
  }
};

const getAnalytics = async () => {
  try {
    const response = await apiClient.get("/api/analytics/summary");
    return response.data;
  } catch (err) {
    throw err;
  }
};

export { getRoute, getAnalytics };
