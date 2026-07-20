import React from "react";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#07080b] border-t border-white/5 py-12 px-6 md:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand info */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <img src="/sit xplore new logo.png" alt="SIT Xplore" className="w-9 h-9 object-cover rounded-full" />
            <span className="font-outfit font-extrabold text-lg tracking-wider text-white">
              SIT <span className="text-brand-500">XPLORE</span>
            </span>
          </div>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            Crafting luxury travel and adventure experiences in India. Explore off-road peaks, pristine lakes, and historical wonders with expert guides and premium hospitality.
          </p>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SIT Xplore. All rights reserved.
          </p>
          <p className="text-xs text-brand-500 font-outfit font-semibold tracking-wider">
            Designed & Developed by Somay Khatri
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-outfit font-bold text-white text-sm tracking-widest uppercase mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>
              <a href="/?cat=Domestic Trips" className="hover:text-brand-500 transition-colors">Domestic Tours</a>
            </li>
            <li>
              <a href="/?cat=International Trips" className="hover:text-brand-500 transition-colors">International Expeditions</a>
            </li>
            <li>
              <a href="/?cat=Weekend Getaways" className="hover:text-brand-500 transition-colors">Weekend Escapes</a>
            </li>
            <li>
              <a href="/login" className="hover:text-brand-500 transition-colors">Member Sign In</a>
            </li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="font-outfit font-bold text-white text-sm tracking-widest uppercase mb-4">Contact Support</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-brand-500 shrink-0" />
              <a href="tel:+919050553507" className="hover:text-white transition-colors">+91-9050553507</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-500 shrink-0" />
              <a href="mailto:booking@sitxplore.in" className="hover:text-white transition-colors">booking@sitxplore.in</a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
              <span>Delhi, India</span>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
