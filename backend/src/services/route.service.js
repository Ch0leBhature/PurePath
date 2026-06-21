import axios from "axios";
import { configDotenv } from "dotenv";

configDotenv({
  path: new URL("../.env", import.meta.url).pathname,
});

const ALLOWED_PROFILES = [
  "driving-car",
  "foot-walking",
];

const getLocData = async (
  start,
  end,
  mode = "driving-car",
  targetCount = 3
) => {
  const profile = ALLOWED_PROFILES.includes(mode)
    ? mode
    : "driving-car";

  const ORS_API_URL =
    `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

  try {
    const requestBody = {
      coordinates: [start, end],
      radiuses: [1000, 1000],
    };

    if (targetCount > 1) {
      requestBody.alternative_routes = {
        target_count: targetCount,
      };
    }

    const response = await axios.post(
      ORS_API_URL,
      requestBody,
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    // console.log("ORS STATUS:", err.response?.status);
    // console.log("ORS DATA:", err.response?.data);
    throw err;
  }};

export {
  getLocData,
};
