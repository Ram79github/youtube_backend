//  uploading local files,images,videos to cloudinary
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
});

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_APIKEY, 
    api_secret: process.env.CLOUDINARY_SECRET,
    secure:true
});
const fileUploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null; // Return null if no file path is provided
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto", // auto-detect the file type (image, video, etc.)
        });
        
        console.log("File uploaded to Cloudinary:", result.secure_url);
        fs.unlinkSync(localFilePath); // Delete the local file after successful upload
        return result; // Return the full result object
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the local file when upload fails in case of an error
        console.log("Error uploading to Cloudinary:", error.message);
        return null; // Return null if the upload fails
    }
};


export {fileUploadOnCloudinary};