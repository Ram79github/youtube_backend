import mongoose, { connect } from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

dotenv.config({
   path: "./.env"
   });

async function connectDB () {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to the database successfully", connectionInstance.connection.host);
  }catch(error){
    console.error("Error connecting to the database:", error);
  }
};

export default connectDB;
