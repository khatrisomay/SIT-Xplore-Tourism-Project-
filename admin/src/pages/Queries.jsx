import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { Search, Eye, Trash2, CheckCircle, Clock, X, MessageSquare } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Queries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState(null);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/contacts");
      if (res.data?.success) {
        setQueries(res.data.queries || []);
      }
    } catch (err) {
      console.error("Error retrieving queries:", err);
      toast.error("Failed to retrieve customer queries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleToggleResolve = async (id) => {
    try {
      const res = await axios.put(`/api/contacts/${id}`);
      if (res.data?.success) {
        const updated = res.data.query;
        toast.success(res.data.message || "Query status updated successfully");
        setQueries(prev => prev.map(q => q._id === id ? { ...q, status: updated.status } : q));
        if (selectedQuery && selectedQuery._id === id) {
          setSelectedQuery(prev => ({ ...prev, status: updated.status }));
        }
      }
    } catch (err) {
      console.error("Resolve query error:", err);
      toast.error("Failed to update query status.");
    }
  };

  const handleDeleteQuery = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer query?")) return;

    try {
      const res = await axios.delete(`/api/contacts/${id}`);
      if (res.data?.success) {
        toast.success("Query deleted successfully");
        setQueries(prev => prev.filter(q => q._id !== id));
        if (selectedQuery && selectedQuery._id === id) {
          setSelectedQuery(null);
        }
      }
    } catch (err) {
      console.error("Delete query error:", err);
      toast.error("Failed to delete query.");
    }
  };

  const filteredQueries = queries.filter((q) => {
    const term = searchQuery.toLowerCase();
    return (
      q.name.toLowerCase().includes(term) ||
      q.email.toLowerCase().includes(term) ||
      q.phone.toLowerCase().includes(term) ||
      q.message.toLowerCase().includes(term) ||
      q.status.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-8 animate-slide-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 self-start sm:self-auto">
            <h1 className="text-3xl font-outfit font-extrabold text-white">Customer Queries</h1>
            <p className="text-sm text-gray-400">View and respond to client inquiries and message specifications.</p>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-3 py-2 rounded-xl w-full sm:w-72 focus-within:border-brand-500 transition-colors self-start sm:self-auto">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-white placeholder-gray-600 w-full"
            />
          </div>
        </div>

        {/* List Table */}
        <div className="rounded-2xl bg-[#111318] border border-white/5 p-6 shadow-xl space-y-4">
          
          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            </div>
          ) : filteredQueries.length === 0 ? (
            <p className="text-center py-10 text-gray-500 text-sm">No customer queries logs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Submitted Date</th>
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Contact info</th>
                    <th className="pb-3">Message snippet</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {filteredQueries.map((q) => {
                    const dateStr = new Date(q.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    const snippet = q.message.length > 40 ? `${q.message.slice(0, 40)}...` : q.message;
                    const isResolved = q.status === "resolved";

                    return (
                      <tr key={q._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-gray-450 font-outfit">{dateStr}</td>
                        <td className="py-3.5 font-bold text-white">{q.name}</td>
                        <td className="py-3.5 space-y-0.5">
                          <p>{q.email}</p>
                          <p className="text-gray-400">{q.phone}</p>
                        </td>
                        <td className="py-3.5 max-w-[200px] truncate text-gray-300">{snippet}</td>
                        <td className="py-3.5">
                          <button
                            onClick={() => handleToggleResolve(q._id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider transition-colors ${
                              isResolved
                                ? "bg-green-950/40 text-green-400 border border-green-500/20 hover:bg-green-950/70"
                                : "bg-amber-950/40 text-amber-400 border border-amber-500/20 hover:bg-amber-950/70"
                            }`}
                            title="Click to toggle status"
                          >
                            {isResolved ? <CheckCircle className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                            <span>{q.status}</span>
                          </button>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setSelectedQuery(q)}
                              className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuery(q._id)}
                              className="p-2 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300"
                              title="Delete Query"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Selected Query Details Modal Drawer */}
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-[#111318] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 relative animate-slide-in shadow-2xl">
              
              <button
                onClick={() => setSelectedQuery(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1.5 border-b border-white/5 pb-3">
                <span className="text-[10px] text-brand-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Query Log Ticket
                </span>
                <h3 className="font-outfit font-extrabold text-2xl text-white">{selectedQuery.name}</h3>
              </div>

              {/* Data specifications */}
              <div className="space-y-4 text-xs text-gray-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-gray-500 font-bold block uppercase tracking-wide">Email</span>
                    <strong className="text-white text-sm">{selectedQuery.email}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-500 font-bold block uppercase tracking-wide">Phone</span>
                    <strong className="text-white text-sm">{selectedQuery.phone}</strong>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-gray-500 font-bold block uppercase tracking-wide">Date Submitted</span>
                  <p className="text-white">{new Date(selectedQuery.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-gray-500 font-bold block uppercase tracking-wide">Status Ticket</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider mt-1 ${
                    selectedQuery.status === "resolved"
                      ? "bg-green-950/40 text-green-400 border border-green-500/20"
                      : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                  }`}>
                    {selectedQuery.status}
                  </span>
                </div>

                <div className="space-y-1 border-t border-white/5 pt-4">
                  <span className="text-gray-500 font-bold block uppercase tracking-wide">Customer Query Message</span>
                  <div className="bg-[#111318]/50 border border-white/5 rounded-2xl p-4 text-gray-250 leading-relaxed text-sm whitespace-pre-line">
                    {selectedQuery.message}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => handleToggleResolve(selectedQuery._id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-colors ${
                    selectedQuery.status === "resolved"
                      ? "bg-amber-600 hover:bg-amber-550 text-white"
                      : "bg-green-600 hover:bg-green-550 text-white"
                  }`}
                >
                  Mark as {selectedQuery.status === "resolved" ? "Pending" : "Resolved"}
                </button>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white focus:outline-none"
                >
                  Close Detail
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
