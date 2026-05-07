import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/user.models.js'
import {fileUploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
//generating access and refresh token by userId param
const generateAccessAndrefreshTokens = async(userId)=>{
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    // saving on db
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ValidateBeforeSave:false});

    return {accessToken , refreshToken}
    


  } catch (error) {
    throw new ApiError(500 ,"Somthing went wrong while generating refresh and access token")
  }

}

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
// login user
const logInUser= asyncHandler(async (req,res)=>{
 
  //req body ->data
  //username or email
  //find the user
  //password check 
  //access and refresh token
  //send cookie
  const {username,email,password}= req.body ;
  try{
    if(!email){
    throw new ApiError(400,"email is required")
  }
  const user= await User.findOne({
    $or:[{username},{email}]
  })

  if(!user){
    throw new ApiError(404 , "user not found")
  }
  // password validation 
  const isPasswordValid = await user.isPasswordCorrect(password)
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credintials")
  }
   
  const {accessToken , refreshToken} = await generateAccessAndrefreshTokens(user._id);

  //removing refreshtoken and password from send to lgged in user
  const loggedInUser= await user.findById(user._id).select("-password -refreshToken");
// sending cookies
  
  const options = {
    httpOnly:true,
    secure:true
  }
  return res.status(200).cookie("accessToken" ,accessToken ,options)
  .cookie("refreshToken" , refreshToken, options).json(
    new ApiResponse(
      200,
      {
       user:loggedInUser,accessToken,refreshToken
      },
      "User logged in successfully"
    )
  )
  } catch(error){
     throw error ;
  }
})
// logged out user
const logOutUser = asyncHandler(async (req,res) => {
//finding user by _id and removing from db by findbyidandupdate method
User.findByIdAndUpdate(
  req.user._id,
  {
    $set :{
        refreshToken: undefined
    }
  },
  {
    new:true
  }
)  
 const options = {
    httpOnly:true,
    secure:true
  }
  return res.status(200)
  .clearCookie("accessToken")
  .clearCookie("refreshToken")
  .json(new ApiResponse(200,{},"User logged out successfully"))

  
})

export { 
  registerUser,
  logInUser,
  logOutUser
};