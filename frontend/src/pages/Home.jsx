import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { Search, MapPin, Calendar, Clock, ArrowRight, ShieldCheck, Star } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("cat") || "All";
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/packages");
      if (res.data?.success) {
        let list = res.data.packages;
        // If empty, auto-seed
        if (list.length === 0) {
          await axios.post("/api/packages/seed");
          const reRes = await axios.get("/api/packages");
          list = reRes.data.packages || [];
        }
        setPackages(list);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // Scroll to packages section when category filter is active
  useEffect(() => {
    if (activeCategory !== "All") {
      const section = document.getElementById("packages-section");
      if (section) {
        // slight timeout to allow page layout render
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [activeCategory]);

  const categories = ["All", "Domestic Trips", "International Trips", "Weekend Getaways"];

  const filteredPackages = packages.filter((pkg) => {
    const matchesCategory = activeCategory === "All" || pkg.category === activeCategory;
    const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pkg.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#ecebe6] dark:bg-[#0b0c10] text-slate-800 dark:text-[#e7e7e7] flex flex-col transition-colors duration-300">
      <Navbar />

      <header 
        className="relative py-20 md:py-32 px-6 overflow-hidden flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Overlay for readability and blurring */}
        <div className="absolute inset-0 bg-[#ecebe6]/80 dark:bg-[#0b0c10]/85 backdrop-blur-[2px] pointer-events-none" />
        
        {/* Background gradient decorative */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-brand-500/5 dark:bg-brand-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

        {/* Bottom smooth fade transition into page background */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#ecebe6] via-[#ecebe6]/70 to-transparent dark:from-[#0b0c10] dark:via-[#0b0c10]/70 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <span className="px-4 py-1.5 text-xs font-outfit font-bold tracking-widest uppercase rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 inline-block animate-pulse">
            Premium Himalayan Expeditions
          </span>
          <h1 className="text-4xl md:text-6xl font-outfit font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Chasing Horizons With <br />
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 bg-clip-text text-transparent dark:from-brand-400 dark:via-brand-500 dark:to-brand-600">
              SIT Xplore Luxury Tours
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Forget generic itineraries. Experience off-roading, camping beneath the stars, and custom-guided mountain trekking, built with premium stays.
          </p>

          {/* Search bar widget */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#f4f3ef] dark:bg-[#111318]/90 border border-gray-200 dark:border-white/5 p-2 rounded-2xl max-w-xl mx-auto shadow-md dark:shadow-2xl backdrop-blur-xl mt-8">
            <div className="flex items-center gap-3 px-3 w-full">
              <Search className="w-5 h-5 text-brand-500" />
              <input
                type="text"
                placeholder="Where do you want to explore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-800 dark:text-white text-sm w-full py-2 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-black text-sm font-outfit font-bold shadow-lg shadow-brand-500/15 hover:shadow-brand-500/30 transition-all shrink-0">
              Find Packages
            </button>
          </div>
        </div>
      </header>

      {/* Category Navigation Pills */}
      <section id="packages-section" className="py-8 px-6 max-w-7xl mx-auto w-full scroll-mt-20">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-3 border-b border-gray-200 dark:border-white/5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchParams({ cat })}
              className={`px-5 py-2.5 rounded-full font-outfit text-xs font-semibold tracking-wider transition-all whitespace-nowrap shrink-0 border ${
                activeCategory === cat
                  ? "bg-brand-50 text-black border-brand-500 shadow-md shadow-brand-500/10"
                  : "bg-[#f4f3ef] dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Tour Grid */}
      <main className="flex-grow py-8 px-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
            <div className="h-96 rounded-2xl bg-[#f4f3ef] dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse" />
            <div className="h-96 rounded-2xl bg-[#f4f3ef] dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse" />
            <div className="h-96 rounded-2xl bg-[#f4f3ef] dark:bg-white/5 border border-gray-200 dark:border-white/5 animate-pulse" />
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-gray-500 dark:text-gray-400 font-outfit text-lg">No tour packages found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchParams({});
                setSearchQuery("");
              }}
              className="text-brand-600 dark:text-brand-500 hover:underline font-outfit text-sm font-semibold"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => {
              // Starting price tier is standard/quad sharing rate
              const startingPrice = pkg.sharingPrices?.quadSharing || pkg.sharingPrices?.doubleSharing || 0;
              return (
                <article
                  key={pkg._id}
                  className="group rounded-2xl overflow-hidden bg-[#f4f3ef] dark:bg-[#111318]/45 border border-gray-200 dark:border-white/5 flex flex-col h-full hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 animate-fade-in"
                >
                  
                  {/* Package Banner */}
                  <div className="h-52 w-full overflow-hidden relative">
                    <img
                      src={pkg.bannerImage}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-outfit font-extrabold bg-white/95 dark:bg-[#0b0c10]/75 border border-gray-200 dark:border-white/10 text-brand-600 dark:text-brand-400">
                      {pkg.category.split(" ")[0]}
                    </div>
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-outfit bg-brand-500 text-black font-extrabold flex items-center gap-1.5 shadow-md">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-outfit font-extrabold text-xl text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {pkg.description || "Experience the best peaks, treks, and camping with SIT Xplore luxury support."}
                      </p>
                    </div>

                    {/* Features list */}
                    <div className="flex flex-wrap gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase">
                      {pkg.inclusions && pkg.inclusions.slice(0, 3).map((inc, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 truncate max-w-[140px]">
                          {inc.split(" ")[0] || "Stay"} {inc.split(" ")[1] || "Included"}
                        </span>
                      ))}
                    </div>

                    <div className="border-t border-gray-150 dark:border-white/5 pt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Starting From</span>
                        <span className="text-xl font-outfit font-extrabold text-gray-900 dark:text-white">
                          ₹{startingPrice.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link
                        to={`/package/${pkg._id}`}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-brand-500 text-gray-700 dark:text-gray-300 hover:text-black text-xs font-outfit font-bold border border-gray-200 dark:border-white/5 hover:border-brand-500 flex items-center gap-2 group-hover:translate-x-1 transition-all"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>

                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Services Trust grid */}
      <section className="bg-[#e6e4dc] dark:bg-[#0e1014] border-t border-b border-gray-200 dark:border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-outfit font-bold text-gray-900 dark:text-white text-base">Verified Hosts & Guides</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Every tour is accompanied by certified mountain hosts and emergency support crews.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-outfit font-bold text-gray-900 dark:text-white text-base">Flexible Departures</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Pick slots from weekend getaways to multi-day summer expeditions easily.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-500">
              <Star className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-outfit font-bold text-gray-900 dark:text-white text-base">Premium Comfort Stays</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">No generic motels. Rest in luxury Swiss domes and highly rated boutique villas.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
