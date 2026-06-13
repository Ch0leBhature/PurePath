import apiClient from "./apiClient";

const registerUser = async (payload) => {
  const response = await apiClient.post("/api/users/register", payload);
  return response.data;
};

const loginUser = async (payload) => {
  console.log("PAYLOAD SENT: ", payload);
  const response = await apiClient.post("/api/users/login", payload);
  console.log("RESPONSE: ", response);
  return response.data;
};

const logoutUser = async () => {
  const response = await apiClient.post("/api/users/logout");
  return response.data;
};

export { registerUser, loginUser, logoutUser };
