const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Schema
const dealerSchema = new mongoose.Schema({
  dealerName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "dealer" }
});

const Dealer = mongoose.model("Dealer", dealerSchema);

// Signup (create user)
app.post("/dealer/signup", async (req, res) => {
  try {
    const { dealerName, password, role } = req.body;

    const existing = await Dealer.findOne({ dealerName });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const dealer = new Dealer({
      dealerName,
      password: hashedPassword,
      role
    });

    await dealer.save();

    res.status(201).json({ message: "User created successfully", dealer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/dealer/login", async (req, res) => {
  try {
    const { dealerName, password } = req.body;

    const dealer = await Dealer.findOne({ dealerName });
    if (!dealer) return res.status(400).json({ error: "Invalid dealerName or password" });

    const isMatch = await bcrypt.compare(password, dealer.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid dealerName or password" });

    res.json({ message: "Login successful", dealer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("🚀 Backend is working!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
