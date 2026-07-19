import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import { Plus, Trash2, Edit2, X, PlusCircle, CheckCircle, Info } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Destinations() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form toggle state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // if editing, holds package ID

  // Form inputs state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Domestic Trips");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [doubleSharing, setDoubleSharing] = useState(0);
  const [tripleSharing, setTripleSharing] = useState(0);
  const [quadSharing, setQuadSharing] = useState(0);
  const [bookingDeposit, setBookingDeposit] = useState(3000);
  const [inclusionsInput, setInclusionsInput] = useState("");
  const [exclusionsInput, setExclusionsInput] = useState("");
  const [slotsInput, setSlotsInput] = useState("");

  // File Upload states
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]); // kept gallery URLs when editing

  // Itinerary Builder state (array of objects: { day: Number, title: String, description: String })
  const [itinerary, setItinerary] = useState([{ day: 1, title: "", description: "" }]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/packages");
      if (res.data?.success) {
        setPackages(res.data.packages || []);
      }
    } catch (err) {
      console.error("Error retrieving packages:", err);
      toast.error("Failed to load tour packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const resetForm = () => {
    setTitle("");
    setCategory("Domestic Trips");
    setDuration("");
    setDescription("");
    setDoubleSharing(0);
    setTripleSharing(0);
    setQuadSharing(0);
    setBookingDeposit(3000);
    setInclusionsInput("");
    setExclusionsInput("");
    setSlotsInput("");
    setBannerFile(null);
    setBannerPreview("");
    setGalleryFiles([]);
    setExistingGallery([]);
    setItinerary([{ day: 1, title: "", description: "" }]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddItineraryDay = () => {
    setItinerary((prev) => [
      ...prev,
      { day: prev.length + 1, title: "", description: "" },
    ]);
  };

  const handleRemoveItineraryDay = (idx) => {
    setItinerary((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // Recalculate day numbers sequentially
      return next.map((item, i) => ({ ...item, day: i + 1 }));
    });
  };

  const handleItineraryChange = (idx, field, value) => {
    setItinerary((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  // Uploader helper to read files for local previews
  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    if (e.target.files) {
      setGalleryFiles(Array.from(e.target.files));
    }
  };

  // Triggers when edit button is clicked on package
  const handleEditClick = (pkg) => {
    setEditingId(pkg._id);
    setTitle(pkg.title);
    setCategory(pkg.category);
    setDuration(pkg.duration);
    setDescription(pkg.description || "");
    setDoubleSharing(pkg.sharingPrices?.doubleSharing || 0);
    setTripleSharing(pkg.sharingPrices?.tripleSharing || 0);
    setQuadSharing(pkg.sharingPrices?.quadSharing || 0);
    setBookingDeposit(pkg.bookingDeposit || 3000);
    setInclusionsInput(pkg.inclusions?.join("\n") || "");
    setExclusionsInput(pkg.exclusions?.join("\n") || "");
    setSlotsInput(pkg.slots?.join(", ") || "");
    setBannerPreview(pkg.bannerImage);
    setExistingGallery(pkg.galleryImages || []);
    setItinerary(pkg.itinerary?.length > 0 ? pkg.itinerary : [{ day: 1, title: "", description: "" }]);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this package?")) return;

    try {
      const res = await axios.delete(`/api/packages/${id}`);
      if (res.data?.success) {
        toast.success("Package deleted successfully");
        setPackages(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      console.error("Delete package error:", err);
      toast.error("Failed to delete package.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!title || !duration || !description) {
      toast.error("Please fill in basic package text details.");
      return;
    }
    if (!editingId && !bannerFile) {
      toast.error("Please upload a banner cover photo.");
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("category", category);
    form.append("duration", duration);
    form.append("description", description);
    form.append(
      "sharingPrices",
      JSON.stringify({
        doubleSharing: Number(doubleSharing) || 0,
        tripleSharing: Number(tripleSharing) || 0,
        quadSharing: Number(quadSharing) || 0,
      })
    );
    form.append("bookingDeposit", String(bookingDeposit));
    form.append(
      "inclusions",
      JSON.stringify(inclusionsInput.split("\n").map(str => str.trim()).filter(Boolean))
    );
    form.append(
      "exclusions",
      JSON.stringify(exclusionsInput.split("\n").map(str => str.trim()).filter(Boolean))
    );
    form.append(
      "slots",
      JSON.stringify(slotsInput.split(",").map(str => str.trim()).filter(Boolean))
    );
    form.append("itinerary", JSON.stringify(itinerary));

    if (bannerFile) {
      form.append("bannerImage", bannerFile);
    }
    
    galleryFiles.forEach((file) => {
      form.append("galleryImages", file);
    });

    if (editingId) {
      form.append("existingGalleryImages", JSON.stringify(existingGallery));
    }

    try {
      let res;
      if (editingId) {
        // Edit update call
        res = await axios.put(`/api/packages/${editingId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Add create call
        res = await axios.post("/api/packages", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data?.success) {
        toast.success(editingId ? "Package updated successfully!" : "Package added successfully!");
        resetForm();
        fetchPackages();
      }
    } catch (err) {
      console.error("Form submit error:", err);
      toast.error(err.response?.data?.message || "Failed to save package listing.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-slide-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 self-start sm:self-auto">
            <h1 className="text-3xl font-outfit font-extrabold text-white">Manage Destinations</h1>
            <p className="text-sm text-gray-400">View and update SIT Xplore travel catalog options.</p>
          </div>

          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-outfit font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showForm ? "Cancel Form" : "Add Tour Package"}</span>
          </button>
        </div>

        {/* Dynamic Uploader Add / Edit Form Panel */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-[#111318] border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="font-outfit font-bold text-lg text-white border-b border-white/5 pb-3">
              {editingId ? "Edit Tour Destination Specifications" : "Create New Tour Destination"}
            </h3>

            {/* Core details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Package Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chandratal – Manali Expedition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Domestic Trips" className="bg-dark-950">Domestic Trips</option>
                  <option value="International Trips" className="bg-dark-950">International Trips</option>
                  <option value="Weekend Getaways" className="bg-dark-950">Weekend Getaways</option>
                  <option value="Hotel Booking" className="bg-dark-950">Hotel Booking</option>
                  <option value="Vehicle Rental" className="bg-dark-950">Vehicle Rental</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration (Nights/Days)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4N/5D"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description Overview</label>
              <textarea
                rows={4}
                required
                placeholder="Write detailed trip overview and highlights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>

            {/* Pricing details */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Double Sharing (₹)</label>
                <input
                  type="number"
                  required
                  value={doubleSharing}
                  onChange={(e) => setDoubleSharing(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Triple Sharing (₹)</label>
                <input
                  type="number"
                  required
                  value={tripleSharing}
                  onChange={(e) => setTripleSharing(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quad Sharing (₹)</label>
                <input
                  type="number"
                  required
                  value={quadSharing}
                  onChange={(e) => setQuadSharing(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking Deposit (₹)</label>
                <input
                  type="number"
                  required
                  value={bookingDeposit}
                  onChange={(e) => setBookingDeposit(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

            </div>

            {/* List and slots settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Inclusions (One per line)</label>
                <textarea
                  rows={4}
                  placeholder="e.g. AC Sleeper Transport&#10;Hotel Stay&#10;Breakfast & Dinner"
                  value={inclusionsInput}
                  onChange={(e) => setInclusionsInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Exclusions (One per line)</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Lunches on all days&#10;Personal tips"
                  value={exclusionsInput}
                  onChange={(e) => setExclusionsInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Departure Slots (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-08-15, 2026-08-28"
                    value={slotsInput}
                    onChange={(e) => setSlotsInput(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Upload Banner and cover image */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cover Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Gallery (Max 10)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-semibold"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Itinerary Day-by-Day Builder */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="font-outfit font-bold text-xs uppercase tracking-wider text-brand-400">Day-by-Day Itinerary Builder</h4>
                <button
                  type="button"
                  onClick={handleAddItineraryDay}
                  className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1 focus:outline-none"
                >
                  <PlusCircle className="w-4 h-4" /> Add Day
                </button>
              </div>

              <div className="space-y-3.5">
                {itinerary.map((dayItem, idx) => (
                  <div key={idx} className="flex gap-4 items-start bg-white/5 border border-white/5 p-4 rounded-2xl relative">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center text-sm">
                      D0{dayItem.day}
                    </div>

                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Day Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Arrival in Manali"
                          value={dayItem.title}
                          onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[9px] font-bold uppercase text-gray-500 tracking-wider">Activities Description</label>
                        <input
                          type="text"
                          required
                          placeholder="Activities, visits, and details..."
                          value={dayItem.description}
                          onChange={(e) => handleItineraryChange(idx, "description", e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItineraryDay(idx)}
                        className="text-gray-500 hover:text-red-400 p-2 shrink-0 self-center focus:outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Save trigger */}
            <div className="flex gap-4 items-center justify-end border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5"
              >
                Reset Fields
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-xs font-outfit font-bold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all"
              >
                {editingId ? "Update Destination Package" : "Publish Destination Package"}
              </button>
            </div>

          </form>
        )}

        {/* Destination package list table */}
        <div className="rounded-2xl bg-[#111318] border border-white/5 p-6 shadow-xl space-y-4">
          <h4 className="font-outfit font-bold text-sm uppercase tracking-widest text-brand-400">Listed Packages</h4>

          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-500/20 border-t-brand-500 animate-spin" />
            </div>
          ) : packages.length === 0 ? (
            <p className="text-center py-10 text-gray-500 text-sm">No packages currently listed. Use form above to add.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Photo</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Title</th>
                    <th className="pb-3">Sharing Rates (D/T/Q)</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {packages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3">
                        <img
                          src={pkg.bannerImage}
                          alt={pkg.title}
                          className="w-14 h-10 object-cover rounded-lg border border-white/5 bg-white/5"
                        />
                      </td>
                      <td className="py-3 font-semibold text-brand-400 uppercase text-[10px] tracking-wide">
                        {pkg.category.split(" ")[0]}
                      </td>
                      <td className="py-3 max-w-[200px] truncate font-semibold text-white">{pkg.title}</td>
                      <td className="py-3 font-bold">
                        ₹{pkg.sharingPrices?.doubleSharing?.toLocaleString("en-IN")} / 
                        ₹{pkg.sharingPrices?.tripleSharing?.toLocaleString("en-IN")} / 
                        ₹{pkg.sharingPrices?.quadSharing?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(pkg)}
                            className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(pkg._id)}
                            className="p-2 rounded bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300"
                            title="Delete"
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

      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
      />
    </AdminLayout>
  );
}
