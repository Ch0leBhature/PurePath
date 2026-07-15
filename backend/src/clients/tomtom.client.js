import axios from "axios";

const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;
const TOMTOM_BASE_URL = process.env.TOMTOM_BASE_URL || "https://api.tomtom.com";

export async function fetchTomTomFlowSegment(
  lat,
  lng,
  { style = "absolute", zoom = 10, unit = "KMPH" } = {},
) {
  if (!TOMTOM_API_KEY) {
    throw new Error("TOMTOM_API_KEY not configured");
  }

  const url = `${TOMTOM_BASE_URL}/traffic/services/4/flowSegmentData/${style}/${zoom}/json`;
  const res = await axios.get(url, {
    params: {
      key: TOMTOM_API_KEY,
      point: `${lat},${lng}`,
      unit,
    },
    timeout: 5000,
  });

  return res.data;
}

export default { fetchTomTomFlowSegment };
