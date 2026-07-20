import React, { useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, Send, MessageSquare, Info, ShieldAlert } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      toast.error("Please fill in all the required query fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/contacts", { name, email, phone, message });
      if (res.data?.success) {
        toast.success(res.data.message || "Message submitted successfully!");
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        toast.error(res.data?.message || "Failed to submit message.");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-8 py-12 space-y-12">
        
        {/* Page Title & Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 text-[10px] font-outfit font-bold tracking-widest uppercase rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-650 dark:text-brand-400 inline-block">
            Connect With Our Expeditions Crew
          </span>
          <h1 className="text-4xl md:text-5xl font-outfit font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Have Questions? Let's Plan Your <br />
            <span className="bg-gradient-to-r from-brand-600 to-brand-450 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-500">
              Next Luxury Journey
            </span>
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Reach out to our guides directly for customized itineraries, private tour quotes, vehicle logistics, or booking assistance.
          </p>
        </div>

        {/* Two Column Section: Info cards & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Left Columns: Contact Details (2/5 size) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Contact Card */}
            <div className="rounded-3xl bg-[#f4f3ef] dark:bg-[#111318]/50 border border-[#d1cfc7] dark:border-white/5 p-6 shadow-xl space-y-6 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-500/5 blur-2xl pointer-events-none" />
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 dark:text-white">Contact Information</h3>
              
              <div className="space-y-4">
                {/* Phone */}
                <a 
                  href="tel:+919050553507" 
                  className="flex gap-4 items-start p-3 rounded-2xl hover:bg-[#ecebe6]/50 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-650 dark:text-brand-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Call Support</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-brand-650 dark:group-hover:text-brand-400 transition-colors">
                      +91 90505 53507
                    </span>
                  </div>
                </a>

                {/* Email */}
                <a 
                  href="mailto:booking@sitxplore.in" 
                  className="flex gap-4 items-start p-3 rounded-2xl hover:bg-[#ecebe6]/50 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-650 dark:text-brand-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Email Inquiries</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-brand-650 dark:group-hover:text-brand-400 transition-colors">
                      booking@sitxplore.in
                    </span>
                  </div>
                </a>

                {/* WhatsApp */}
                <a 
                  href="https://wa.me/919050553507" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex gap-4 items-start p-3 rounded-2xl hover:bg-[#ecebe6]/50 dark:hover:bg-white/5 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-650 dark:text-brand-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">WhatsApp Support</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-brand-650 dark:group-hover:text-brand-400 transition-colors">
                      +91 90505 53507 (Chat Live)
                    </span>
                  </div>
                </a>

                {/* Office Head */}
                <div className="flex gap-4 items-start p-3">
                  <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-650 dark:text-brand-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Base Location</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      Rishikesh / Delhi, India
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note alert card */}
            <div className="flex gap-3 items-start p-4 bg-amber-500/5 border border-amber-500/10 text-amber-800 dark:text-amber-400 text-xs rounded-2xl">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>We usually respond to all inquiries within 2 hours during operations hours (9:00 AM - 9:00 PM IST).</span>
            </div>

          </div>

          {/* Right Columns: Contact Form (3/5 size) */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="rounded-3xl bg-[#f4f3ef] dark:bg-[#111318] border border-[#d1cfc7] dark:border-white/5 p-6 sm:p-8 shadow-xl space-y-6">
              
              <h3 className="font-outfit font-extrabold text-xl text-slate-900 dark:text-white">Send Us a Message</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91-9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Query Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tell us what you want to explore, preferred duration, sharing price requirements, or queries..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-[#ecebe6]/60 dark:bg-white/5 border border-[#d1cfc7] dark:border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                ></textarea>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-500/50 text-black text-sm font-outfit font-extrabold rounded-2xl shadow-xl shadow-brand-500/10 hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? "Sending..." : "Submit Travel Query"}</span>
                {!loading && <Send className="w-4 h-4 text-black" />}
              </button>

            </form>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
