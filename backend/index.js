import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import packageRouter from "./routes/packageRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import contactRouter from "./routes/contactRouter.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Static file hosting for image uploads
const uploadsDir = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", userRouter);
app.use("/api/packages", packageRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/contacts", contactRouter);

app.get("/", (req, res) => {
  res.send("SIT Xplore Tours API is running");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
