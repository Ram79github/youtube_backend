import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import dns from "dns";
const app = express();

dotenv.config(
    {
        path: "./.env"
    }
);
// dns changes to avoid dns lookup issues in some environments
dns.setServers(["1.1.1.1","8.8.8.8"]);
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
