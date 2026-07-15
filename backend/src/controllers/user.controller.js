import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

const requiredAuthEnv = [
  "ACCESS_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRY",
];

const getMissingAuthEnv = () =>
  requiredAuthEnv.filter(
    (key) => !process.env[key] || !String(process.env[key]).trim(),
  );

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateAccessAndRefreshTokens = async function (userId) {
  try {
    const missingAuthEnv = getMissingAuthEnv();
    if (missingAuthEnv.length) {
      throw new Error(`Missing auth env: ${missingAuthEnv.join(", ")}`);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found while generating tokens");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(
      "generateAccessAndRefreshTokens failed",
      error?.stack || error,
    );
    throw error;
  }
};

const registerUser = async function (req, res) {
  try {
    const { username, email, password } = req.body;

    if (
      [username, email, password].some(
        (field) => !field || field.toString().trim() === "",
      )
    ) {
      return res
        .status(400)
        .json({ message: "username, email, and password are required" });
    }

    const usrExists = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (usrExists) {
      return res
        .status(409)
        .json({ message: "username or email already exits" });
    }

    const user = await User.create({
      username: username.toString().trim(),
      email: email.toString().trim(),
      password,
    });

    const usrCreated = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    if (!usrCreated) {
      return res
        .status(500)
        .json({ message: "something went wrong while creating the user" });
    }

    return res.status(201).json({
      message: "User created successfully",
      user: usrCreated,
    });
  } catch (error) {
    console.error("registerUser error", error?.stack || error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const loginUser = async function (req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username && !email) {
      return res
        .status(400)
        .json({ message: "username or email fields are required" });
    }
    if (!password) {
      return res.status(400).json({ message: "password is required" });
    }

    const userFound = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (!userFound) {
      return res.status(404).json({ message: "user does not exists" });
    }

    const isPassValid = await userFound.isPasswordCorrect(password);
    if (!isPassValid) {
      return res.status(404).json({ message: "Invalid Credentials" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      userFound._id,
    );
    const loggedInUser = await User.findById(userFound._id).select(
      "-password -refreshToken",
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "user logged in successfully",
      });
  } catch (error) {
    console.error("loginUser error", error?.stack || error);
    const message = error?.message?.startsWith("Missing auth env:")
      ? error.message
      : "Internal server error";
    return res.status(500).json({
      message,
    });
  }
};

const refreshAccessToken = async function (req, res) {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decoded?._id);
    if (!user || !user.refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    if (user.refreshToken !== incomingRefreshToken) {
      return res
        .status(401)
        .json({ message: "Refresh token expired or rotated" });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        accessToken,
        refreshToken,
        message: "Access token refreshed successfully",
      });
  } catch (error) {
    return res.status(401).json({
      message: error?.message || "Invalid refresh token",
    });
  }
};

const logoutUser = async function (req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await User.findByIdAndUpdate(userId, { refreshToken: null }, { new: true });

    return res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("logoutUser error", error?.stack || error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { registerUser, loginUser, refreshAccessToken, logoutUser };
