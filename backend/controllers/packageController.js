import Package from "../models/Package.js";
import fs from "fs";
import path from "path";

// Helper to remove files if creation fails or package is deleted
const deleteFileSafe = (relativeUrl) => {
  if (!relativeUrl) return;
  try {
    const filename = relativeUrl.replace("/uploads/", "");
    const absolutePath = path.join(process.cwd(), "uploads", filename);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error("Failed to delete file:", relativeUrl, err);
  }
};

export const getPackages = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) {
      filter.category = category;
    }
    const packages = await Package.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, packages });
  } catch (error) {
    console.error("getPackages error:", error);
    return res.status(500).json({ success: false, message: "Error fetching packages." });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found." });
    }
    return res.status(200).json({ success: true, package: pkg });
  } catch (error) {
    console.error("getPackageById error:", error);
    return res.status(500).json({ success: false, message: "Error fetching package details." });
  }
};

export const createPackage = async (req, res) => {
  try {
    const {
      title,
      category,
      duration,
      description,
      sharingPrices, // JSON string
      bookingDeposit,
      inclusions, // JSON string or comma-separated
      exclusions, // JSON string or comma-separated
      itinerary, // JSON string
      slots, // JSON string or comma-separated
    } = req.body;

    if (!title || !category || !duration) {
      return res.status(400).json({ success: false, message: "Please fill in all required text fields." });
    }

    if (!req.files || !req.files["bannerImage"]) {
      return res.status(400).json({ success: false, message: "Please upload a cover banner image." });
    }

    const bannerFile = req.files["bannerImage"][0];
    const bannerUrl = `/uploads/${bannerFile.filename}`;

    const galleryUrls = [];
    if (req.files["galleryImages"]) {
      req.files["galleryImages"].forEach((file) => {
        galleryUrls.push(`/uploads/${file.filename}`);
      });
    }

    // Parsers
    let parsedSharingPrices = { doubleSharing: 0, tripleSharing: 0, quadSharing: 0 };
    if (sharingPrices) {
      parsedSharingPrices = typeof sharingPrices === "string" ? JSON.parse(sharingPrices) : sharingPrices;
    }

    let parsedItinerary = [];
    if (itinerary) {
      parsedItinerary = typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
    }

    let parsedInclusions = [];
    if (inclusions) {
      parsedInclusions = typeof inclusions === "string" ? JSON.parse(inclusions) : inclusions;
    }

    let parsedExclusions = [];
    if (exclusions) {
      parsedExclusions = typeof exclusions === "string" ? JSON.parse(exclusions) : exclusions;
    }

    let parsedSlots = [];
    if (slots) {
      parsedSlots = typeof slots === "string" ? JSON.parse(slots) : slots;
    }

    const newPackage = await Package.create({
      title,
      category,
      duration,
      description: description || "",
      bannerImage: bannerUrl,
      galleryImages: galleryUrls,
      sharingPrices: parsedSharingPrices,
      bookingDeposit: Number(bookingDeposit) || 3000,
      inclusions: parsedInclusions,
      exclusions: parsedExclusions,
      itinerary: parsedItinerary,
      slots: parsedSlots.length > 0 ? parsedSlots : ["2026-08-15", "2026-09-05", "2026-10-01"],
    });

    return res.status(201).json({ success: true, message: "Package created successfully", package: newPackage });
  } catch (error) {
    console.error("createPackage error:", error);
    // Cleanup uploaded files
    if (req.files) {
      if (req.files["bannerImage"]) deleteFileSafe(`/uploads/${req.files["bannerImage"][0].filename}`);
      if (req.files["galleryImages"]) {
        req.files["galleryImages"].forEach((file) => deleteFileSafe(`/uploads/${file.filename}`));
      }
    }
    return res.status(500).json({ success: false, message: "Failed to create package. Check parsing error." });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const pkgId = req.params.id;
    const pkg = await Package.findById(pkgId);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found." });
    }

    const {
      title,
      category,
      duration,
      description,
      sharingPrices,
      bookingDeposit,
      inclusions,
      exclusions,
      itinerary,
      slots,
      existingGalleryImages // JSON array of gallery image URLs that were not replaced/deleted
    } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (duration) updateData.duration = duration;
    if (description !== undefined) updateData.description = description;
    if (bookingDeposit) updateData.bookingDeposit = Number(bookingDeposit);

    if (sharingPrices) {
      updateData.sharingPrices = typeof sharingPrices === "string" ? JSON.parse(sharingPrices) : sharingPrices;
    }
    if (inclusions) {
      updateData.inclusions = typeof inclusions === "string" ? JSON.parse(inclusions) : inclusions;
    }
    if (exclusions) {
      updateData.exclusions = typeof exclusions === "string" ? JSON.parse(exclusions) : exclusions;
    }
    if (itinerary) {
      updateData.itinerary = typeof itinerary === "string" ? JSON.parse(itinerary) : itinerary;
    }
    if (slots) {
      updateData.slots = typeof slots === "string" ? JSON.parse(slots) : slots;
    }

    // File Upload updates
    if (req.files && req.files["bannerImage"]) {
      // delete old banner file
      deleteFileSafe(pkg.bannerImage);
      updateData.bannerImage = `/uploads/${req.files["bannerImage"][0].filename}`;
    }

    let keptGallery = [];
    if (existingGalleryImages) {
      keptGallery = typeof existingGalleryImages === "string" ? JSON.parse(existingGalleryImages) : existingGalleryImages;
    } else {
      keptGallery = pkg.galleryImages; // default keep all if not explicitly specified
    }

    // Detect deleted images from gallery and delete them from disk
    const deletedImages = pkg.galleryImages.filter(img => !keptGallery.includes(img));
    deletedImages.forEach(img => deleteFileSafe(img));

    const newGalleryFiles = [];
    if (req.files && req.files["galleryImages"]) {
      req.files["galleryImages"].forEach((file) => {
        newGalleryFiles.push(`/uploads/${file.filename}`);
      });
    }

    updateData.galleryImages = [...keptGallery, ...newGalleryFiles];

    const updatedPkg = await Package.findByIdAndUpdate(pkgId, updateData, { new: true });
    return res.status(200).json({ success: true, message: "Package updated successfully", package: updatedPkg });
  } catch (error) {
    console.error("updatePackage error:", error);
    return res.status(500).json({ success: false, message: "Failed to update package." });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found." });
    }

    // Delete files from storage
    deleteFileSafe(pkg.bannerImage);
    pkg.galleryImages.forEach((img) => deleteFileSafe(img));

    await Package.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Package and associated images deleted successfully" });
  } catch (error) {
    console.error("deletePackage error:", error);
    return res.status(500).json({ success: false, message: "Error deleting package." });
  }
};

