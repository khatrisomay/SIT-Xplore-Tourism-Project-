import express from "express";
import {
  submitQuery,
  getQueries,
  resolveQuery,
  deleteQuery,
} from "../controllers/contactController.js";
import authMiddleware, { adminMiddleware } from "../middlewares/auth.js";

const contactRouter = express.Router();

contactRouter.post("/", submitQuery);
contactRouter.get("/", authMiddleware, adminMiddleware, getQueries);
contactRouter.put("/:id", authMiddleware, adminMiddleware, resolveQuery);
contactRouter.delete("/:id", authMiddleware, adminMiddleware, deleteQuery);

export default contactRouter;
