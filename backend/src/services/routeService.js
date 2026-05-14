import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv({
  path:'./env'
})
const ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car";

const getLocData=async(start, end) => {
  const res = await axios.post(
    ORS_API_URL,
    {
      coordinates:
      [
        start,
        end,
      ],
    },
    {
      headers:
      {
        Authorization:process.env.VITE_ORS_API_KEY,
        
        "Content-Type":"application/json"
      },
    }
  )
  return response.data
}

export {
  getLocData,
} 
