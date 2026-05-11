import mongoose ,{Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema= new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true, 
        unique:true,
        lowercase:true,
        trim:true    
    },
    fullName:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        type:String, // by cloudinary url
    },
    coverImage:{
        type:String, // by cloudinary url
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId, // reference to the video model
            ref:"Video"
        }
    ],  
    refreshToken:{
        type:String,
    },
},{timestamps:true})
//hashing password before saving to db
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    return next();
});
//method to compare password during login
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};
//method to generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { 
            _id: this._id,
            username: this.username, 
            email: this.email,
            fullName: this.fullName,

        }, process.env.ACCESS_TOKEN_SECRET, 
        {
             expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        });
};
//method to generate refresh token
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

export const User =mongoose.model("User",userSchema)