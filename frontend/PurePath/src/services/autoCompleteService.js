import axios from "axios";  



export const getSuggestions = async(query) =>{
  try{
    const res = await axios.get(
      `https://api.openrouteservice.org/geocode/autocomplete`,
      {
        params:{
          api_key: import.meta.env.VITE_ORS_API_KEY,
          text:query,
        }
      }
    )
    return res.data.features;

  }catch(err){
    // console.log(err);
    return [];
  }
}
