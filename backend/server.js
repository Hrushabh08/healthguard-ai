require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const authRoutes = require("./src/routes/auth");
const logRoutes = require("./src/routes/logs");
const memberRoutes = require("./src/routes/members");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());

// ── Routes ───────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/members", memberRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "HealthGuard AI Backend",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ success: false, message: "Internal server error." });
});

// ── Database & Server ────────────────────
async function startServer() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`\n  HealthGuard AI Backend`);
      console.log(`  ─────────────────────`);
      console.log(`  Server:   http://localhost:${PORT}`);
      console.log(`  Auth:     http://localhost:${PORT}/api/auth`);
      console.log(`  Health:   http://localhost:${PORT}/api/health`);
      console.log(`  Env:      ${process.env.NODE_ENV || "development"}\n`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    console.log("\nMake sure MongoDB is running. You can:");
    console.log("  1. Install MongoDB locally: https://www.mongodb.com/try/download");
    console.log("  2. Use MongoDB Atlas (cloud): Update MONGO_URI in .env\n");
    process.exit(1);
  }
}

startServer();
