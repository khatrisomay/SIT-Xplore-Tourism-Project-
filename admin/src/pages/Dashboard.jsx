import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { BookOpen, IndianRupee, MapPin, Sparkles, TrendingUp, UserCheck } from "lucide-react";

export default function Dashboard() {
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const pkgRes = await axios.get("/api/packages");
      const bookRes = await axios.get("/api/bookings");
      
      if (pkgRes.data?.success) setPackages(pkgRes.data.packages || []);
      if (bookRes.data?.success) setBookings(bookRes.data.bookings || []);
    } catch (err) {
      console.error("Dashboard data retrieve error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculations
  const totalBookings = bookings.length;
  const paidBookings = bookings.filter(b => b.paymentStatus === "paid");
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalDestinations = packages.length;

  // Group packages counts by category for bar charts
  const categoryCounts = packages.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const domesticCount = categoryCounts["Domestic Trips"] || 0;
  const intlCount = categoryCounts["International Trips"] || 0;
  const weekendCount = categoryCounts["Weekend Getaways"] || 0;
  const maxCount = Math.max(domesticCount, intlCount, weekendCount, 1);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-slide-in">
        
        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-outfit font-extrabold text-white">Dashboard Analytics</h1>
          <p className="text-sm text-gray-400">Overview of SIT Xplore customer bookings, revenue collections, and listings.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Revenue */}
              <div className="rounded-2xl bg-[#111318] border border-white/5 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-green-500/5 blur-xl" />
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Revenue (Deposits)</span>
                  <h3 className="text-3xl font-outfit font-extrabold text-white">₹{totalRevenue.toLocaleString("en-IN")}</h3>
                  <p className="text-[10px] text-green-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> from {paidBookings.length} paid bookings</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>

              {/* Bookings */}
              <div className="rounded-2xl bg-[#111318] border border-white/5 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-brand-500/5 blur-xl" />
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Booking Count</span>
                  <h3 className="text-3xl font-outfit font-extrabold text-white">{totalBookings} Logs</h3>
                  <p className="text-[10px] text-gray-400">{totalBookings - paidBookings.length} bookings pending payment</p>
                </div>
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-500">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              {/* Packages */}
              <div className="rounded-2xl bg-[#111318] border border-white/5 p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-blue-500/5 blur-xl" />
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Listed Tours</span>
                  <h3 className="text-3xl font-outfit font-extrabold text-white">{totalDestinations} Destinations</h3>
                  <p className="text-[10px] text-gray-400">Active catalog routes</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Split row: Charts + Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Category chart (1 col) */}
              <div className="rounded-2xl bg-[#111318] border border-white/5 p-6 space-y-6">
                <h4 className="font-outfit font-bold text-sm uppercase tracking-widest text-brand-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Tour Allocations
                </h4>
                
                {/* CSS Bar Chart */}
                <div className="space-y-4">
                  
                  {/* Domestic */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>Domestic Trips</span>
                      <span className="font-bold">{domesticCount}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(domesticCount / maxCount) * 100}%` }} />
                    </div>
                  </div>

                  {/* International */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>International Trips</span>
                      <span className="font-bold">{intlCount}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(intlCount / maxCount) * 100}%` }} />
                    </div>
                  </div>

                  {/* Weekend Getaways */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>Weekend Getaways</span>
                      <span className="font-bold">{weekendCount}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(weekendCount / maxCount) * 100}%` }} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Recent bookings lists (2 cols) */}
              <div className="lg:col-span-2 rounded-2xl bg-[#111318] border border-white/5 p-6 space-y-4">
                <h4 className="font-outfit font-bold text-sm uppercase tracking-widest text-brand-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> Recent Travelers Activity
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                        <th className="pb-3">Traveler</th>
                        <th className="pb-3">Destination</th>
                        <th className="pb-3">Travel Date</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-semibold text-white">{b.customerName}</td>
                          <td className="py-3 max-w-[150px] truncate">{b.package?.title}</td>
                          <td className="py-3">{b.travelDate}</td>
                          <td className="py-3 font-bold text-white">₹{b.amountPaid?.toLocaleString("en-IN")}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                              b.paymentStatus === "paid"
                                ? "bg-green-950/40 text-green-400 border border-green-500/20"
                                : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                            }`}>
                              {b.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-gray-500">No booking transactions recorded yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </AdminLayout>
  );
}
