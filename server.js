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
  password: { type: String, required: true },
  role: { type: String, enum: ["dealer", "admin"], default: "dealer" }
});

const Dealer = mongoose.model("Dealer", dealerSchema);

// Signup API
app.post("/dealer/signup", async (req, res) => {
  try {
    const { dealerName, password, role } = req.body;

    // check duplicate user
    const existing = await Dealer.findOne({ dealerName });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDealer = new Dealer({ dealerName, password: hashedPassword, role });
    await newDealer.save();

    res.json({ message: "User created successfully", user: { dealerName, role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login API
app.post("/dealer/login", async (req, res) => {
  try {
    const { dealerName, password } = req.body;
    const user = await Dealer.findOne({ dealerName });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Fertiliser Backend API is running...");
});

// Render gives PORT dynamically
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
