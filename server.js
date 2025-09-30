const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Atlas connection string Render के Environment Variable से आएगा
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI is missing");
  process.exit(1);
}

const client = new MongoClient(uri);

async function start() {
  await client.connect();
  console.log("✅ Connected to MongoDB Atlas");

  const db = client.db("dealerDB");        // Database name
  const collection = db.collection("reports"); // Collection name

  // Save data
  app.post("/save-report", async (req, res) => {
    try {
      const result = await collection.insertOne(req.body);
      res.json({ success: true, id: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Fetch all data
  app.get("/get-reports", async (_req, res) => {
    try {
      const data = await collection.find({}).toArray();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

start().catch(err => {
  console.error("❌ Startup error:", err);
  process.exit(1);
});
