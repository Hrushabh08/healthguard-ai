const express = require("express");
const FamilyMember = require("../models/FamilyMember");
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
    const { name, relation, dob, weight, height } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ success: false, message: "Name and relation are required." });
    }

    const member = await FamilyMember.create({
      userId: req.user.id,
      name,
      relation,
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

    member.dailyLogs.set(date, data);
    await member.save();

    res.json({ success: true, member });
  } catch (err) {
    console.error("Update member daily error:", err.message);
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
