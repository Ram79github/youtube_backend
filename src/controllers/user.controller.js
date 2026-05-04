import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.models.js'
import {fileUploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

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

if([username,fullName,email,password].some(field => !field.trim()==="")){

  throw new ApiError(400,"all fields are required and should not be empty")
}

const existingUser = await User.findOne({
  $or:[
    {email},
    {username}  ],
})

if(existingUser){
  throw new ApiError(409,"user already exists with this email or username");
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
  throw new ApiError(400 ,"avatar file is required");
}

const avatar = await fileUploadOnCloudinary(avatarLocalPath);
const coverImage = await fileUploadOnCloudinary(coverImageLocalPath);
if(!avatar){
  throw new ApiError(400 ,"avatar file is required")
}
// db entry object 
const user = await User.create({
  fullName,
  avatar:avatar.url,
  coverImage:coverImage?.url || "",
  email,
  password,
  username:username.toLowerCase()
})

// validation check point for user
// removing passowrd and refreshToken
const createdUser = await User.findById(user._id).select(
  "-password -refreshToken"
);

if (!createdUser) {
  throw new ApiError(500, "something went wrong")
}


return res.status(201).json(
  new ApiResponse(201,createdUser,"User register successfully")
)
});


export { registerUser };