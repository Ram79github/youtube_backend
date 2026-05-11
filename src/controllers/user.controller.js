import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { fileUploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
//generating access and refresh token by userId param
const generateAccessAndrefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    // saving on db
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Somthing went wrong while generating refresh and access token"
    );
  }
};

// register user
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  //check if user already exists:username,email
  //check for images, check for avatar
  //upload them cloudinary ,avatar
  //create user object  - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  // return res

  const { username, fullName, email, password } = req.body;

  // validation check for empty fields
  if (
   // [username, fullName, email, password].some((field) => field?.trim() === "")
    !username || !fullName || !email || !password
  ) {
    throw new ApiError(400, "all fields are required and should not be empty");
  }
  console.log("Received user registration data:", {
    username,
    fullName,
    email,
    password,
    files: req.files,
  });
  // check for existing user by email or username
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
// if user already exists with email or username then throw error
  if (existingUser) {
    throw new ApiError(409, "user already exists with this email or username");
  }
  // check for avatar and cover image in files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }
// upload files to cloudinary and get the url
  const avatar = await fileUploadOnCloudinary(avatarLocalPath);
  const coverImage = await fileUploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }
  // db entry object
  const user = await User.create({
    fullName: req.body.fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email.toLowerCase(),
    password,
    username: username.toLowerCase(),
  });
  console.log("User created successfully:", user);


  // validation check point for user
  // removing passowrd and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong");
  }
 
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User register successfully"));
});
// login user
const logInUser = asyncHandler(async (req, res) => {
  //req body ->data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie
  const { username, email, password } = req.body;
  try {
    if (!(email || username)) {
      throw new ApiError(400, "email or username is required");
    }
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }
    // password validation
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credintials");
    }

    const { accessToken, refreshToken } = await generateAccessAndrefreshTokens(
      user._id
    );

    //removing refreshtoken and password from send to lgged in user
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    // sending cookies

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message || "something went wrong while login user"
    );
  }
});
// logged out user
const logOutUser = asyncHandler(async (req, res) => {
  //finding user by _id and removing from db by findbyidandupdate method
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});


// refresh access token by refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(incomingRefreshToken){
    throw new ApiError(400,"unauthorized request");
  }


  try{
 // verify incoming refresh token
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  // find user by decoded token id and check if refresh token is same as incoming refresh token
  const user =  await User.findById(decodedToken?.id);
   if(!user){
    throw new ApiError(400,"Invalid refresh token");
  }
  if(user?.refreshToken !== incomingRefreshToken){
    throw new ApiError(400,"Refresh token is expired, please login again");
  }

  // generate new access token and refresh token
    const { accessToken, newRefreshToken } = await generateAccessAndrefreshTokens(user._id);
    const options = {
      httpOnly: true,
      secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(
      200,
      {accessToken:accessToken,refreshToken:newRefreshToken},
      "Access token refreshed successfully"
    ));
  }
  catch(error){
    throw new ApiError(401,error?.message || "Invalid refresh token");
  }
 
});




export { registerUser, logInUser, logOutUser, refreshAccessToken };
