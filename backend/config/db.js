import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URL || "mongodb://localhost:27017/sitxplore";
    await mongoose.connect(connStr);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
