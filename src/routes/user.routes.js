import { Router } from "express";
import { registerUser ,logInUser,logOutUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    //this is a middleware that do file uploading 
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
);
router.route("/login").post(logInUser)
//secure route
router.route("/logout").post(verifyJWt,logOutUser)
export default router;