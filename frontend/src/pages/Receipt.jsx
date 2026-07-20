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
      
      {/* Print color adjustment overrides */}
      <style>{`
        @media print {
          body, html, #root {
            background-color: white !important;
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 11px !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          main > * {
            margin-top: 0 !important;
            margin-bottom: 0 !important;
            padding: 0 !important;
          }
          /* Visual scale transform */
          article {
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Compress layout boxes for printing */
          .print-exact {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          /* Direct layout padding & margin compression */
          table td {
            padding: 4px 8px !important;
          }
          .p-6, .py-6, .px-6 {
            padding: 8px 12px !important;
          }
          .py-4, .px-4 {
            padding: 4px 12px !important;
          }
          .p-5 {
            padding: 8px 12px !important;
          }
          .my-4, .my-3, .my-2 {
            margin-top: 4px !important;
            margin-bottom: 4px !important;
          }
          .mx-6 {
            margin-left: 12px !important;
            margin-right: 12px !important;
          }
          .gap-6 {
            gap: 8px !important;
          }
          .space-y-3 > * + * {
            margin-top: 4px !important;
          }
          .space-y-4 > * + * {
            margin-top: 6px !important;
          }
          h2 {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
          }
          .text-3xl {
            font-size: 1.5rem !important;
          }
          img.w-14 {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }
        }
      `}</style>

      <div className="print:hidden">
        <Navbar />
      </div>

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
        <article className="rounded-3xl bg-white text-slate-800 border border-gray-250 shadow-2xl relative overflow-hidden print:border-none print:shadow-none transition-colors duration-300">
          
          {/* Header Curved Banner */}
          <div className="relative bg-[#072113] text-white p-6 pb-8 print:py-4 print:px-6 overflow-hidden flex flex-col sm:flex-row justify-between items-center border-b-4 border-[#e0a816] print-exact">
            
            {/* Decorative yellow wave accent background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e0a816] rounded-bl-full opacity-10 pointer-events-none" />

            <div className="flex items-center gap-3 relative z-10">
              <img
                src="/sit xplore new logo.png"
                alt="SIT Xplore Logo"
                className="w-14 h-14 object-cover rounded-full border-2 border-white/20"
              />
              <div>
                <span className="font-outfit font-extrabold text-2xl tracking-wider text-white">
                  SIT <span className="text-[#e0a816]">XPLORE</span>
                </span>
                <p className="text-[10px] text-gray-300 tracking-widest uppercase font-outfit">EXPLORE MORE, WORRY LESS</p>
              </div>
            </div>

            {/* Google review and served stats */}
            <div className="mt-4 sm:mt-0 text-[9px] font-outfit font-bold uppercase tracking-wider space-y-1 text-center sm:text-right relative z-10">
              <div className="flex items-center justify-center sm:justify-end gap-1">
                <span>🛡️</span> 50K+ TRIPS SERVED
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-1">
                <span>👥</span> 70,000+ HAPPY TRAVELERS
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-1 text-[#e0a816]">
                <span>★</span> 5★ GOOGLE REVIEWS
              </div>
            </div>
          </div>

          {/* Company Details & Invoice Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 print:py-3 print:px-6 print:gap-3 border-b border-gray-150">
            {/* Company Info */}
            <div className="space-y-1 text-xs text-slate-600">
              <h3 className="font-outfit font-extrabold text-sm text-[#072113]">SIT XPLORE</h3>
              <p className="text-[10px] text-gray-400 font-medium">(Sterling International Travel and Xplore)</p>
              <div className="space-y-1 pt-2 font-medium">
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#e0a816] shrink-0" /> <span><strong>Head Office:</strong> Sonipat, Haryana</span></p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#e0a816] shrink-0" /> <span><strong>Email:</strong> booking@sitxplore.in</span></p>
                <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-[#e0a816] shrink-0" /> <span><strong>Website:</strong> www.sitxplore.in</span></p>
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#e0a816] shrink-0" /> <span><strong>Contact:</strong> 9050553507, 7027878371</span></p>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="space-y-4 md:pl-6 md:border-l border-gray-150 flex flex-col justify-between print:space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-outfit font-extrabold text-slate-800 tracking-wider">INVOICE</h2>
                <div className="px-4 py-1.5 bg-[#072113] rounded text-[#e0a816] font-outfit font-extrabold text-sm shadow print-exact">
                  INVOICE NO. : {invoiceNumStr}
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600 font-medium print:space-y-1">
                <p className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-400">INVOICE DATE :</span> 
                  <strong className="text-slate-800">{formattedDate}</strong>
                </p>
                <p className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-400">BOOKING DATE :</span> 
                  <strong className="text-slate-800">{formattedDate}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="px-6 py-4 print:py-2.5 print:px-6 space-y-3 print:space-y-1.5">
            <div className="inline-block bg-[#072113] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-1.5 rounded skew-x-[-10deg] border-l-2 border-[#e0a816] print-exact">
              Customer Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-2xl p-4 print:p-3 bg-[#fcfbfa]">
              <div className="space-y-2 text-xs text-slate-700 print:space-y-1">
                <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-gray-400" /> <span><strong>NAME:</strong> {booking.customerName}</span></p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> <span><strong>EMAIL ID:</strong> {booking.customerEmail}</span></p>
              </div>
              <div className="space-y-2 text-xs text-slate-700 md:border-l border-gray-200 md:pl-4 print:space-y-1">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> <span><strong>MOBILE NO:</strong> {booking.customerPhone}</span></p>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="px-6 py-4 print:py-2.5 print:px-6 space-y-3 print:space-y-1.5">
            <div className="inline-block bg-[#072113] text-white text-[10px] font-bold tracking-wider uppercase px-4 py-1.5 rounded skew-x-[-10deg] border-l-2 border-[#e0a816] print-exact">
              Travel Details
            </div>
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <tbody className="divide-y divide-gray-150 text-slate-700">
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 print:p-2 font-bold w-1/3 flex items-center gap-2 text-gray-500"><Calendar className="w-3.5 h-3.5" /> TRAVEL DATE</td>
                    <td className="p-3 print:p-2 w-6 text-center">:</td>
                    <td className="p-3 print:p-2 font-medium text-slate-800">{booking.travelDate}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 print:p-2 font-bold flex items-center gap-2 text-gray-500"><User className="w-3.5 h-3.5" /> TRAVEL TYPE</td>
                    <td className="p-3 print:p-2 text-center">:</td>
                    <td className="p-3 print:p-2 font-medium text-slate-800">
                      {booking.totalTravelers === 1 ? "Solo Travel (1 Pax)" : `Group Travel (${booking.totalTravelers} Pax)`}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 print:p-2 font-bold flex items-center gap-2 text-gray-500"><BedSingle className="w-3.5 h-3.5" /> ROOM SHARING</td>
                    <td className="p-3 print:p-2 text-center">:</td>
                    <td className="p-3 print:p-2 font-medium text-slate-800 capitalize">
                      {booking.sharingSelected?.replace("Sharing", " Sharing")}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 print:p-2 font-bold flex items-center gap-2 text-gray-500"><MapPin className="w-3.5 h-3.5" /> ROUTE</td>
                    <td className="p-3 print:p-2 text-center">:</td>
                    <td className="p-3 print:p-2 font-medium text-slate-800">{booking.package?.title}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 print:p-2 font-bold flex items-center gap-2 text-gray-500"><CreditCard className="w-3.5 h-3.5" /> TOTAL PACKAGE RATE</td>
                    <td className="p-3 print:p-2 text-center">:</td>
                    <td className="p-3 print:p-2 font-extrabold text-slate-950 text-sm">₹ {booking.totalCost?.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 print:p-2 font-bold flex items-center gap-2 text-gray-500"><Check className="w-3.5 h-3.5 text-green-600" /> PAID ADVANCE</td>
                    <td className="p-3 print:p-2 text-center">:</td>
                    <td className="p-3 print:p-2 font-extrabold text-green-600 text-sm">₹ {booking.amountPaid?.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 print:p-2 font-bold flex items-center gap-2 text-gray-500"><FileText className="w-3.5 h-3.5 text-red-500" /> LEFT AMOUNT</td>
                    <td className="p-3 print:p-2 text-center">:</td>
                    <td className="p-3 print:p-2 font-extrabold text-red-600 text-sm">₹ {remainingBalance?.toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing calculations Block */}
          <div className="mx-6 my-4 print:my-2 bg-[#072113] text-white rounded-2xl p-5 print:py-3 print:px-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-l-4 border-[#e0a816] print-exact">
            <div>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-wider block">TOTAL PAID (ADVANCE)</span>
              <span className="text-3xl font-outfit font-extrabold text-[#e0a816]">₹ {booking.amountPaid?.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center gap-3 sm:border-l border-white/10 sm:pl-6 w-full sm:w-auto">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                <FileText className="w-5 h-5 text-[#e0a816]" />
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">AMOUNT (IN WORDS)</span>
                <span className="text-xs font-semibold text-white">{numberToWords(booking.amountPaid)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms and Signatures */}
          <div className="p-6 print:py-3 print:px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center border-t border-gray-100">
            {/* Payment Status Check */}
            <div className="space-y-1">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">PAYMENT STATUS</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-extrabold tracking-widest rounded-full uppercase print-exact">
                ✓ PAID
              </span>
            </div>

            {/* Booking Terms details */}
            <div className="text-[10px] text-slate-500 leading-normal font-medium">
              <strong className="text-slate-800 block text-[11px] mb-0.5">PAYMENT TERMS:</strong>
              50% Advance & 50% Remaining at the Time of Boarding.
            </div>

            {/* Signature Thank you block */}
            <div className="text-center sm:text-right font-outfit text-xs text-slate-500 sm:border-l border-gray-150 pt-4 sm:pt-0 sm:pl-6 space-y-1">
              <p className="italic font-bold text-slate-800 text-sm">Thank You!</p>
              <p className="text-[10px]">For Choosing <span className="font-extrabold text-[#072113]">SIT <span className="text-[#e0a816]">XPLORE</span></span></p>
            </div>
          </div>

          {/* Footer banner strip */}
          <div className="bg-[#072113] text-white p-4 print:py-2.5 print:px-6 rounded-b-3xl flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] font-outfit font-semibold tracking-wider uppercase border-t-2 border-[#e0a816]/20 print-exact">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#e0a816]" />
              <span><strong>24x7 TRAVEL SUPPORT</strong> | TRUSTED • SAFE • MEMORABLE</span>
            </div>
            <div className="flex items-center gap-3 text-[9px]">
              <span>FOLLOW US:</span>
              <a href="https://www.instagram.com/sit_xplore/" target="_blank" rel="noopener noreferrer" className="text-[#e0a816] hover:underline">Instagram</a>
              <span>•</span>
              <span className="text-gray-400">Facebook</span>
              <span>•</span>
              <span className="text-gray-400">YouTube</span>
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
