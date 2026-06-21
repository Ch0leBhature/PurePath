import { configDotenv } from "dotenv";
import mongoose, { connect } from "mongoose";

configDotenv({
  path: new URL("../.env", import.meta.url).pathname,
})
const DB_NAME = "PurePath"

const connectDB = async() => {
  try{
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    // console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`)
    
  }catch(err){
    // console.log("Eroor connecting to the Database ",err)
    
  }
}

export default connectDB;
