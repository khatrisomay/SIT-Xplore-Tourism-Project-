import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import { v4 as uuidv4 } from "uuid";
import { sendInvoiceEmail } from "../utils/emailService.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

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
      couponCode,
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

    // Process coupon code
    let discount = 0;
    const coupons = {
      "SX9K7P4M2Q": 500,
      "TR8N5XQ2L7": 500,
      "XP4V9M7K3R": 500,
      "SK2Z8Q7M5X": 1000,
      "TR9L4X8Q6N": 1000,
      "XP7M2K9R4V": 1000
    };
    if (couponCode) {
      const code = couponCode.toUpperCase().trim();
      if (coupons[code]) {
        // Query to check if the user/email has already used this coupon code on a completed/paid booking
        const query = {
          couponCode: code,
          paymentStatus: "paid",
          $or: [
            { customerEmail: customerEmail.toLowerCase().trim() }
          ]
        };
        if (req.user) {
          query.$or.push({ user: req.user._id });
        }

        const hasUsedCoupon = await Booking.findOne(query);
        if (hasUsedCoupon) {
          return res.status(400).json({ success: false, message: "This coupon code has already been used by your account." });
        }
        discount = coupons[code];
      } else {
        return res.status(400).json({ success: false, message: "Invalid coupon code." });
      }
    }

    const totalCost = Math.max(0, baseCost + gstAmount - discount);
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
      couponCode: couponCode ? couponCode.toUpperCase().trim() : "",
      discount,
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

export const createRazorpayOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: "Booking ID is required." });

    const booking = await Booking.findOne({ bookingId });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Booking is already paid." });
    }

    // amount in paise
    const amount = Math.round(booking.amountPaid * 100);

    const rzp = getRazorpayInstance();
    const order = await rzp.orders.create({
      amount,
      currency: "INR",
      receipt: booking.bookingId,
    });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({ success: false, message: "Failed to create payment order." });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }

    const booking = await Booking.findOne({ bookingId }).populate("package");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    booking.paymentStatus = "paid";
    booking.transactionId = razorpay_payment_id;
    await booking.save();

    sendInvoiceEmail(booking);

    return res.status(200).json({
      success: true,
      message: "Payment successfully verified and booking active!",
      booking,
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return res.status(500).json({ success: false, message: "Payment verification failed." });
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
