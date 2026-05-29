import { configDotenv } from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

configDotenv({
  path: new URL("../.env", import.meta.url).pathname,
})

connectDB()
  .then(()=>{
    const server = app.listen(process.env.PORT || 5000, () => {
      console.log(`server is running on port - ${process.env.PORT}`);
    })
    
    server.on("error",(error)=>{
      console.log("SERVER ERR: ",error)
      process.exit(1)
    })

  })
.catch((error) => {
  console.log("MONGO DB CONNECTION ERROR !!!",error)
})


