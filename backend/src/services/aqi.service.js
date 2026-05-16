import axios from "axios";
import { configDotenv } from "dotenv";
configDotenv({
  path: "./.env"
})

const getAiqData = async (lat,lon)=>{
  try{
    const res=await axios.get(
      
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OWM_API_KEY}`
    )

    return res.data
  }catch(err){
    console.log("error fetching aiq data",err)
    throw err;
  }
}

export {getAiqData};
