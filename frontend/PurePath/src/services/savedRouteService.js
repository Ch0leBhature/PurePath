import axios from "axios";

const API_BASE = "http://localhost:5000/api/saved";

const getSavedRoutes = async () => {
  const response = await axios.get(API_BASE);
  return response.data;
};

const saveRoute = async (route) => {
  const response = await axios.post(API_BASE, route);
  return response.data;
};

const deleteRoute = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
};

export { getSavedRoutes, saveRoute, deleteRoute };
