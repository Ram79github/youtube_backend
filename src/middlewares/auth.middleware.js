import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWt= asyncHandler(async (req,res,next) => {
    try {
        //extracting access token from cookies and header
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if (!token) {
        throw new ApiError(404 , "Unauthorized token")
    }   
    // verifying  and decoding
    const decoded =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //importing from user model generateaccessandrefreshtoken
   const user = await User.findById(decoded?._id).select("-password -refreshToken");
   if (!user) {
     throw new ApiError(401,"Invalid Accesstoken")
   }
   req.user = user;
   return next();
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid access Token");
    }
  
})