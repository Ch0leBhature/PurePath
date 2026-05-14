import axios from "axios";

const ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car";
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export const getRoute = async (start, end) => {
  if (!ORS_API_KEY) {
    throw new Error(
      "Missing OpenRouteService API key. Set VITE_ORS_API_KEY in your .env file."
    );
  }

  const response = await axios.get(ORS_API_URL, {
    params: {
      api_key: ORS_API_KEY,
      start: `${start[0]},${start[1]}`,
     
      end: `${end[0]},${end[1]}`,
      geometry_format: "geojson",
    },
  });
  console.log(response)
  return response.data;
};

