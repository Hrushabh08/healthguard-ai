const express = require("express");
const FamilyMember = require("../models/FamilyMember");
const User = require("../models/User");
const HealthLog = require("../models/HealthLog");
const auth = require("../middleware/auth");

const router = express.Router();

router.use(auth);

// ──────────────────────────────────────────
// GET /api/members — Get all family members
// ──────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, members });
  } catch (err) {
    console.error("Get members error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// POST /api/members — Add a family member
// ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, relation, dob, weight, height, email } = req.body;

    if (!name || !relation || !email) {
      return res.status(400).json({ success: false, message: "Name, relation, and email are required." });
    }

    if (email.toLowerCase().trim() === req.user.email.toLowerCase().trim()) {
      return res.status(400).json({ success: false, message: "You cannot use your own account email for a family member." });
    }

    const member = await FamilyMember.create({
      userId: req.user.id,
      name,
      relation,
      email: email.toLowerCase().trim(),
      dob: dob || "",
      weight: weight || 0,
      height: height || 0,
    });

    res.status(201).json({ success: true, member });
  } catch (err) {
    console.error("Add member error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// PUT /api/members/:id/daily — Update daily log for a member
// Also syncs to the linked user's HealthLog if the member has a registered email
// ──────────────────────────────────────────
router.put("/:id/daily", async (req, res) => {
  try {
    const { date, data } = req.body;
    if (!date || !data) {
      return res.status(400).json({ success: false, message: "Date and data required." });
    }

    const member = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    // Save to FamilyMember's dailyLogs map
    member.dailyLogs.set(date, data);
    await member.save();

    // ── Real-time sync: if this member has a registered account, write to ──
    // ── their HealthLog too so they see it when they log in. ───────────────
    if (member.email) {
      try {
        const linkedUser = await User.findOne({ email: member.email });
        if (linkedUser) {
          await HealthLog.findOneAndUpdate(
            { userId: linkedUser._id, date },
            {
              $set: {
                userId: linkedUser._id,
                date,
                lifestyle: {
                  sleep:       data.sleep       ?? 7,
                  stress:      data.stress      ?? 4,
                  steps:       data.steps       ?? "",
                  waterIntake: data.waterIntake ?? 2.0,
                  breakfast:   data.breakfast   ?? false,
                  lunch:       data.lunch       ?? false,
                  dinner:      data.dinner      ?? false,
                  smoking:     data.smoking     ?? false,
                  alcohol:     data.alcohol     ?? false,
                },
                vitals: data.vitals || {},
                notes: data.notes || {},
              },
            },
            { upsert: true, new: true, runValidators: true }
          );
          console.log(`🔗 Synced daily log [${date}] for ${member.email} → User ${linkedUser._id}`);
        }
      } catch (syncErr) {
        // Non-fatal — member log already saved
        console.error("HealthLog sync error:", syncErr.message);
      }
    }

    res.json({ success: true, member });
  } catch (err) {
    console.error("Update member daily error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// GET /api/members/:id/link-status — Check if member email is linked to an account
// ──────────────────────────────────────────
router.get("/:id/link-status", async (req, res) => {
  try {
    const member = await FamilyMember.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    let linked = false;
    if (member.email) {
      const linkedUser = await User.findOne({ email: member.email }).lean();
      linked = !!linkedUser;
    }

    res.json({ success: true, linked, email: member.email || null });
  } catch (err) {
    console.error("Link status error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// DELETE /api/members/:id — Remove a family member
// ──────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await FamilyMember.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    res.json({ success: true, message: "Member removed." });
  } catch (err) {
    console.error("Delete member error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
