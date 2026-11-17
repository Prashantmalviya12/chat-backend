import {Router} from "express"
import { authController } from "../controllers/auth.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"
import { asyncHandler } from "../utils/asynchandler.js"

const router = Router()

router.post("/signup",asyncHandler(authController.signUp))
router.post("/signin",authController.signIn)
router.get("/me",verifyToken,authController.me)

export default router