// Seed utility for sample packages
export const seedPackages = async (req, res) => {
  try {
    const count = await Package.countDocuments({});
    if (count > 0) {
      return res.status(400).json({ success: false, message: "Database already contains packages. Seed bypassed." });
    }

    const defaultPackages = [
      {
        title: "Chandratal – Manali Off-Road Adventure",
        category: "Domestic Trips",
        duration: "4N/5D",
        description: "An adrenaline-fueled trip through the high-altitude passes, visiting the majestic crescent-shaped Chandratal Lake, crossing the Atal Tunnel, and camping in the freezing wind of the Himalayas.",
        bannerImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop", // placeholder live URL
        galleryImages: [
          "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?q=80&w=600&auto=format&fit=crop"
        ],
        sharingPrices: {
          doubleSharing: 10999,
          tripleSharing: 9999,
          quadSharing: 8999,
        },
        bookingDeposit: 3000,
        inclusions: [
          "Delhi to Delhi Semi-Sleeper AC Volvo Transportation",
          "2 Nights Hotel accommodation in Manali (3-star)",
          "1 Night Alpine Dome camping at Chandratal",
          "Daily Breakfast & Dinner",
          "Atal Tunnel, Sethan Village off-roading, and Sajla Waterfall visits",
          "Professional tour guide and safety host"
        ],
        exclusions: [
          "Lunch on all days",
          "Personal expenses, laundry, and telephone tips",
          "Travel insurance",
          "Any costs arising due to natural calamities, landslides, or road blocks"
        ],
        itinerary: [
          { day: 1, title: "Delhi to Manali Overnight Journey", description: "Board the comfortable Volvo AC bus from Majnu ka Tila, Delhi in the evening. Overnight journey to Manali." },
          { day: 2, title: "Manali Arrival & Sajla Waterfall", description: "Arrive in Manali, check into the hotel. Freshen up and head out to see the gorgeous Sajla Waterfall and local markets." },
          { day: 3, title: "Solang Valley, Atal Tunnel & Sethan Off-road", description: "Drive through the legendary engineering marvel, the Atal Tunnel. Visit the snowy peaks of Solang Valley and experience raw off-roading in Sethan Village." },
          { day: 4, title: "Manali to Chandratal Camping", description: "Depart early via Rohtang Pass towards Spiti Valley. Set up camps at Chandratal (Moon Lake). Witness a crystal-clear milky way galaxy at night." },
          { day: 5, title: "Chandratal to Delhi via Manali Departure", description: "Wake up early for sunset reflections on the lake. Drive back to Manali. Board the evening bus back to Delhi." }
        ],
        slots: ["2026-08-10", "2026-08-24", "2026-09-07"]
      },
      {
        title: "Manali – Kasol Adventure & Party Special",
        category: "Weekend Getaways",
        duration: "3N/4D",
        description: "Escape to the cozy cafes of Kasol, trek beside the Parvati River, soak in the hot water springs at Manikaran, and experience a lively DJ party night in Manali.",
        bannerImage: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop",
        galleryImages: [
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop"
        ],
        sharingPrices: {
          doubleSharing: 8499,
          tripleSharing: 7499,
          quadSharing: 6499,
        },
        bookingDeposit: 2500,
        inclusions: [
          "AC bus transfer from Delhi",
          "1 Night Swiss Tent camp stay in Kasol",
          "1 Night Hotel in Manali",
          "Breakfast & Dinner",
          "Trek to Chalal Village, Parvati Valley exploration",
          "DJ Night party & bonfire in Manali"
        ],
        exclusions: [
          "Any activity tickets (paragliding, rafting)",
          "Personal meals"
        ],
        itinerary: [
          { day: 1, title: "Delhi to Kasol overnight transfer", description: "Assemble at the pickup location in Delhi and start the overnight journey to the mini-Israel of India." },
          { day: 2, title: "Kasol Arrival & Chalal Trek", description: "Arrive in Kasol, check into riverside swiss tents. Trek to the peaceful village of Chalal. Enjoy local cafes." },
          { day: 3, title: "Manikaran Sahib & Manali Transfer", description: "Visit the hot springs at Manikaran Sahib. Drive to Manali. Check in and experience a private bonfire and DJ party." },
          { day: 4, title: "Manali Sightseeing & Return", description: "Explore Hadimba temple, Mall road. Board the return Volvo bus back to Delhi in the evening." }
        ],
        slots: ["2026-08-14", "2026-08-28", "2026-09-11"]
      },
      {
        title: "Kedarnath Dham Spiritual Yatra",
        category: "Domestic Trips",
        duration: "4N/5D",
        description: "A sacred pilgrimage to one of the 12 Jyotirlingas, nestled in the Garhwal Himalayas. Trek through scenic valleys to pay homage at the ancient temple of Lord Shiva.",
        bannerImage: "https://images.unsplash.com/photo-1626596147775-acb2827a4084?q=80&w=800&auto=format&fit=crop",
        galleryImages: [],
        sharingPrices: {
          doubleSharing: 12500,
          tripleSharing: 11000,
          quadSharing: 9500,
        },
        bookingDeposit: 3500,
        inclusions: [
          "Private tempo traveler transport from Haridwar/Rishikesh",
          "Standard accommodation in Guptkashi & Kedarnath top",
          "Pure vegetarian Meals (Breakfast & Dinner)",
          "Kedarnath registration support"
        ],
        exclusions: [
          "Pony/Palanquin/Helicopter charges",
          "Meals during trek"
        ],
        itinerary: [
          { day: 1, title: "Haridwar to Guptkashi (200km)", description: "Drive along the holy Ganga and Alaknanda rivers. Pass Devprayag confluence. Arrive in Guptkashi." },
          { day: 2, title: "Guptkashi to Gaurikund and Trek to Kedarnath", description: "Drive to Sonprayag/Gaurikund. Start the 16km divine trek to Kedarnath temple. Stay at the peak." },
          { day: 3, title: "Darshan and Trek down to Guptkashi", description: "Attend the morning Aarti at Kedarnath temple. Trek back to Gaurikund, drive back to hotel in Guptkashi." },
          { day: 4, title: "Guptkashi to Rishikesh & Departure", description: "Drive down to Rishikesh. Attend Ganga Aarti at Triveni Ghat. Board return transfer." }
        ],
        slots: ["2026-09-02", "2026-09-16", "2026-09-30"]
      }
    ];

    await Package.insertMany(defaultPackages);
    return res.status(201).json({ success: true, message: "Default SIT Xplore packages seeded successfully!" });
  } catch (error) {
    console.error("seedPackages error:", error);
    return res.status(500).json({ success: false, message: "Error seeding packages." });
  }
};
