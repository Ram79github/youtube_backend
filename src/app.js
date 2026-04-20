import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
const app = express();

dotenv.config(
    {
        path: "./.env"
    }
);


//common middlewares
app.use(cookieParser({
    
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
export default app;
