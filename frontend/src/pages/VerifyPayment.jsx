import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function VerifyPayment() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) {
        setError("Invalid Booking transaction reference.");
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get("/api/bookings/my");
        if (res.data?.success) {
          const match = res.data.bookings.find((b) => b.bookingId === bookingId);
          if (match) {
            setBooking(match);
          } else {
            setError("Booking reference transaction not found.");
          }
        }
      } catch (err) {
        console.error("Error fetching booking detail:", err);
        setError("Failed to fetch booking transaction.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setPaying(true);
    setError("");

    const resLoad = await loadRazorpay();
    if (!resLoad) {
      setError("Razorpay SDK failed to load. Are you online?");
      setPaying(false);
      return;
    }

    try {
      const { data: orderData } = await axios.post("/api/bookings/razorpay-order", {
        bookingId: booking.bookingId,
      });

      if (!orderData.success) {
        setError(orderData.message || "Failed to create order.");
        setPaying(false);
        return;
      }

      const options = {
        key: "rzp_live_TFmNMQhNDfu8A7",
        amount: orderData.order.amount,
        currency: "INR",
        name: "SIT Xplore",
        description: "Booking Deposit for " + booking.package.title,
        image: "/sit xplore new logo.png",
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            setPaying(true);
            const verifyRes = await axios.post("/api/bookings/verify-razorpay", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking.bookingId,
            });
            if (verifyRes.data.success) {
              navigate(`/receipt/${verifyRes.data.booking._id}`);
            } else {
              setError("Payment verification failed.");
              setPaying(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            setError("Error verifying payment.");
            setPaying(false);
          }
        },
        prefill: {
          name: booking.customerName,
          email: booking.customerEmail,
          contact: booking.customerPhone,
        },
        theme: {
          color: "#eab308",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        setError("Payment failed: " + response.error.description);
      });
      paymentObject.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      setError(err.response?.data?.message || "Failed to initialize payment.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col justify-between transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg bg-white dark:bg-[#111318]/90 border border-gray-250 dark:border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6 z-10 relative">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-500 flex items-center justify-center mx-auto mb-2">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white">SIT Xplore Secure Checkout</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Complete booking deposit transaction to reserve your slots.</p>
          </div>

          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex gap-2.5 items-start p-4 bg-red-50 dark:bg-red-950/20 border border-red-250 dark:border-red-500/20 text-red-650 dark:text-red-400 text-xs rounded-2xl text-center">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 mx-auto text-red-500" />
              <p className="flex-grow text-left">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Order summary table */}
              <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-5 bg-slate-50 dark:bg-[#111318]/40 space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-2">
                  <span className="text-gray-500 dark:text-gray-400">Booking ID:</span>
                  <span className="font-outfit font-bold text-slate-900 dark:text-white">{booking.bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Destination:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right max-w-[200px] truncate">{booking.package?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Date of Travel:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{booking.travelDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Sharing Selected:</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 capitalize">
                    {booking.sharingSelected?.replace("Sharing", " Sharing")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total Travelers:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{booking.totalTravelers} Head(s)</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 dark:border-white/5 pt-3.5 text-base font-semibold">
                  <span className="text-brand-650 dark:text-brand-400">Booking Deposit Due:</span>
                  <span className="font-outfit font-extrabold text-slate-900 dark:text-white">₹{booking.amountPaid?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Secure transaction notice */}
              <div className="flex gap-3 items-center text-xs text-gray-500 dark:text-gray-455 px-2 leading-relaxed">
                <ShieldCheck className="w-8 h-8 text-brand-600 dark:text-brand-500 shrink-0" />
                <p>By clicking confirm, you authorize a secure transaction via Razorpay. Your payment details are fully encrypted and the booking will be confirmed instantly.</p>
              </div>

              {/* Pay trigger */}
              <button
                onClick={handleRazorpayPayment}
                disabled={paying}
                className="w-full py-4 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-500/50 text-black text-sm font-outfit font-extrabold rounded-2xl shadow-xl shadow-brand-500/10 hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{paying ? "Processing Payment..." : "Confirm & Pay Deposit"}</span>
                {!paying && <ArrowRight className="w-4 h-4" />}
              </button>

            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
