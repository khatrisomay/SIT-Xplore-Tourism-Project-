import mongoose from "mongoose";
import User from "../models/User.js";
import Package from "../models/Package.js";
import bcrypt from "bcryptjs";

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URL || "mongodb://localhost:27017/sitxplore";
    await mongoose.connect(connStr);
    console.log("MongoDB connected successfully");

    // Auto-seed admin user
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      await User.create({
        name: "SIT Xplore Admin",
        email: "admin@sitxplore.com",
        password: hashedPassword,
        phone: "+91-9050553507",
        role: "admin",
      });
      console.log("Auto-seeded admin user: admin@sitxplore.com / admin123");
    }

    // Auto-seed packages matching www.sitxplore.in
    const packageCount = await Package.countDocuments({});
    if (packageCount < 6) {
      // Clear legacy placeholders
      await Package.deleteMany({});
      
      const defaultPackages = [
        {
          title: "Manali – Kasol Adventure Special",
          category: "Weekend Getaways",
          duration: "5N/6D",
          description: "Enjoy a complete road trip from Delhi to Manali & Kasol in a comfortable Tempo Traveller. Perfect for groups, couples, and friends.",
          bannerImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
          galleryImages: [],
          sharingPrices: {
            doubleSharing: 6999,
            tripleSharing: 5999,
            quadSharing: 5499,
          },
          bookingDeposit: 2000,
          inclusions: [
            "Delhi–Manali–Kasol–Delhi Travel by Tempo Traveller",
            "2 Nights Hotel Stay in Manali",
            "1 Night Stay in Kasol",
            "Daily Breakfast & Dinner",
            "Complete Sightseeing as per itinerary",
            "2 Nights Bonfire And Music Special"
          ],
          exclusions: [
            "Lunch on all days",
            "Personal expenses, laundry, and tips",
            "Any activity tickets (paragliding, rafting)"
          ],
          itinerary: [
            { day: 1, title: "Delhi to Manali (Overnight Journey)", description: "Board the tempo traveller from Delhi in the evening. Overnight scenic drive to the hills." },
            { day: 2, title: "Manali Arrival + Local Sightseeing", description: "Check in to the hotel, relax, and explore local places like Hadimba Temple and Mall Road." },
            { day: 3, title: "Solang Valley + Atal Tunnel + Sissu", description: "Drive through the Atal Tunnel to Sissu (Lahaul Valley) and enjoy adventure activities at Solang Valley." },
            { day: 4, title: "Manali to Kasol + Manikaran Sahib", description: "Travel to Kasol, visit the holy Manikaran Sahib hot springs, and settle in riverside camps." },
            { day: 5, title: "Kasol Stay + Explore Chalal Village", description: "Trek to Chalal Village, experience Parvati Valley vibes and explore local cafes." },
            { day: 6, title: "Return Journey to Delhi", description: "Depart from Kasol in the afternoon and arrive back in Delhi overnight." }
          ],
          slots: ["2026-08-01", "2026-08-15", "2026-08-29"]
        },
        {
          title: "Kedarnath Yatra Spiritual Journey",
          category: "Domestic Trips",
          duration: "4N/5D",
          description: "Experience the spiritual journey to Kedarnath with comfortable travel and well-planned itinerary. Perfect for devotees and adventure lovers.",
          bannerImage: "https://images.unsplash.com/photo-1626596147775-acb2827a4084?q=80&w=1200&auto=format&fit=crop",
          galleryImages: [],
          sharingPrices: {
            doubleSharing: 7499,
            tripleSharing: 6499,
            quadSharing: 5999,
          },
          bookingDeposit: 2000,
          inclusions: [
            "Delhi–Guptkashi–Kedarnath–Delhi Travel",
            "Stay in Hotels & Camps",
            "Daily Breakfast & Dinner",
            "Complete Guidance for the Trek",
            "Driver Allowance & Toll Taxes"
          ],
          exclusions: [
            "Lunch on all days",
            "Pony/Palanquin/Helicopter charges",
            "Personal expenses & medicines"
          ],
          itinerary: [
            { day: 1, title: "Delhi to Guptkashi Journey", description: "Start early from Delhi towards Guptkashi, passing beautiful confluences of holy rivers." },
            { day: 2, title: "Kedarnath Valley Trek", description: "Drive to Gaurikund and start the holy 16 km trek to Kedarnath Temple. Stay overnight at the top." },
            { day: 3, title: "Kedarnath Darshan & Rituals", description: "Wake up early for VIP Darshan, explore the temple surroundings, and absorb the spiritual energy." },
            { day: 4, title: "Trek Down & Return to Delhi", description: "Trek back down to Gaurikund, freshen up, and head towards Delhi overnight." },
            { day: 5, title: "Delhi Arrival", description: "Reach Delhi early in the morning with lifelong divine memories." }
          ],
          slots: ["2026-08-05", "2026-08-19", "2026-09-02"]
        },
        {
          title: "Tirthan – Jibhi Valley Escape",
          category: "Weekend Getaways",
          duration: "4N/5D",
          description: "Explore the hidden gems of Himachal with our Tirthan–Jibhi trip. Perfect for nature lovers, peace seekers, and offbeat travelers.",
          bannerImage: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?q=80&w=1200&auto=format&fit=crop",
          galleryImages: [],
          sharingPrices: {
            doubleSharing: 6499,
            tripleSharing: 5999,
            quadSharing: 5499,
          },
          bookingDeposit: 2000,
          inclusions: [
            "Delhi–Jibhi–Tirthan–Delhi Travel by Comfort Vehicle",
            "2 Nights Stay (Jibhi / Tirthan)",
            "Daily Breakfast & Dinner",
            "Sightseeing as per itinerary",
            "Driver Allowance & Toll Taxes"
          ],
          exclusions: [
            "Lunch on all days",
            "Optional treks or entrance fees",
            "Personal laundry, phone calls, and tips"
          ],
          itinerary: [
            { day: 1, title: "Delhi to Jibhi Transfer", description: "Board the vehicle in the evening from Delhi for an overnight drive to the lush green hills of Jibhi." },
            { day: 2, title: "Jibhi Waterfall & Mini Thailand", description: "Arrive, check into stays, and explore the famous Jibhi waterfall and local secret spot 'Mini Thailand'." },
            { day: 3, title: "Jalori Pass & Raghupur Fort Trek", description: "Trek up to Jalori Pass, witness panoramic Himalayan views, and hike to the ancient Raghupur Fort ruins." },
            { day: 4, title: "Tirthan Valley & Chhoie Waterfall", description: "Explore the scenic Tirthan Valley, hike to Chhoie Waterfall, and depart back to Delhi in the evening." },
            { day: 5, title: "Delhi Arrival", description: "Arrive in Delhi early morning with refreshed mind and spirits." }
          ],
          slots: ["2026-08-08", "2026-08-22", "2026-09-05"]
        },
        {
          title: "Shimla – Manali Classic Combo",
          category: "Domestic Trips",
          duration: "5N/6D",
          description: "Experience the best of Himachal with Shimla & Manali combo. Enjoy a comfortable journey with private vehicle arrangements based on your group size.",
          bannerImage: "https://images.unsplash.com/photo-1609948543911-4c68b5f7f3b3?q=80&w=1200&auto=format&fit=crop",
          galleryImages: [],
          sharingPrices: {
            doubleSharing: 14000,
            tripleSharing: 10999,
            quadSharing: 8999,
          },
          bookingDeposit: 2000,
          inclusions: [
            "Private vehicle for the entire trip based on group size",
            "Delhi–Shimla–Manali–Delhi Travel",
            "1 Night Stay in Shimla",
            "2 Nights Stay in Manali",
            "Daily Breakfast & Dinner",
            "Full Sightseeing schedule",
            "Driver Allowance & Toll Taxes"
          ],
          exclusions: [
            "Lunch on all days",
            "Snow sports, skiing, or Rohtang pass permission fees",
            "Personal expenses"
          ],
          itinerary: [
            { day: 1, title: "Delhi to Shimla Overnight Journey", description: "Board the vehicle in Delhi for a comfortable overnight mountain drive to Shimla." },
            { day: 2, title: "Shimla Arrival & Kufri Sightseeing", description: "Check in, visit Kufri, enjoy horse riding, and walk around Mall Road & Ridge in the evening." },
            { day: 3, title: "Shimla Local & Manali Transfer", description: "See local attractions, then drive to Manali. Check into your hotel in Manali by night." },
            { day: 4, title: "Manali Snow Point Day", description: "Drive to Solang Valley or Atal Tunnel to experience gorgeous snow-capped peaks and activities." },
            { day: 5, title: "Manali Local & Return", description: "Visit Hadimba Temple and Club House, then board your return bus to Delhi in the evening." },
            { day: 6, title: "Delhi Arrival", description: "Arrive back in Delhi in the morning to conclude the classic tour." }
          ],
          slots: ["2026-08-10", "2026-08-24", "2026-09-07"]
        },
        {
          title: "Zanskar Ladakh Exploration",
          category: "Domestic Trips",
          duration: "7N/8D",
          description: "Experience India’s most raw and unexplored destination – Zanskar Valley. A perfect adventure road trip through Shinku La Pass, glaciers, monasteries, and breathtaking Himalayan landscapes.",
          bannerImage: "https://discoverkullumanali.in/wp-content/uploads/2021/01/Chandratal-lake-Spiti-discoverkullumanali.in_.jpg",
          galleryImages: [],
          sharingPrices: {
            doubleSharing: 24999,
            tripleSharing: 22999,
            quadSharing: 21999,
          },
          bookingDeposit: 5000,
          inclusions: [
            "Delhi to Delhi transportation (Tempo Traveller / Innova Crysta)",
            "Premium Stays (Hotels + Camping)",
            "Daily Breakfast & Dinner",
            "All sightseeing entries as per itinerary",
            "Driver charges, toll & parking"
          ],
          exclusions: [
            "Lunch on all days",
            "Personal medicines, high altitude equipment",
            "Tips, laundry, and items of personal nature"
          ],
          itinerary: [
            { day: 1, title: "Delhi to Manali overnight transfer", description: "Meet the travel crew in Delhi and start the mountain journey to Manali." },
            { day: 2, title: "Manali Arrival & Acclimatization", description: "Arrive in Manali, local sightseeing of Hadimba Temple and Mall road cafes. Rest for the high altitude trip." },
            { day: 3, title: "Manali to Gonbo Ranjan via Shinku La", description: "Cross the Atal Tunnel, drive through Keylong/Jispa, conquer Shinku La Pass, and camp near the holy Gonbo Ranjan peak." },
            { day: 4, title: "Gonbo Ranjan to Phuktal Monastery Trek", description: "Drive towards Padum and trek to the cliffside Phuktal Monastery, a unique architectural marvel." },
            { day: 5, title: "Zanskar Monasteries & Palace Tour", description: "Visit the ancient Karsha Monastery and explore the historical Zangla Palace." },
            { day: 6, title: "Pensi La Pass & Drang Drung Glacier", description: "Drive to Pensi La pass, view the majestic Drang Drung Glacier, and explore pristine mountain lakes." },
            { day: 7, title: "Padum to Jispa Return", description: "Drive back from Padum to Jispa via Shinku La Pass. Overnight stay in Jispa." },
            { day: 8, title: "Jispa to Delhi Return", description: "Drive back from Jispa to Manali, then board the overnight vehicle back to Delhi." }
          ],
          slots: ["2026-08-12", "2026-08-26"]
        },
        {
          title: "Chandratal-Manali Spiti Tour",
          category: "Domestic Trips",
          duration: "4N/5D",
          description: "Experience the perfect blend of adventure and leisure with Chandratal Lake and Manali. Enjoy off-road thrill, mountain vibes, waterfalls, and café culture in one trip.",
          bannerImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
          galleryImages: [],
          sharingPrices: {
            doubleSharing: 10999,
            tripleSharing: 9999,
            quadSharing: 8999,
          },
          bookingDeposit: 3000,
          inclusions: [
            "Delhi to Delhi transportation (Tempo Traveller / AC Bus)",
            "2 Nights Manali Hotel Stay",
            "1 Night Chandratal Camp Stay",
            "Daily Breakfast & Dinner",
            "Sightseeing as per itinerary",
            "Driver allowance, toll & parking"
          ],
          exclusions: [
            "Lunch on all days",
            "Snow sports, cafe visits",
            "Personal expenses"
          ],
          itinerary: [
            { day: 1, title: "Delhi to Manali Overnight Journey", description: "Board the vehicle in the evening from Delhi. Overnight journey to Manali." },
            { day: 2, title: "Manali Arrival & Cafe Hop", description: "Arrive in Manali, check in, visit Hadimba Temple and relax in Old Manali cafes." },
            { day: 3, title: "Manali to Chandratal (Off-Road Adventure)", description: "Drive via Atal Tunnel and Batal to the mystical crescent-shaped Chandratal Lake. Stay in camps." },
            { day: 4, title: "Chandratal back to Manali (DJ & Bonfire)", description: "Return to Manali, visit Sethan Village and Sajla Waterfall. Enjoy a bonfire and DJ party." },
            { day: 5, title: "Manali to Delhi Return", description: "Explore the local markets, buy souvenirs, and board the evening vehicle back to Delhi." }
          ],
          slots: ["2026-08-14", "2026-08-28"]
        }
      ];
      await Package.insertMany(defaultPackages);
      console.log("Auto-seeded default travel packages.");
    }
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
