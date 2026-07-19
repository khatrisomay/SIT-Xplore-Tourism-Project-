import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Calendar, Users, FileText, CheckCircle, Clock, Trash2, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MyBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/bookings/my");
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Error retrieving user bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking reservation?")) return;

    try {
      const res = await axios.delete(`/api/bookings/${id}`);
      if (res.data?.success) {
        setBookings(prev => prev.filter(b => b._id !== id));
      }
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Error canceling booking. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 space-y-8">
        
        <div className="space-y-2">
          <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">My Booking Logs</h2>
          <p className="text-sm text-gray-550 dark:text-gray-400">Manage your active tour packages and review payment confirmations.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 w-full rounded-2xl bg-[#fbfbf9] dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse" />
            <div className="h-40 w-full rounded-2xl bg-[#fbfbf9] dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 border border-gray-200 dark:border-white/5 rounded-3xl bg-[#fbfbf9] dark:bg-[#111318]/25 space-y-4 shadow-sm">
            <p className="text-gray-500 dark:text-gray-450 font-outfit text-base">You haven't initiated any booking logs yet.</p>
            <Link
              to="/"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-black text-xs font-outfit font-bold rounded-xl shadow-lg inline-block"
            >
              Explore Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isPaid = booking.paymentStatus === "paid";
              return (
                <article
                  key={booking._id}
                  className="rounded-2xl border border-gray-250 dark:border-white/5 bg-[#fbfbf9] dark:bg-[#111318]/50 overflow-hidden flex flex-col md:flex-row shadow-lg hover:border-brand-500/10 transition-all duration-300 animate-fade-in"
                >
                  
                  {/* Tour package thumbnail image */}
                  <div className="w-full md:w-56 h-36 md:h-auto shrink-0 relative bg-slate-100 dark:bg-white/5">
                    {booking.package?.bannerImage && (
                      <img
                        src={booking.package.bannerImage}
                        alt={booking.package.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Booking details content */}
                  <div className="p-6 flex-grow flex flex-col justify-between space-y-4 md:space-y-0">
                    
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-550 dark:text-gray-500 uppercase tracking-widest font-bold">
                          {booking.package?.category} • {booking.package?.duration}
                        </span>
                        <h3 className="font-outfit font-bold text-lg text-slate-900 dark:text-white">
                          {booking.package?.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-550 dark:text-gray-405 pt-1">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-500" /> Travel Date: {booking.travelDate}</span>
                          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-brand-500" /> Count: {booking.totalTravelers} traveler(s)</span>
                        </div>
                      </div>

                      {/* Payment Status Label badge */}
                      <div>
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 text-xs font-bold font-outfit uppercase">
                            <CheckCircle className="w-3.5 h-3.5" /> PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-bold font-outfit uppercase">
                            <Clock className="w-3.5 h-3.5" /> PENDING
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom stats & CTAs */}
                    <div className="border-t border-gray-200 dark:border-white/5 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="text-center sm:text-left self-start sm:self-auto">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Deposit Paid</span>
                        <span className="text-base font-outfit font-extrabold text-slate-900 dark:text-white">
                          ₹{booking.amountPaid?.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex gap-3 w-full sm:w-auto items-center justify-end">
                        
                        {/* Cancel Booking option */}
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="p-3 rounded-xl border border-gray-200 dark:border-white/5 hover:border-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
                          title="Cancel Reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {isPaid ? (
                          <Link
                            to={`/receipt/${booking._id}`}
                            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-500/30 text-xs font-outfit font-bold text-gray-750 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1.5"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View Ticket</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/verify-payment?bookingId=${booking.bookingId}`}
                            className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-outfit font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-brand-500/5 hover:shadow-brand-500/20"
                          >
                            <span>Checkout</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}

                      </div>

                    </div>

                  </div>

                </article>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
