import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { Search, Calendar, Users, Eye, Trash2, ArrowRight, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal display states for selected booking details
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/bookings");
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error("Error retrieving bookings:", err);
      toast.error("Failed to retrieve bookings logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDeleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel and remove this booking from database?")) return;

    try {
      const res = await axios.delete(`/api/bookings/${id}`);
      if (res.data?.success) {
        toast.success("Booking record removed successfully");
        setBookings(prev => prev.filter(b => b._id !== id));
        if (selectedBooking && selectedBooking._id === id) {
          setSelectedBooking(null);
        }
      }
    } catch (err) {
      console.error("Delete booking error:", err);
      toast.error("Failed to remove booking.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.bookingId.toLowerCase().includes(q) ||
      b.customerName.toLowerCase().includes(q) ||
      b.customerEmail.toLowerCase().includes(q) ||
      (b.package && b.package.title.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-slide-in">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 self-start sm:self-auto">
            <h1 className="text-3xl font-outfit font-extrabold text-white">Bookings Log Sheet</h1>
            <p className="text-sm text-gray-400">Monitor paid deposits, traveler names, and transaction references.</p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3 py-2 rounded-xl w-full sm:w-72 focus-within:border-brand-500 transition-colors self-start sm:self-auto">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
            />
          </div>
        </div>

        {/* Table list */}
        <div className="rounded-2xl bg-[#111318] border border-white/5 p-6 shadow-xl space-y-4">
          
          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <p className="text-center py-10 text-gray-500 text-sm">No bookings logs match your query.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Booking ID</th>
                    <th className="pb-3">Traveler</th>
                    <th className="pb-3">Destination</th>
                    <th className="pb-3">Travel Date</th>
                    <th className="pb-3">Deposit Paid</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-semibold text-brand-400 font-outfit">{b.bookingId}</td>
                      <td className="py-3.5 font-bold text-white">{b.customerName}</td>
                      <td className="py-3.5 max-w-[150px] truncate">{b.package?.title}</td>
                      <td className="py-3.5">{b.travelDate}</td>
                      <td className="py-3.5 font-bold text-white">₹{b.amountPaid?.toLocaleString("en-IN")}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                          b.paymentStatus === "paid"
                            ? "bg-green-950/40 text-green-400 border border-green-500/20"
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        }`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(b._id)}
                            className="p-2 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300"
                            title="Cancel Booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Selected Booking Details Modal Drawer */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-[#111318] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 relative animate-slide-in shadow-2xl">
              
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 border-b border-white/5 pb-3">
                <span className="text-[10px] text-brand-400 uppercase tracking-widest font-bold">Booking Details</span>
                <h3 className="font-outfit font-extrabold text-2xl text-white">ID: {selectedBooking.bookingId}</h3>
              </div>

              {/* Data specifications */}
              <div className="grid grid-cols-2 gap-6 text-xs text-gray-300">
                
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-gray-500 font-bold block uppercase tracking-wide">Destination</span>
                    <strong className="text-white text-sm">{selectedBooking.package?.title}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-500 font-bold block uppercase tracking-wide">Departure Date</span>
                    <strong className="text-white text-sm">{selectedBooking.travelDate}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-500 font-bold block uppercase tracking-wide">Customer Info</span>
                    <p>{selectedBooking.customerName}</p>
                    <p className="text-gray-400">{selectedBooking.customerEmail}</p>
                    <p className="text-gray-400">{selectedBooking.customerPhone}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <span className="text-gray-500 font-bold block uppercase tracking-wide">Sharing Configuration</span>
                    <strong className="text-brand-400 capitalize">{selectedBooking.sharingSelected?.replace("Sharing", " Sharing")}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-500 font-bold block uppercase tracking-wide">Travelers Count</span>
                    <strong className="text-white">{selectedBooking.totalTravelers} Head(s)</strong>
                  </div>
                  {selectedBooking.travelersList?.length > 0 && (
                    <div className="space-y-0.5">
                      <span className="text-gray-500 font-bold block uppercase tracking-wide">Co-Travelers</span>
                      <p className="text-gray-400 leading-normal">{selectedBooking.travelersList.join(", ")}</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Transaction breakdown sheet */}
              <div className="border border-white/5 rounded-2xl p-4 bg-[#111318]/50 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Base + GST Total:</span>
                  <span className="font-bold text-white">₹{(selectedBooking.totalCost + (selectedBooking.discount || 0))?.toLocaleString("en-IN")}</span>
                </div>
                {selectedBooking.couponCode && (
                  <div className="flex justify-between">
                    <span className="text-brand-400 font-bold">Coupon Applied ({selectedBooking.couponCode}):</span>
                    <span className="font-bold text-brand-400">-₹{selectedBooking.discount?.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 font-bold">Final Booking Cost:</span>
                  <span className="font-bold text-white">₹{selectedBooking.totalCost?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-500 font-bold">Paid Deposit:</span>
                  <span className="font-bold text-green-400">₹{selectedBooking.amountPaid?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-semibold">
                  <span className="text-brand-400">Remaining Balance:</span>
                  <span className="font-outfit font-extrabold text-white">₹{Math.max(0, selectedBooking.totalCost - selectedBooking.amountPaid)?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 border-t border-white/5 pt-2">
                  <span>Transaction ID:</span>
                  <span>{selectedBooking.transactionId || "—"}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white focus:outline-none"
                >
                  Close Panel
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
      />
    </AdminLayout>
  );
}
