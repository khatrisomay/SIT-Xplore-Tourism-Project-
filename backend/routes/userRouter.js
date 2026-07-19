import express from "express";
import { signup, login, getMe, seedAdmin } from "../controllers/authController.js";
import authMiddleware from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.get("/me", authMiddleware, getMe);
userRouter.post("/seed-admin", seedAdmin);

export default userRouter;
