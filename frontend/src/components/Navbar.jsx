import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { Menu, X, User, LogOut, Briefcase, Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0b0c10]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 py-3 px-4 sm:px-6 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/sit xplore new logo.png"
            alt="SIT Xplore Logo"
            className="w-10 h-10 object-cover rounded-full border border-brand-500/20 group-hover:border-brand-500/60 transition-all duration-300"
          />
          <div>
            <span className="font-outfit font-extrabold text-lg sm:text-xl tracking-wider text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              SIT <span className="text-brand-500">XPLORE</span>
            </span>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest uppercase font-outfit">Luxury Travel</p>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8 font-outfit text-sm font-medium tracking-wide text-gray-600 dark:text-gray-300">
          <li>
            <Link to="/" className={`hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${isActive("/") ? "text-brand-500 font-bold" : ""}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/?cat=Domestic Trips" className={`hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${location.search.includes("Domestic") ? "text-brand-500 font-bold" : ""}`}>
              Domestic Trips
            </Link>
          </li>
          <li>
            <Link to="/?cat=International Trips" className={`hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${location.search.includes("International") ? "text-brand-500 font-bold" : ""}`}>
              International Trips
            </Link>
          </li>
          <li>
            <Link to="/?cat=Weekend Getaways" className={`hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${location.search.includes("Weekend") ? "text-brand-500 font-bold" : ""}`}>
              Weekend Getaways
            </Link>
          </li>
          <li>
            <Link to="/?cat=Hotel Booking" className={`hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${location.search.includes("Hotel") ? "text-brand-500 font-bold" : ""}`}>
              Hotels
            </Link>
          </li>
          <li>
            <Link to="/?cat=Vehicle Rental" className={`hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${location.search.includes("Vehicle") ? "text-brand-500 font-bold" : ""}`}>
              Vehicle Rentals
            </Link>
          </li>
        </ul>

        {/* Right side: Theme Toggle & User Actions */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-all focus:outline-none"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5 text-brand-500" /> : <Moon className="w-4.5 h-4.5 text-brand-700" />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/my-bookings"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/10 hover:border-brand-500/30 text-sm font-outfit text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-all bg-gray-50 dark:bg-transparent"
              >
                <Briefcase className="w-4 h-4 text-brand-500" />
                <span>My Bookings</span>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/10">
                <span className="text-xs text-gray-500 dark:text-gray-400">Hi, {user.name.split(" ")[0]}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-red-500 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-outfit text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-outfit font-bold rounded-full bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-black shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls (Hamburger + Theme Toggle) */}
        <div className="flex md:hidden items-center gap-2">
          
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 focus:outline-none"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-brand-500" /> : <Moon className="w-5 h-5 text-brand-700" />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white dark:bg-[#111318] border-b border-gray-200 dark:border-white/5 py-5 px-6 animate-fade-in shadow-xl transition-colors duration-300">
          <ul className="flex flex-col gap-4 font-outfit text-base text-gray-700 dark:text-gray-300 mb-6">
            <li>
              <Link to="/" onClick={() => setIsOpen(false)} className="block hover:text-brand-600 dark:hover:text-brand-400">
                Home
              </Link>
            </li>
            <li>
              <Link to="/?cat=Domestic Trips" onClick={() => setIsOpen(false)} className="block hover:text-brand-600 dark:hover:text-brand-400">
                Domestic Trips
              </Link>
            </li>
            <li>
              <Link to="/?cat=International Trips" onClick={() => setIsOpen(false)} className="block hover:text-brand-600 dark:hover:text-brand-400">
                International Trips
              </Link>
            </li>
            <li>
              <Link to="/?cat=Weekend Getaways" onClick={() => setIsOpen(false)} className="block hover:text-brand-600 dark:hover:text-brand-400">
                Weekend Getaways
              </Link>
            </li>
            <li>
              <Link to="/?cat=Hotel Booking" onClick={() => setIsOpen(false)} className="block hover:text-brand-600 dark:hover:text-brand-400">
                Hotels
              </Link>
            </li>
            <li>
              <Link to="/?cat=Vehicle Rental" onClick={() => setIsOpen(false)} className="block hover:text-brand-600 dark:hover:text-brand-400">
                Vehicle Rentals
              </Link>
            </li>
          </ul>

          <div className="border-t border-gray-200 dark:border-white/5 pt-4">
            {user ? (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Logged in as: <strong className="text-gray-900 dark:text-white">{user.name}</strong></div>
                <Link
                  to="/my-bookings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-center font-outfit hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-white"
                >
                  <Briefcase className="w-4 h-4 text-brand-500" />
                  <span>My Bookings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="py-2.5 rounded-xl bg-red-100 dark:bg-red-950/20 hover:bg-red-200 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-outfit border border-red-200 dark:border-red-500/20 text-center w-full"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-center font-outfit text-gray-700 dark:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-center font-outfit font-bold shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
