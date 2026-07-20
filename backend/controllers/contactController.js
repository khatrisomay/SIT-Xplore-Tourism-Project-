import Contact from "../models/Contact.js";

// @desc Submit a new query
// @route POST /api/contacts
// @access Public
export const submitQuery = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: "Please fill in all fields." });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Query submitted successfully. We will get back to you shortly!",
      contact,
    });
  } catch (error) {
    console.error("Submit query error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// @desc Get all queries
// @route GET /api/contacts
// @access Private/Admin
export const getQueries = async (req, res) => {
  try {
    const queries = await Contact.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, queries });
  } catch (error) {
    console.error("Get queries error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc Toggle resolve query status
// @route PUT /api/contacts/:id
// @access Private/Admin
export const resolveQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await Contact.findById(id);

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found." });
    }

    query.status = query.status === "pending" ? "resolved" : "pending";
    await query.save();

    res.status(200).json({ success: true, message: `Query status updated to ${query.status}`, query });
  } catch (error) {
    console.error("Resolve query error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// @desc Delete query
// @route DELETE /api/contacts/:id
// @access Private/Admin
export const deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await Contact.findByIdAndDelete(id);

    if (!query) {
      return res.status(404).json({ success: false, message: "Query not found." });
    }

    res.status(200).json({ success: true, message: "Query deleted successfully." });
  } catch (error) {
    console.error("Delete query error:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
