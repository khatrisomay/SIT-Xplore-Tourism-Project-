import express from "express";
import {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  seedPackages,
} from "../controllers/packageController.js";
import authMiddleware, { adminMiddleware } from "../middlewares/auth.js";

const packageRouter = express.Router();

packageRouter.get("/", getPackages);
packageRouter.get("/:id", getPackageById);
packageRouter.post("/", authMiddleware, adminMiddleware, createPackage);
packageRouter.put("/:id", authMiddleware, adminMiddleware, updatePackage);
packageRouter.delete("/:id", authMiddleware, adminMiddleware, deletePackage);
packageRouter.post("/seed", seedPackages);

export default packageRouter;
