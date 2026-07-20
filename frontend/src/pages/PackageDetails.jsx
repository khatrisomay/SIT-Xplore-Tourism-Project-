import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Clock, Calendar, Check, X, ShieldAlert, ArrowRight, UserPlus, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("itinerary"); // itinerary | inclusions
  const [expandedDay, setExpandedDay] = useState(1);

  // Form Booking states
  const [selectedSlot, setSelectedSlot] = useState("");
  const [sharing, setSharing] = useState("quadSharing");
  const [travelersCount, setTravelersCount] = useState(1);
  const [travelersList, setTravelersList] = useState([""]); // array of additional traveler names

  // Primary customer contact info (prefilled if user is logged in)
  const [custName, setCustName] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custPhone, setCustPhone] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/packages/${id}`);
        if (res.data?.success) {
          setPkg(res.data.package);
          if (res.data.package.slots?.length > 0) {
            setSelectedSlot(res.data.package.slots[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching package details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  useEffect(() => {
    if (user) {
      setCustName(user.name);
      setCustEmail(user.email);
      setCustPhone(user.phone || "");
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4">
          <ShieldAlert className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-outfit font-bold text-slate-900 dark:text-white">Package Not Found</h2>
          <button onClick={() => navigate("/")} className="text-brand-500 hover:underline">Return to Home</button>
        </div>
        <Footer />
      </div>
    );
  }

  // Cost calculations
  const pricePerPerson = pkg.sharingPrices?.[sharing] || 0;
  const baseCost = pricePerPerson * travelersCount;
  const gstAmount = Math.round(baseCost * 0.05);
  const totalCost = Math.max(0, baseCost + gstAmount - couponDiscount);
  const depositRequired = (pkg.bookingDeposit || 3000) * travelersCount;

  const handleTravelersCountChange = (val) => {
    const count = Math.max(1, Number(val) || 1);
    setTravelersCount(count);
    
    // adjust additional names list length
    setTravelersList((prev) => {
      const newList = [...prev];
      if (count > newList.length) {
        // add fields
        while (newList.length < count) {
          newList.push("");
        }
      } else if (count < newList.length) {
        // remove fields
        newList.length = count;
      }
      return newList;
    });
  };

  const handleTravelerNameChange = (idx, val) => {
    setTravelersList((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError("");
    const code = couponCode.toUpperCase().trim();
    const coupons = {
      "SX9K7P4M2Q": 500,
      "TR8N5XQ2L7": 500,
      "XP4V9M7K3R": 500,
      "SK2Z8Q7M5X": 1000,
      "TR9L4X8Q6N": 1000,
      "XP7M2K9R4V": 1000
    };
    if (!code) {
      setCouponError("Please enter a coupon code.");
      return;
    }
    if (coupons[code]) {
      setCouponDiscount(coupons[code]);
      setAppliedCoupon(code);
      setCouponError("");
    } else {
      setCouponError("Invalid coupon code.");
      setCouponDiscount(0);
      setAppliedCoupon("");
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedSlot) {
      setBookingError("Please select a travel departure date.");
      return;
    }

    setBookingLoading(true);

    try {
      const res = await axios.post("/api/bookings", {
        packageId: pkg._id,
        customerName: custName,
        customerEmail: custEmail,
        customerPhone: custPhone,
        travelDate: selectedSlot,
        sharingSelected: sharing,
        totalTravelers: travelersCount,
        travelersList: JSON.stringify(travelersList.filter(name => name.trim() !== "")),
        couponCode: appliedCoupon,
      });

      if (res.data?.success) {
        const booking = res.data.booking;
        navigate(`/verify-payment?bookingId=${booking.bookingId}`);
      } else {
        setBookingError(res.data?.message || "Booking creation failed.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError(err.response?.data?.message || "Failed to initiate booking. Try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col transition-colors duration-300">
      <Navbar />

      {/* Hero Header with cover photo */}
      <header className="relative h-[45vh] md:h-[60vh] w-full border-b border-gray-200 dark:border-white/5">
        <img src={pkg.bannerImage} alt={pkg.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#ecebe6] via-transparent to-black/35 dark:from-[#0b0c10]" />
        <div className="absolute bottom-8 left-6 md:left-12 max-w-4xl space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-brand-500 text-black text-xs font-outfit font-extrabold uppercase shadow-lg">
            {pkg.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-outfit font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {pkg.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-slate-700 dark:text-gray-300">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-500" /> {pkg.duration} Tour</span>
            {pkg.slots?.length > 0 && (
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-500" /> Next Batch: {pkg.slots[0]}</span>
            )}
          </div>
        </div>
      </header>

      {/* Main details body */}
      <main className="max-w-7xl mx-auto w-full px-6 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12 flex-grow">
        
        {/* Left 2 Columns: Description, Itinerary, Inclusions */}
        <section className="lg:col-span-2 space-y-10">
          
          {/* Overview */}
          <div className="space-y-4">
            <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white">Overview</h2>
            <p className="text-slate-750 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {pkg.description || "Join us for an unforgettable travel journey. Perfect trails, premium stays, and expert guidelines provided."}
            </p>
          </div>

          {/* Dynamic Tabs Navigation */}
          <div className="border-b border-gray-250 dark:border-white/5 flex gap-6 text-sm font-outfit font-semibold tracking-wider uppercase">
            <button
              onClick={() => setActiveTab("itinerary")}
              className={`pb-3 border-b-2 transition-colors ${activeTab === "itinerary" ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Day-by-Day Itinerary
            </button>
            <button
              onClick={() => setActiveTab("inclusions")}
              className={`pb-3 border-b-2 transition-colors ${activeTab === "inclusions" ? "border-brand-500 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
            >
              Inclusions & Exclusions
            </button>
          </div>

          {/* Tab 1: Itinerary Accordion */}
          {activeTab === "itinerary" && (
            <div className="space-y-4">
              {pkg.itinerary?.length > 0 ? (
                pkg.itinerary.map((dayObj) => {
                  const isExpanded = expandedDay === dayObj.day;
                  return (
                    <article
                      key={dayObj._id || dayObj.day}
                      className="border border-[#d1cfc7] dark:border-white/5 rounded-2xl overflow-hidden bg-[#f4f3ef] dark:bg-[#111318]/50 transition-colors shadow-sm"
                    >
                      <button
                        onClick={() => setExpandedDay(isExpanded ? 0 : dayObj.day)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#ecebe6]/40 dark:hover:bg-white/5 transition-colors focus:outline-none"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 shrink-0 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-outfit font-bold flex items-center justify-center">
                            D0{dayObj.day}
                          </span>
                          <span className="font-outfit font-bold text-slate-900 dark:text-white text-base md:text-lg">{dayObj.title}</span>
                        </div>
                        <span className="text-xl font-bold text-brand-500">{isExpanded ? "−" : "+"}</span>
                      </button>
                      
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 text-sm text-slate-605 dark:text-gray-400 border-t border-[#d1cfc7] dark:border-white/5 leading-relaxed bg-[#f4f3ef]/60 dark:bg-[#111318]/30">
                          {dayObj.description}
                        </div>
                      )}
                    </article>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">Itinerary details are being updated.</p>
              )}
            </div>
          )}

          {/* Tab 2: Inclusions & Exclusions */}
          {activeTab === "inclusions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {/* Inclusions */}
              <div className="space-y-4 p-6 rounded-2xl border border-[#d1cfc7] dark:border-white/5 bg-[#f4f3ef] dark:bg-[#111318]/30 shadow-sm">
                <h4 className="font-outfit font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                  <Check className="w-5 h-5" /> What's Included
                </h4>
                <ul className="space-y-2.5 text-slate-700 dark:text-gray-300">
                  {pkg.inclusions?.map((inc, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-xs">
                      <span className="text-green-500 shrink-0 mt-0.5">•</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="space-y-4 p-6 rounded-2xl border border-[#d1cfc7] dark:border-white/5 bg-[#f4f3ef] dark:bg-[#111318]/30 shadow-sm">
                <h4 className="font-outfit font-bold text-red-750 dark:text-red-400 flex items-center gap-2">
                  <X className="w-5 h-5" /> What's Excluded
                </h4>
                <ul className="space-y-2.5 text-slate-700 dark:text-gray-300">
                  {pkg.exclusions?.map((exc, idx) => (
                    <li key={idx} className="flex gap-2 items-start text-xs">
                      <span className="text-red-500 shrink-0 mt-0.5">•</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </section>

        {/* Right Column: Pricing Calculator & Traveler Form */}
        <section className="space-y-6">
          <div className="rounded-3xl bg-[#f4f3ef] dark:bg-[#111318] border border-[#d1cfc7] dark:border-white/5 p-6 shadow-xl space-y-6 relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-500/5 blur-2xl pointer-events-none" />

            <div className="border-b border-[#d1cfc7] dark:border-white/5 pb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">Trip Pricing Tiers</span>
              <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                <div className={`p-2.5 rounded-xl border cursor-pointer transition-all ${sharing === "doubleSharing" ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400" : "border-gray-250 dark:border-white/5 text-slate-500 dark:text-gray-400"}`} onClick={() => setSharing("doubleSharing")}>
                  <p className="font-bold">Double</p>
                  <p className="font-outfit font-bold text-slate-900 dark:text-white mt-1">₹{pkg.sharingPrices?.doubleSharing?.toLocaleString("en-IN")}</p>
                </div>
                <div className={`p-2.5 rounded-xl border cursor-pointer transition-all ${sharing === "tripleSharing" ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400" : "border-gray-250 dark:border-white/5 text-slate-500 dark:text-gray-400"}`} onClick={() => setSharing("tripleSharing")}>
                  <p className="font-bold">Triple</p>
                  <p className="font-outfit font-bold text-slate-900 dark:text-white mt-1">₹{pkg.sharingPrices?.tripleSharing?.toLocaleString("en-IN")}</p>
                </div>
                <div className={`p-2.5 rounded-xl border cursor-pointer transition-all ${sharing === "quadSharing" ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 text-brand-650 dark:text-brand-400" : "border-gray-250 dark:border-white/5 text-slate-500 dark:text-gray-400"}`} onClick={() => setSharing("quadSharing")}>
                  <p className="font-bold">Quad</p>
                  <p className="font-outfit font-bold text-slate-900 dark:text-white mt-1">₹{pkg.sharingPrices?.quadSharing?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Date Slots */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Select Departure Date</label>
                <select
                  required
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="" disabled className="bg-white dark:bg-dark-950 text-slate-800 dark:text-white">Select departure date...</option>
                  {pkg.slots?.map((slot, i) => (
                    <option key={i} value={slot} className="bg-white dark:bg-dark-950 text-slate-800 dark:text-white">{slot}</option>
                  ))}
                </select>
              </div>

              {/* Travelers Count */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center justify-between">
                  <span>Number of Travelers</span>
                  <span className="text-brand-650 dark:text-brand-400 text-xs font-outfit">₹{pricePerPerson.toLocaleString("en-IN")} / head</span>
                </label>
                <div className="flex items-center bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-1.5 focus-within:border-brand-500">
                  <Users className="w-4 h-4 text-gray-450 dark:text-gray-500 mr-3 shrink-0" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={travelersCount}
                    onChange={(e) => handleTravelersCountChange(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white w-full py-1 focus:ring-0"
                  />
                </div>
              </div>

              {/* Dynamic Additional Names */}
              {travelersCount > 1 && (
                <div className="space-y-2 pt-2 border-t border-[#d1cfc7] dark:border-white/5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-brand-500" /> Co-Travelers Names
                  </label>
                  {travelersList.map((name, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Traveler ${i + 1} Full Name`}
                      value={name}
                      onChange={(e) => handleTravelerNameChange(i, e.target.value)}
                      className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  ))}
                </div>
              )}

              {/* Customer Contact Details */}
              <div className="space-y-2.5 pt-2 border-t border-[#d1cfc7] dark:border-white/5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block">Primary Contact Info</label>
                <input
                  type="text"
                  required
                  placeholder="Primary Traveler Name"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                />
                <input
                  type="email"
                  required
                  placeholder="Primary Email Address"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Primary Contact Phone"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Coupon Code Input */}
              <div className="space-y-1.5 pt-2 border-t border-[#d1cfc7] dark:border-white/5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider block">Have a Coupon Code?</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-grow bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white uppercase focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-4 bg-brand-500 hover:bg-brand-400 text-black text-xs font-outfit font-bold rounded-xl transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-red-500 font-semibold">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[10px] text-green-600 font-bold">✓ Coupon {appliedCoupon} applied successfully!</p>
                )}
              </div>

              {/* Booking Cost Output */}
              <div className="bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Base Package Cost:</span>
                  <span className="font-outfit font-bold text-slate-850 dark:text-white">₹{baseCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>GST (5%):</span>
                  <span className="font-outfit font-bold text-slate-850 dark:text-white">₹{gstAmount.toLocaleString("en-IN")}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-green-600 font-bold">
                    <span>Coupon Discount ({appliedCoupon}):</span>
                    <span>- ₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-semibold text-slate-800 dark:text-white border-t border-[#d1cfc7] dark:border-white/5 pt-2">
                  <span>Total Package Cost (incl. GST):</span>
                  <span className="font-outfit font-bold">₹{totalCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-brand-650 dark:text-brand-400 border-t border-[#d1cfc7] dark:border-white/5 pt-2">
                  <span>Booking Deposit (due now):</span>
                  <span className="font-outfit font-bold">₹{depositRequired.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[10px] text-gray-550 dark:text-gray-500 text-center leading-normal pt-1.5 border-t border-[#d1cfc7] dark:border-white/5">
                  Confirm your slot by paying ₹{(pkg.bookingDeposit || 3000).toLocaleString("en-IN")} per head today. Rest is paid 7 days before travel.
                </p>
              </div>

              {bookingError && (
                <p className="text-xs text-red-500 dark:text-red-400 text-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 p-2 rounded-xl">{bookingError}</p>
              )}

              {/* Booking CTA button */}
              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-4 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-500/50 text-black text-sm font-outfit font-extrabold rounded-2xl shadow-xl shadow-brand-500/10 hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{user ? (bookingLoading ? "Confirming..." : "Pay Booking Deposit") : "Login to Book Trip"}</span>
                {!bookingLoading && <ArrowRight className="w-4 h-4 text-black" />}
              </button>

            </form>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
