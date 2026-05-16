import axios from "axios";


const getRoute = async (start, end) => {
  try{
    const response = await axios.post("http://localhost:5000/api/route/api", { start, end });
    return response.data;
  }catch(err){
    console.log("error in getting response from backend",err)
    throw err
  }
};


export {getRoute}
