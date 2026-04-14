const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    relation: { type: String, required: true },
    dob: { type: String, default: "" },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    dailyLogs: {
      type: Map,
      of: {
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
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FamilyMember", familyMemberSchema);
