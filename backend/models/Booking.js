import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true },
    customerPhone: { type: String, required: true },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    travelDate: { type: String, required: true }, // selected departure date slot
    sharingSelected: {
      type: String,
      required: true,
      enum: ["doubleSharing", "tripleSharing", "quadSharing"],
    },
    totalTravelers: { type: Number, required: true, min: 1 },
    travelersList: [{ type: String }], // list of additional traveler names
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    transactionId: { type: String, default: "" },
    amountPaid: { type: Number, required: true }, // calculated deposit paid
    totalCost: { type: Number, required: true }, // total cost calculated
    couponCode: { type: String, default: "" },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
