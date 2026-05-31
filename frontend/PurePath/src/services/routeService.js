import apiClient from "./apiClient";

const getRoute = async (start, end) => {
  try {
    const response = await apiClient.post("/api/route/api", { start, end });
    return response.data;
  } catch (err) {
    console.log("error in getting response from backend", err);
    throw err;
  }
};

export { getRoute };
