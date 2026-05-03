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
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//routes import 
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);


export default app;
