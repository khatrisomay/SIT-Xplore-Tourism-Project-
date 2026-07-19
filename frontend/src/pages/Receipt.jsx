import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Check, Printer, ChevronRight, MapPin, Calendar, Users, FileText } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Receipt() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/bookings/my");
        if (res.data?.success) {
          const match = res.data.bookings.find((b) => b._id === id);
          if (match) {
            setBooking(match);
          } else {
            setError("Booking invoice record not found.");
          }
        }
      } catch (err) {
        console.error("Error fetching invoice details:", err);
        setError("Failed to retrieve booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <p className="text-red-500 dark:text-red-400 font-outfit">{error || "Invoice not found."}</p>
          <Link to="/" className="text-brand-650 dark:text-brand-500 hover:underline text-sm font-semibold">Return to home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const remainingBalance = booking.totalCost - booking.amountPaid;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-3xl mx-auto w-full px-6 py-12 space-y-8 print:py-0 print:px-0">
        
        {/* Breadcrumbs (Hide on print) */}
        <div className="flex items-center gap-2 text-xs text-gray-500 font-outfit print:hidden">
          <Link to="/" className="hover:text-slate-800 dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/my-bookings" className="hover:text-slate-800 dark:hover:text-white transition-colors">My Bookings</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 dark:text-gray-300">Booking Receipt</span>
        </div>

        {/* Paid Banner notice */}
        <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-500/20 p-5 flex items-center gap-4 text-sm text-green-700 dark:text-green-400 print:hidden">
          <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-green-500 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-outfit font-bold">Booking Confirmed!</h3>
            <p className="text-xs text-slate-600 dark:text-gray-400 leading-normal mt-0.5">Your deposit of ₹{booking.amountPaid?.toLocaleString("en-IN")} was received. We have sent the confirmation invoice details to {booking.customerEmail}.</p>
          </div>
        </div>

        {/* Main Printable Ticket Card */}
        <article className="rounded-3xl bg-white dark:bg-[#111318] border border-gray-250 dark:border-white/5 p-8 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-500 print:hidden" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-gray-200 dark:border-white/5 pb-6 print:border-black/10">
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold print:text-gray-600">Travel Ticket & Invoice</span>
              <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white print:text-black">{booking.package?.title}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 print:text-gray-700">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-brand-500" /> {booking.package?.category}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-brand-500" /> {booking.travelDate}</span>
              </div>
            </div>

            {/* QR code wrapper */}
            <div className="shrink-0 flex flex-col items-center sm:items-end gap-1">
              <div className="p-2.5 bg-white rounded-xl border border-gray-200 dark:border-white/10 shrink-0 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${booking.bookingId}`}
                  alt="Booking QR Code"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5">Booking ID: {booking.bookingId}</span>
            </div>
          </div>

          {/* Grid specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-gray-200 dark:border-white/5 print:border-black/10">
            
            {/* Primary traveler info */}
            <div className="space-y-4">
              <h4 className="font-outfit font-bold text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400">Traveler Details</h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-gray-300 print:text-gray-800">
                <li><strong className="text-gray-550 dark:text-gray-500 print:text-gray-600 block">Lead Traveler:</strong> {booking.customerName}</li>
                <li><strong className="text-gray-550 dark:text-gray-500 print:text-gray-600 block">Phone Number:</strong> {booking.customerPhone}</li>
                <li><strong className="text-gray-550 dark:text-gray-500 print:text-gray-600 block">Email Address:</strong> {booking.customerEmail}</li>
              </ul>
            </div>

            {/* Tour configuration specs */}
            <div className="space-y-4">
              <h4 className="font-outfit font-bold text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400">Trip Configuration</h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-gray-300 print:text-gray-800">
                <li><strong className="text-gray-550 dark:text-gray-500 print:text-gray-600 block">Sharing Choice:</strong> <span className="capitalize">{booking.sharingSelected?.replace("Sharing", " Sharing")}</span></li>
                <li><strong className="text-gray-550 dark:text-gray-500 print:text-gray-600 block">Travelers Count:</strong> {booking.totalTravelers} Traveler(s)</li>
                {booking.travelersList?.length > 0 && (
                  <li>
                    <strong className="text-gray-550 dark:text-gray-500 print:text-gray-600 block">Additional Travelers:</strong>
                    {booking.travelersList.join(", ")}
                  </li>
                )}
              </ul>
            </div>

          </div>

          {/* Pricing calculations */}
          <div className="py-6 space-y-4">
            <h4 className="font-outfit font-bold text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400">Payment Breakdown</h4>
            <div className="border border-gray-200 dark:border-white/5 rounded-2xl p-5 bg-slate-50 dark:bg-[#111318]/40 space-y-3 text-xs print:border-black/10 print:text-black">
              <div className="flex justify-between">
                <span className="text-gray-500 print:text-gray-600">Total Booking Value:</span>
                <span className="font-bold text-slate-800 dark:text-white print:text-black">₹{booking.totalCost?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold border-b border-gray-200 dark:border-white/5 pb-3 print:text-green-600 print:border-black/10">
                <span>Paid Deposit Amount (Stripe Mocked):</span>
                <span>₹{booking.amountPaid?.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-1">
                <span className="text-brand-650 dark:text-brand-400">Remaining Balance:</span>
                <span className="font-outfit font-extrabold text-slate-900 dark:text-white print:text-black">₹{remainingBalance?.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-550 dark:text-gray-500 text-center leading-normal pt-2">
              Note: The remaining balance is payable directly to SIT Xplore coordinators 7 days before departure. Transaction ID: {booking.transactionId}.
            </p>
          </div>

        </article>

        {/* Buttons (Hide on print) */}
        <div className="flex gap-4 items-center justify-end print:hidden">
          <button
            onClick={handlePrint}
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10 hover:border-brand-500/30 text-xs font-outfit font-bold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-outfit font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Go to home</span>
          </Link>
        </div>

      </main>
      <Footer />
    </div>
  );
}
