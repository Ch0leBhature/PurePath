import axios from "axios";
import { configDotenv } from "dotenv";

configDotenv({
  path: new URL("../.env", import.meta.url).pathname,
});

const ALLOWED_PROFILES = ["driving-car", "foot-walking"];

const RETRYABLE_ORS_STATUSES = new Set([500, 502, 503, 504]);

const postDirections = async (url, requestBody) => {
  const response = await axios.post(url, requestBody, {
    headers: {
      Authorization: process.env.ORS_API_KEY,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

const getLocData = async (
  start,
  end,
  mode = "driving-car",
  targetCount = 3,
) => {
  const profile = ALLOWED_PROFILES.includes(mode) ? mode : "driving-car";

  const ORS_API_URL = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
  const attempts = [];

  const preferredRequest = {
    coordinates: [start, end],
    radiuses: [1000, 1000],
  };

  if (targetCount > 1) {
    preferredRequest.alternative_routes = {
      target_count: targetCount,
      share_factor: 0.6,
      weight_factor: 1.6,
    };
  }

  attempts.push({
    label:
      targetCount > 1 ? "alternatives-with-radiuses" : "single-with-radiuses",
    body: preferredRequest,
  });

  attempts.push({
    label:
      targetCount > 1
        ? "alternatives-without-radiuses"
        : "single-without-radiuses",
    body: {
      coordinates: [start, end],
      ...(targetCount > 1
        ? {
            alternative_routes: {
              target_count: targetCount,
              share_factor: 0.6,
              weight_factor: 1.6,
            },
          }
        : {}),
    },
  });

  if (targetCount > 1) {
    attempts.push({
      label: "single-route-fallback",
      body: {
        coordinates: [start, end],
      },
    });
  }

  let lastError;

  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];

    try {
      return await postDirections(ORS_API_URL, attempt.body);
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const shouldRetry =
        index < attempts.length - 1 && RETRYABLE_ORS_STATUSES.has(status);

      console.warn("ORS request attempt failed", {
        attempt: attempt.label,
        status,
        data: err.response?.data,
        message: err.message,
        targetCount,
        profile,
        willRetry: shouldRetry,
      });

      if (!shouldRetry) {
        break;
      }
    }
  }

  console.error("ORS request failed", {
    status: lastError?.response?.status,
    data: lastError?.response?.data,
    message: lastError?.message,
    targetCount,
    profile,
  });
  throw lastError;
};

export { getLocData };
