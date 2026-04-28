//  uploading local files,images,videos to cloudinary
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
});

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const fileUploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null; // Return null if no file path is provided
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // auto-detect the file type (image, video, etc.)
        });
        console.log("File uploaded to Cloudinary:", result.secure_url);
        return result.secure_url; // Return the secure URL of the uploaded file
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file when upload fails in case of an error
        return null; // Return null if the upload fails
    }
};


export {fileUploadOnCloudinary};