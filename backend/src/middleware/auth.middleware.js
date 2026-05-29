import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT= async function(req,res,next) {
  try{
    console.log("helo from verifyJWT")
    const token=req.cookies?.accessToken  || 
    req.header("Authorization")?.replace("Bearer ", "");

    if(!token){
      return res.status(401).json({message:"Unauthorized request"})
    }
    const decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decoded?._id).select("-password -refreshToken")
    
    if(!user){
      return res.status(401).json({message:"Invalid access token"})
    }

    //custom prop added to req object to acuthenticate the user data
    req.user=user;

    next()
  }catch(err){
    return res.status(401).json({error: err?.message || "Invalid access token"})
  }
}
