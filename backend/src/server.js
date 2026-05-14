import { configDotenv } from "dotenv";
import { app } from "./app.js";
configDotenv({
  path:'./env'
})
const PORT=5000

app.listen(PORT,()=>{
  console.log(`server is running on port - ${PORT}`);
})
