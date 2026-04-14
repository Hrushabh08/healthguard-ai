const mongoose = require("mongoose");

const healthLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
    },
    vitals: {
      heartRate: { type: String, default: "" },
      bpSys: { type: String, default: "" },
      bpDia: { type: String, default: "" },
      temperature: { type: String, default: "" },
      spo2: { type: String, default: "" },
    },
    lifestyle: {
      sleep: { type: Number, default: 7 },
      stress: { type: Number, default: 4 },
      steps: { type: String, default: "" },
      waterIntake: { type: Number, default: 2.0 },
      breakfast: { type: Boolean, default: false },
      lunch: { type: Boolean, default: false },
      dinner: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false },
      alcohol: { type: Boolean, default: false },
    },
    notes: {
      mood: { type: String, default: "neutral" },
      medicines: { type: String, default: "" },
      symptoms: { type: [String], default: [] },
      bloodSugar: { type: String, default: "" },
      caffeine: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// Compound index: one log per user per day
healthLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HealthLog", healthLogSchema);
