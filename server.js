const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;  // Render Environment Variable
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Dealer/Admin Schema
const dealerSchema = new mongoose.Schema({
  dealerName: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },   // नया field
  password: { type: String, required: true },
  role: { type: String, enum: ["dealer", "admin"], default: "dealer" }
});

const Dealer = mongoose.model("Dealer", dealerSchema);

// Signup API
app.post("/dealer/signup", async (req, res) => {
  try {
    const { dealerName, mobile, password, role } = req.body;   // ✅ सिर्फ एक बार destructure

    // check duplicate user
    const existing = await Dealer.findOne({ dealerName });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDealer = new Dealer({ dealerName, mobile, password: hashedPassword, role });
    await newDealer.save();

    res.json({ success: true, message: "User created successfully", user: { dealerName, role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Login API
app.post("/dealer/login", async (req, res) => {
  try {
    const { dealerName, password } = req.body;
    const user = await Dealer.findOne({ dealerName });

    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, message: "Login successful", role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Fertiliser Backend API is running...");
});

// Render gives PORT dynamically
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

