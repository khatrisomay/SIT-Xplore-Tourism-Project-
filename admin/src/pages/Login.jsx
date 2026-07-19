import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already authorized, route to dashboard
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Auto-seed admin first in case it's the first build run
      try {
        await axios.post("/api/auth/seed-admin");
      } catch (err) {
        // seed already exists or database is unreachable, bypass
      }

      // 2. Perform authentications login
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.data?.success) {
        const { token, user } = res.data;
        if (user.role !== "admin") {
          setError("Access Denied: Administrator role is required to enter this dashboard.");
          return;
        }
        localStorage.setItem("adminToken", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setError(err.response?.data?.message || "Invalid credentials. Try seeding using: admin@sitxplore.com / admin123");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center px-6 relative overflow-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-[20%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#111318]/90 border border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6 z-10 relative">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-outfit font-extrabold text-3xl text-white">SIT Xplore Operations</h2>
          <p className="text-xs text-gray-400">Control center for tour packages and booking tracking logs.</p>
        </div>

        {error && (
          <div className="flex gap-2.5 items-start p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Email Address</label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-3.5 py-3 focus-within:border-brand-500 transition-colors">
              <Mail className="w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                placeholder="admin@sitxplore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Password</label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-3.5 py-3 focus-within:border-brand-500 transition-colors">
              <Lock className="w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-500/50 text-black text-sm font-outfit font-bold rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? "Authorizing..." : "Admin Access Gate"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>

        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-[10px] text-gray-400 text-center leading-normal">
          Default seed credentials:<br />
          Email: <strong className="text-white">admin@sitxplore.com</strong><br />
          Password: <strong className="text-white">admin123</strong>
        </div>

      </div>
    </div>
  );
}
