import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Check, Printer, ChevronRight, MapPin, Calendar, Users, FileText,
  Mail, Phone, Globe, Shield, CreditCard, Sparkles, User, BedSingle
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Helper function to convert numeric currency to Indian English Words
function numberToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  if (num === 0) return "Zero";

  const convertLessThanThousand = (n) => {
    if (n < 20) return a[n];
    const digit = n % 10;
    if (n < 100) return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
    return a[Math.floor(n / 100)] + " Hundred" + (n % 100 === 0 ? "" : " and " + convertLessThanThousand(n % 100));
  };

  let wordList = [];
  let temp = num;

  let hundred = temp % 1000;
  if (hundred > 0) {
    wordList.push(convertLessThanThousand(hundred));
  }
  temp = Math.floor(temp / 1000);

  if (temp > 0) {
    let thousand = temp % 100;
    if (thousand > 0) {
      wordList.unshift(convertLessThanThousand(thousand) + " Thousand");
    }
    temp = Math.floor(temp / 100);
  }

  if (temp > 0) {
    let lakh = temp % 100;
    if (lakh > 0) {
      wordList.unshift(convertLessThanThousand(lakh) + " Lakh");
    }
    temp = Math.floor(temp / 100);
  }

  if (temp > 0) {
    wordList.unshift(convertLessThanThousand(temp) + " Crore");
  }

  return wordList.join(" ") + " Only";
}

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
      <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] flex flex-col justify-between transition-colors">
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
      <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] flex flex-col justify-between transition-colors">
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
  const invoiceNumStr = booking.bookingId.slice(-4).toUpperCase();
  const formattedDate = new Date(booking.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col transition-colors duration-300 print:bg-white print:text-black">
      
      {/* Print page style settings for full width premium spacing */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        @media print {
          body, html, #root {
            background-color: white !important;
            background: white !important;
            color: #1e293b !important;
            font-size: 12px !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Reset container margins for print */
          main > * {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            padding: 0 !important;
          }
          /* Hide non-printable elements */
          .print-hidden, .print\\:hidden {
            display: none !important;
          }
          /* Force colors and background colors printing */
          .print-exact {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Card layout resets for print */
          article {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
          /* Natural spacing between main invoice sections */
          .invoice-section {
            margin-bottom: 24px !important;
            page-break-inside: avoid !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          table th, table td {
            padding: 10px 14px !important;
            border-bottom: 1px solid #e2e8f0 !important;
          }
        }
      `}</style>

      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 space-y-8 print:py-0 print:px-0">
        
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
        <article className="rounded-3xl bg-white text-slate-800 border border-gray-250 shadow-2xl relative overflow-hidden print:border-none print:shadow-none transition-colors duration-300">
          
          {/* Header Curved Banner */}
          <div className="invoice-section relative bg-[#072113] text-white p-8 overflow-hidden flex flex-col md:flex-row justify-between items-center border-b-4 border-[#e0a816] rounded-t-3xl print-exact">
            
            {/* Decorative yellow wave accent background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e0a816] rounded-bl-full opacity-5 pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-4 relative z-10 text-center md:text-left">
              <img
                src="/sit xplore new logo.png"
                alt="SIT Xplore Logo"
                className="w-16 h-16 object-cover rounded-full border-2 border-white/20"
              />
              <div>
                <span className="font-outfit font-extrabold text-3xl tracking-wider text-white">
                  SIT <span className="text-[#e0a816]">XPLORE</span>
                </span>
                <p className="text-[10px] text-gray-300 tracking-widest uppercase font-outfit mt-0.5">EXPLORE MORE, WORRY LESS</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Sonipat, Haryana | booking@sitxplore.in | www.sitxplore.in</p>
              </div>
            </div>

            {/* Google review and served stats */}
            <div className="mt-6 md:mt-0 text-[10px] font-outfit font-bold uppercase tracking-wider space-y-1.5 text-center md:text-right relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
              <div className="flex items-center justify-center md:justify-end gap-1.5">
                <span>🛡️</span> 50K+ TRIPS SERVED
              </div>
              <div className="flex items-center justify-center md:justify-end gap-1.5">
                <span>👥</span> 70,000+ HAPPY TRAVELERS
              </div>
              <div className="flex items-center justify-center md:justify-end gap-1.5 text-[#e0a816]">
                <span>★</span> 5★ GOOGLE REVIEWS
              </div>
            </div>
          </div>

          {/* Invoice Information Two-Column Header */}
          <div className="invoice-section grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border-b border-gray-150">
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold block">Booking Invoice</span>
              <h2 className="font-outfit font-extrabold text-2xl text-slate-800 uppercase tracking-tight">{booking.package?.title}</h2>
              <p className="text-xs text-gray-500 font-medium">Category: {booking.package?.category}</p>
            </div>

            <div className="flex flex-col justify-between md:items-end">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">Invoice No:</span>
                <span className="px-3 py-1 bg-[#072113] rounded text-[#e0a816] font-outfit font-extrabold text-xs tracking-wider print-exact">
                  SITX-{invoiceNumStr}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-600 font-semibold mt-2 md:mt-0 md:text-right">
                <p>INVOICE DATE : <span className="text-slate-800 font-bold">{formattedDate}</span></p>
                <p>BOOKING DATE : <span className="text-slate-800 font-bold">{formattedDate}</span></p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="invoice-section px-8 py-2">
            <h3 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-150 rounded-2xl p-6 bg-[#fcfbfa]">
              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Lead Traveler</span>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">👤 {booking.customerName}</p>
              </div>
              <div className="space-y-1 md:border-l border-gray-200 md:pl-6">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Email ID</span>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">✉ {booking.customerEmail}</p>
              </div>
              <div className="space-y-1 md:border-l border-gray-200 md:pl-6">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Mobile Number</span>
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">📞 {booking.customerPhone}</p>
              </div>
            </div>
          </div>

          {/* Travel Details Table */}
          <div className="invoice-section px-8 py-2">
            <h3 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">Travel Details</h3>
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-gray-200">
                    <th className="p-4 pl-6">Travel Parameter</th>
                    <th className="p-4 pr-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 text-slate-700 font-medium">
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 text-gray-500 font-bold">Departure Date</td>
                    <td className="p-4 pr-6 text-slate-800 font-bold">{booking.travelDate}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 text-gray-500 font-bold">Number of Travelers</td>
                    <td className="p-4 pr-6 text-slate-800">
                      {booking.totalTravelers} Traveler(s) {booking.travelersList?.length > 0 && `(${booking.travelersList.join(", ")})`}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 text-gray-500 font-bold">Room Sharing</td>
                    <td className="p-4 pr-6 text-slate-800 capitalize">{booking.sharingSelected?.replace("Sharing", " Sharing")}</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="p-4 pl-6 text-gray-500 font-bold">Route & Destination</td>
                    <td className="p-4 pr-6 text-slate-800">{booking.package?.title}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="invoice-section px-8 py-2">
            <h3 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="border border-gray-150 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Cost</span>
                <span className="text-2xl font-outfit font-extrabold text-slate-800 mt-2">₹ {booking.totalCost?.toLocaleString("en-IN")}</span>
              </div>
              <div className="border border-gray-150 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between">
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider block">Advance Paid</span>
                <span className="text-2xl font-outfit font-extrabold text-green-600 mt-2">₹ {booking.amountPaid?.toLocaleString("en-IN")}</span>
              </div>
              <div className="border border-gray-150 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">Remaining Balance</span>
                <span className="text-2xl font-outfit font-extrabold text-red-600 mt-2">₹ {remainingBalance?.toLocaleString("en-IN")}</span>
              </div>
            </div>
            
            <div className="bg-[#072113] text-white rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-l-4 border-[#e0a816] print-exact">
              <div>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">Paid Advance (In Words)</span>
                <span className="text-sm font-semibold text-white mt-1 block">{numberToWords(booking.amountPaid)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-extrabold tracking-widest rounded-full uppercase print-exact">
                ✓ Fully Paid
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="invoice-section px-8 py-2">
            <h3 className="font-outfit font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3">Terms & Conditions</h3>
            <div className="border border-gray-150 rounded-2xl p-6 bg-[#fcfbfa] text-[11px] text-slate-500 leading-relaxed space-y-2">
              <p>• <strong>Payment Due:</strong> The remaining balance of ₹ {remainingBalance?.toLocaleString("en-IN")} is due at the boarding time or 7 days prior to travel dates.</p>
              <p>• <strong>Cancellation Policy:</strong> Free cancellations are allowed up to 15 days before the departure date (excluding non-refundable reservation deposit charges).</p>
              <p>• <strong>Reporting Time:</strong> Please report at the specified pickup coordinates at least 30 minutes before the departure schedule.</p>
              <p>• <strong>Inclusions Support:</strong> For queries regarding hotel stays, sharing configurations, or route maps, reach out to booking@sitxplore.in or call +91-9050553507.</p>
            </div>
          </div>

          {/* Footer strip */}
          <div className="bg-[#072113] text-white p-6 rounded-b-3xl flex flex-col md:flex-row justify-between items-center gap-4 border-t-2 border-[#e0a816]/20 print-exact">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white">SIT Xplore Support</p>
              <p className="text-[10px] text-gray-400 font-medium">📞 +91-9050553507, 7027878371 | ✉ booking@sitxplore.in | 🌐 www.sitxplore.in</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-1 font-outfit text-xs">
              <p className="italic font-bold text-white text-sm">Thank You for Booking!</p>
              <p className="text-[9px] text-[#e0a816] tracking-widest uppercase font-extrabold">Explore More, Worry Less</p>
            </div>
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
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
