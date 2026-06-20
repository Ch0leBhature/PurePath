import {User} from "../models/user.model.js";


const generateAccessAndRefreshTokens = async function(userId){
  try
  {
    const user=await User.findById(userId)
    const accessToken=user.generateAccessToken();
    const refreshToken=user.generateRefreshToken();
    user.refreshToken=refreshToken
    console.log(
      process.env.ACCESS_TOKEN_SECRET
    );

    console.log(
      process.env.REFRESH_TOKEN_SECRET
    ); 
    await user.save({validateBeforeSave:false})
    return {accessToken,refreshToken};
  }catch(error)
  {
    throw new Error(
      "something went wrond while generating access or refresh tokens"
    )
  }

}

//todo
//1.get data from frontend, check for empty    *
//2.check if already exists                    *
//3.if not create it
//4.remove password and refresh token from response
//5.check for usr creation
//6.return response

const registerUser = async function(req,res){
  try
  {
    const {username,email,password} = req.body;
    
    if ([username, email, password].some((field) => !field || field.toString().trim() === "")) {
      return res.status(400).json({ message: "username, email, and password are required" });
    }

    const usrExists=await User.findOne({
      $or:[{username},{email}]
    })

    if(usrExists){
      return res.status(409).json({message:"username or email already exits"})
    }

    const user = await User.create({
      username: username.toString().trim(),
      email: email.toString().trim(),
      password,
    });
    
    const usrCreated = await User.findById(user._id).select("-password -refreshToken")
    
    if(!usrCreated){
      return res.status(500).json({message:"something went wrong while creating the user"})

    }
    
    return res.status(201).json({
      message:"User created successfully",
      user:usrCreated
    })

  }catch(error)
  {
    console.log("registration Error", error)
    
    return res.status(500).json({
      message:"Internal Server Error"
    });
  
  }
}

//take data from frontend
//check for empty data
//check the user exists or not
//if found check password
//if valid then generate tokens
//make a user response remove pass and refresh tokens
//send cookies

const loginUser = async function(req,res) {
  try
  {
    console.log("LOGIN HIT") 
    const {username,email,password}=req.body;

        
    if(!username && !email){
      return res.status(400).json({message:"username or email fields are required"})
    }
    if(!password){
      return res.status(400).json({message:"password is required"})
    }
    const userFound = await User.findOne({
      $or: [{username},{email}]
    }) 
    if(!userFound){
      return res.status(404).json({message: "user does not exists"});
    }

    const isPassValid = await userFound.isPasswordCorrect(password);
    if(!isPassValid){
      return res.status(404).json({message:"Invalid Credentials"})
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(userFound._id);
    const loggedInUser= await User.findById(userFound._id).select("-password -refreshToken")

    const options={
      httpOnly:true,
      // secure:true,
    }   
   
    return res
    .status(200)
    .cookie(
      "accessToken",
      accessToken,
      options
    )
    .cookie(
      "refreshToken",
      refreshToken,
      options
    )
    .json({

      user: loggedInUser,

      accessToken,
      refreshToken,

      message:
        "user logged in successfully"

    });
  }catch(error)
  {
    console.log("login error",error);

    return res.status(500).json({
      message:"Internal server error"
    });
  }
}


const logoutUser = async function(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });

    const options = {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: "none",
      
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    console.log("logout error", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { registerUser, loginUser, logoutUser };
