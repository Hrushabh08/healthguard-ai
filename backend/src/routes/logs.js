const express = require("express");
const HealthLog = require("../models/HealthLog");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

// ──────────────────────────────────────────
// GET /api/logs — Get all logs for user (last 30)
// ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const logs = await HealthLog.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(30)
      .lean();

    res.json({ success: true, logs });
  } catch (err) {
    console.error("Get logs error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// GET /api/logs/today — Get today's log
// ──────────────────────────────────────────
router.get("/today", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const log = await HealthLog.findOne({
      userId: req.user.id,
      date: today,
    }).lean();

    res.json({ success: true, log: log || null });
  } catch (err) {
    console.error("Get today log error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// POST /api/logs — Save/update a daily log
// ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { date, vitals, lifestyle, notes } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required." });
    }

    const log = await HealthLog.findOneAndUpdate(
      { userId: req.user.id, date },
      {
        userId: req.user.id,
        date,
        vitals: vitals || {},
        lifestyle: lifestyle || {},
        notes: notes || {},
      },
      { upsert: true, new: true, runValidators: true }
    );

    // ── Reverse-Sync: Update any FamilyMember records tracking this user ──
    try {
      const FamilyMember = require("../models/FamilyMember");
      const userEmail = req.user.email.toLowerCase().trim();
      const matchedMembers = await FamilyMember.find({ email: userEmail });
      
      if (matchedMembers.length > 0) {
        const syncPromises = [];
        matchedMembers.forEach(member => {
          member.dailyLogs.set(date, {
            sleep:       lifestyle?.sleep       ?? 7,
            stress:      lifestyle?.stress      ?? 4,
            steps:       lifestyle?.steps       ?? "",
            waterIntake: lifestyle?.waterIntake ?? 2.0,
            breakfast:   lifestyle?.breakfast   ?? false,
            lunch:       lifestyle?.lunch       ?? false,
            dinner:      lifestyle?.dinner      ?? false,
            smoking:     lifestyle?.smoking     ?? false,
            alcohol:     lifestyle?.alcohol     ?? false,
            vitals:      vitals || {},
            notes:       notes || {},
          });
          syncPromises.push(member.save());
        });
        await Promise.all(syncPromises);
        console.log(`🔗 Reverse-synced daily log [${date}] from User ${req.user.id} back to ${matchedMembers.length} FamilyMember profile(s)`);
      }
    } catch (syncErr) {
      console.error("Reverse-sync error:", syncErr.message);
    }

    res.json({ success: true, message: "Log saved.", log });
  } catch (err) {
    console.error("Save log error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// DELETE /api/logs/:date — Delete a log by date
// ──────────────────────────────────────────
router.delete("/:date", async (req, res) => {
  try {
    await HealthLog.findOneAndDelete({
      userId: req.user.id,
      date: req.params.date,
    });
    res.json({ success: true, message: "Log deleted." });
  } catch (err) {
    console.error("Delete log error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
