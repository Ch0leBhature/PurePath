import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv({
  path:'./.env'
})
const ORS_API_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

const getLocData=async(start, end) => {
  try{
    const response = await axios.post(
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
          Authorization:process.env.ORS_API_KEY,
          
          "Content-Type":"application/json"
        },
      }
    )
    return response.data

  }catch(err){
    console.log("ORS api error",err.message);
    throw err;
  }  
}

export {
  getLocData,
} 
