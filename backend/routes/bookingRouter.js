import express from "express";
import {
  createBooking,
  confirmPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  listBookings,
  getMyBookings,
  deleteBooking,
} from "../controllers/bookingController.js";
import authMiddleware, { adminMiddleware } from "../middlewares/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/", authMiddleware, createBooking);
bookingRouter.post("/confirm", authMiddleware, confirmPayment);
bookingRouter.post("/razorpay-order", authMiddleware, createRazorpayOrder);
bookingRouter.post("/verify-razorpay", authMiddleware, verifyRazorpayPayment);
bookingRouter.get("/", authMiddleware, adminMiddleware, listBookings);
bookingRouter.get("/my", authMiddleware, getMyBookings);
bookingRouter.delete("/:id", authMiddleware, deleteBooking);

export default bookingRouter;
