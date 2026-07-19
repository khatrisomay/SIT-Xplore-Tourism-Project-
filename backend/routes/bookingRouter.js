import express from "express";
import {
  createBooking,
  confirmPayment,
  listBookings,
  getMyBookings,
  deleteBooking,
} from "../controllers/bookingController.js";
import authMiddleware, { adminMiddleware } from "../middlewares/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/", authMiddleware, createBooking);
bookingRouter.post("/confirm", authMiddleware, confirmPayment);
bookingRouter.get("/", authMiddleware, adminMiddleware, listBookings);
bookingRouter.get("/my", authMiddleware, getMyBookings);
bookingRouter.delete("/:id", authMiddleware, deleteBooking);

export default bookingRouter;
