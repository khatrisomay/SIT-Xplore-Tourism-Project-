import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Login() {
  const { login, user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.data?.success) {
        login(res.data.token, res.data.user);
        navigate("/");
      } else {
        setError(res.data?.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError(err.response?.data?.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col justify-between transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-brand-500/5 blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md bg-white dark:bg-[#111318]/90 border border-gray-250 dark:border-white/5 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-outfit font-extrabold text-3xl text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Log in to book luxury tours and track itineraries.</p>
          </div>

          {error && (
            <div className="flex gap-2.5 items-start p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20 text-red-650 dark:text-red-400 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Email Address</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3.5 py-3 focus-within:border-brand-500 transition-colors">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white w-full placeholder-gray-400 dark:placeholder-gray-600"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Password</label>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl px-3.5 py-3 focus-within:border-brand-500 transition-colors">
                <Lock className="w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-slate-800 dark:text-white w-full placeholder-gray-400 dark:placeholder-gray-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-400 disabled:bg-brand-500/50 text-black text-sm font-outfit font-bold rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "Signing In..." : "Sign In"}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-600 dark:text-brand-500 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <div className="py-4 text-center text-xs text-gray-500 dark:text-gray-600">SIT Xplore Admin portal? <a href="http://localhost:5174/login" className="hover:underline text-brand-600 dark:text-brand-500/80">Manage Destinations</a></div>
    </div>
  );
}
