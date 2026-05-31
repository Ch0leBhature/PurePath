import apiClient from "./apiClient";

const registerUser = async (payload) => {
  const response = await apiClient.post("/api/users/register", payload);
  return response.data;
};

const loginUser = async (payload) => {
  try{
    console.log("PAYLOAD SENT: ", payload);
    const response = await apiClient.post("/api/users/login", payload);
    console.log("RESPONSE: ",response)
    return response.data;
  }catch(err){
    console.log("AXIOS ERR: ",err ),
    console.log("RESPONSE: ",err.response),
    console.log("REQUEST: ",err.request)
  }
};

export { registerUser, loginUser };
