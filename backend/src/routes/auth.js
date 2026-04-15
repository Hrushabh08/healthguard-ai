const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const FamilyMember = require("../models/FamilyMember");
const HealthLog = require("../models/HealthLog");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

/**
 * Migrate FamilyMember data → User account
 * Safe to call on both register and login.
 * - Copies profile metrics only if user profile is still empty.
 * - Copies daily logs using $setOnInsert so existing logs are never overwritten.
 */
async function migrateFromFamilyMember(email, userId) {
  try {
    // Find ALL FamilyMember records with this email across any family
    const matchedMembers = await FamilyMember.find({
      email: email.toLowerCase().trim(),
    });

    if (!matchedMembers.length) return;

    const user = await User.findById(userId);
    const profileIsEmpty = !user?.profile?.weight || user.profile.weight === 0;

    for (const matchedMember of matchedMembers) {
      // Prevent migrating a member's data to the user who created that member
      if (String(matchedMember.userId) === String(userId)) {
        continue;
      }

      // 1. Copy profile metrics only if user profile not yet filled
      if (profileIsEmpty) {
        const profileUpdate = {};
        if (matchedMember.dob)    profileUpdate["profile.dob"]    = matchedMember.dob;
        if (matchedMember.weight) profileUpdate["profile.weight"] = matchedMember.weight;
        if (matchedMember.height) profileUpdate["profile.height"] = matchedMember.height;
        if (matchedMember.weight && matchedMember.height) {
          profileUpdate["profile.bmi"] = (
            matchedMember.weight / (matchedMember.height / 100) ** 2
          ).toFixed(1);
        }
        if (Object.keys(profileUpdate).length) {
          profileUpdate["profile.lastUpdated"] = new Date();
          await User.findByIdAndUpdate(userId, { $set: profileUpdate });
        }
      }

      // 2. Migrate each daily log entry ($setOnInsert = never overwrite user's own logs)
      const dailyKeys = matchedMember.dailyLogs ? Array.from(matchedMember.dailyLogs.keys()) : [];
      if (dailyKeys.length > 0) {
        const logPromises = [];
        dailyKeys.forEach(date => {
          const logData = matchedMember.dailyLogs.get(date);
          logPromises.push(
            HealthLog.findOneAndUpdate(
              { userId, date },
              {
                $setOnInsert: {
                  userId,
                  date,
                  lifestyle: {
                    sleep:       logData.sleep       ?? 7,
                    stress:      logData.stress      ?? 4,
                    steps:       logData.steps       ?? "",
                    waterIntake: logData.waterIntake ?? 2.0,
                    breakfast:   logData.breakfast   ?? false,
                    lunch:       logData.lunch       ?? false,
                    dinner:      logData.dinner      ?? false,
                    smoking:     logData.smoking     ?? false,
                    alcohol:     logData.alcohol     ?? false,
                  },
                  vitals: logData.vitals || {},
                  notes: logData.notes || {},
                },
              },
              { upsert: true, new: true }
            )
          );
        });
        await Promise.all(logPromises);
        console.log(
          `✅ Migrated ${logPromises.length} logs for ${email} (member: ${matchedMember.name}) → User ${userId}`
        );
      }
    }
  } catch (err) {
    // Non-fatal — don't block auth
    console.error("Family member migration error:", err.message);
  }
}

// ──────────────────────────────────────────
// POST /api/auth/register
// ──────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Create user (password hashed by pre-save hook)
    const user = await User.create({ name, email, password });

    // ── Data Migration: copy FamilyMember data if email matches ──────────────
    await migrateFromFamilyMember(email, user._id);
    // ─────────────────────────────────────────────────────────────────────────

    // Generate token
    const token = generateToken(user);

    // Fetch updated user (in case profile was populated)
    const updatedUser = await User.findById(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
      },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// POST /api/auth/login
// ──────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user (explicitly select password since it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate token
    const token = generateToken(user);

    // ── Data Migration on login ──────────────────────────────────────────────
    // Await this to ensure data is ported before frontend fetches Dashboard logs
    try {
      await migrateFromFamilyMember(user.email, user._id);
    } catch (e) {
      console.error("Login migration error:", e.message);
    }

    // Fetch updated profile in case migration just populated it
    const updatedUser = await User.findById(user._id);

    res.json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profile: updatedUser.profile,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// GET /api/auth/me — Get current user (protected)
// ──────────────────────────────────────────
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Me error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────
// PUT /api/auth/profile — Update profile (protected)
// ──────────────────────────────────────────
router.put("/profile", auth, async (req, res) => {
  try {
    const { dob, weight, height } = req.body;

    const updateData = {};
    if (dob !== undefined) updateData["profile.dob"] = dob;
    if (weight !== undefined) updateData["profile.weight"] = weight;
    if (height !== undefined) updateData["profile.height"] = height;
    if (weight && height) {
      updateData["profile.bmi"] = (weight / (height / 100) ** 2).toFixed(1);
    }
    updateData["profile.lastUpdated"] = new Date();

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      message: "Profile updated.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
