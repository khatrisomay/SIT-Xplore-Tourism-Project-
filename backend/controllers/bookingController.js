import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import { v4 as uuidv4 } from "uuid";
import { sendInvoiceEmail } from "../utils/emailService.js";

export const createBooking = async (req, res) => {
  try {
    const {
      packageId,
      customerName,
      customerEmail,
      customerPhone,
      travelDate,
      sharingSelected,
      totalTravelers,
      travelersList,
    } = req.body;

    if (!packageId || !customerName || !customerEmail || !customerPhone || !travelDate || !sharingSelected || !totalTravelers) {
      return res.status(400).json({ success: false, message: "Please fill in all booking details." });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Tour package not found." });
    }

    // Determine cost per person based on selected sharing option
    let pricePerPerson = 0;
    if (sharingSelected === "doubleSharing") {
      pricePerPerson = pkg.sharingPrices.doubleSharing;
    } else if (sharingSelected === "tripleSharing") {
      pricePerPerson = pkg.sharingPrices.tripleSharing;
    } else if (sharingSelected === "quadSharing") {
      pricePerPerson = pkg.sharingPrices.quadSharing;
    } else {
      return res.status(400).json({ success: false, message: "Invalid sharing type selected." });
    }

    const baseCost = pricePerPerson * Number(totalTravelers);
    const gstAmount = Math.round(baseCost * 0.05);
    const totalCost = baseCost + gstAmount;
    // Booking deposit from package (e.g. 3000) multiplied by travelers count
    const amountPaid = pkg.bookingDeposit * Number(totalTravelers);

    const bookingId = `BK-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = await Booking.create({
      bookingId,
      user: req.user ? req.user._id : null,
      customerName,
      customerEmail,
      customerPhone,
      package: packageId,
      travelDate,
      sharingSelected,
      totalTravelers: Number(totalTravelers),
      travelersList: typeof travelersList === "string" ? JSON.parse(travelersList) : (travelersList || []),
      paymentStatus: "pending", // starts pending, transitions to paid during checkout validation
      amountPaid,
      totalCost,
    });

    return res.status(201).json({
      success: true,
      message: "Booking transaction initialized successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("createBooking error:", error);
    return res.status(500).json({ success: false, message: "Error initiating booking." });
  }
};

// Mock / Verify Payment completion endpoint
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Booking ID is required." });
    }

    const booking = await Booking.findOne({ bookingId }).populate("package");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking record not found." });
    }

    booking.paymentStatus = "paid";
    booking.transactionId = transactionId || `txn_mock_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    await booking.save();

    // Send payment confirmation email with PDF receipt
    sendInvoiceEmail(booking);

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified and booking active!",
      booking,
    });
  } catch (error) {
    console.error("confirmPayment error:", error);
    return res.status(500).json({ success: false, message: "Failed to confirm transaction payment." });
  }
};

export const listBookings = async (req, res) => {
  try {
    // Admin only list of bookings
    const bookings = await Booking.find({})
      .populate("package", "title duration category")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("listBookings error:", error);
    return res.status(500).json({ success: false, message: "Error retrieving booking records." });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userEmail = req.user.email;
    // Users can find bookings by email or by linked user ID
    const bookings = await Booking.find({
      $or: [{ user: req.user._id }, { customerEmail: userEmail }],
    })
      .populate("package", "title duration category bannerImage bookingDeposit")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("getMyBookings error:", error);
    return res.status(500).json({ success: false, message: "Error retrieving your bookings." });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking record not found." });
    }

    // Standard authorization check: user who booked or admin
    const isAdmin = req.user && req.user.role === "admin";
    const isOwner = req.user && booking.user && booking.user.toString() === req.user._id.toString();
    const isEmailOwner = req.user && booking.customerEmail === req.user.email;

    if (!isAdmin && !isOwner && !isEmailOwner) {
      return res.status(403).json({ success: false, message: "Unauthorized deletion attempt." });
    }

    await Booking.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Booking canceled and record removed." });
  } catch (error) {
    console.error("deleteBooking error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete booking." });
  }
};
