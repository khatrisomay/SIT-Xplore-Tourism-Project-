import express from "express";
import multer from "multer";
import path from "path";
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e5);
    const ext = path.extname(file.originalname);
    cb(null, `pkg-${unique}${ext}`);
  },
});

const upload = multer({ storage }).fields([
  { name: "bannerImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

packageRouter.get("/", getPackages);
packageRouter.get("/:id", getPackageById);
packageRouter.post("/", authMiddleware, adminMiddleware, upload, createPackage);
packageRouter.put("/:id", authMiddleware, adminMiddleware, upload, updatePackage);
packageRouter.delete("/:id", authMiddleware, adminMiddleware, deletePackage);
packageRouter.post("/seed", seedPackages);

export default packageRouter;
