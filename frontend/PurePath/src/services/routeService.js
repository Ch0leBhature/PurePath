import axios from "axios";

const ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

export const getRoute = async (start, end) => {
  const response = await axios.post("http://localhost:5000/api/route/getroute",{start , end})
  
  

  return response.data;
};

