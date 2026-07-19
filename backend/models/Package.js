import mongoose from "mongoose";

const itineraryItemSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const sharingPricesSchema = new mongoose.Schema({
  doubleSharing: { type: Number, required: true, default: 0 },
  tripleSharing: { type: Number, required: true, default: 0 },
  quadSharing: { type: Number, required: true, default: 0 },
});

const packageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Domestic Trips", "International Trips", "Weekend Getaways", "Hotel Booking", "Bike Rental"],
    },
    duration: { type: String, required: true }, // e.g., "3N/4D" or "4N/5D"
    description: { type: String, default: "" },
    bannerImage: { type: String, required: true }, // Cover URL path
    galleryImages: [{ type: String }], // Itinerary/detail image paths
    sharingPrices: { type: sharingPricesSchema, required: true },
    bookingDeposit: { type: Number, required: true, default: 3000 }, // per traveler deposit
    inclusions: [{ type: String }],
    exclusions: [{ type: String }],
    itinerary: [itineraryItemSchema],
    slots: [{ type: String }], // list of departure dates (e.g. "2026-08-15")
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);
export default Package;
