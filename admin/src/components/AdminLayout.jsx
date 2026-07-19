import React, { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, Map, Compass, BookOpen, LogOut, ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/login");
    } else {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e7e7e7] flex flex-col md:flex-row font-sans">
      
      {/* Sidebar Panel */}
      <aside className="w-full md:w-64 shrink-0 admin-sidebar flex flex-col justify-between py-6 px-4">
        <div className="space-y-8">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3 px-2">
            <img src="/sit xplore new logo.png" alt="SIT Xplore Logo" className="w-8 h-8 rounded-full" />
            <div>
              <span className="font-outfit font-extrabold text-base tracking-wider text-white">SIT <span className="text-brand-500">ADMIN</span></span>
              <p className="text-[9px] text-gray-500 tracking-wider uppercase font-outfit">Operations Hub</p>
            </div>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-1.5 font-outfit text-sm">
            <li>
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive("/dashboard")
                    ? "bg-brand-500 text-black font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Analytics Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/destinations"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive("/destinations")
                    ? "bg-brand-500 text-black font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Map className="w-4 h-4" />
                <span>Destinations Packages</span>
              </Link>
            </li>
            <li>
              <Link
                to="/bookings"
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive("/bookings")
                    ? "bg-brand-500 text-black font-bold"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Bookings Logs</span>
              </Link>
            </li>
          </ul>

        </div>

        {/* Bottom controls */}
        <div className="space-y-3 pt-6 border-t border-white/5">
          <a
            href="http://localhost:5173/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2 text-xs text-gray-400 hover:text-white hover:underline font-outfit"
          >
            <Compass className="w-3.5 h-3.5 text-brand-500" />
            <span>Launch Client Site</span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/10 rounded-xl transition-colors font-outfit text-left focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Control</span>
          </button>
        </div>

      </aside>

      {/* Main View Area */}
      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}
