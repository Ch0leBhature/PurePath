import { configDotenv } from "dotenv";
import { app } from "./app.js";
configDotenv({
  path:'./.env'
})

app.listen(process.env.PORT || 5000,()=>{
  console.log(`server is running on port - ${process.env.PORT}`);
})
