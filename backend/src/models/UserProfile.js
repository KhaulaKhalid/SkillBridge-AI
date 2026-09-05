const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },
    headline: { type: String, trim: true, maxlength: 120, default: "" },
    bio: { type: String, trim: true, maxlength: 600, default: "" },
    skills: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    goals: {
      targetRole: { type: String, trim: true, maxlength: 120, default: "" },
      salaryRange: {
        type: String,
        enum: [
          "",
          "Below PKR 50,000",
          "PKR 50,000 - 100,000",
          "PKR 100,000 - 150,000",
          "PKR 150,000 - 250,000",
          "PKR 250,000+",
        ],
        default: "",
      },
      growthPreference: {
        type: String,
        enum: [
          "",
          "Fast-paced startup",
          "Stable corporate environment",
          "Remote / freelance flexibility",
          "Government / public sector",
          "Not sure yet",
        ],
        default: "",
      },
      timeline: {
        type: String,
        enum: [
          "",
          "Within 3 months",
          "3-6 months",
          "6-12 months",
          "After 1 year",
          "Just exploring options",
        ],
        default: "",
      },
    },
    education: {
      type: [
        {
          institute: { type: String, trim: true, maxlength: 150 },
          degree: { type: String, trim: true, maxlength: 150 },
          startYear: { type: Number },
          endYear: { type: Number },
        },
      ],
      default: [],
    },
   
    resumeUrl: { type: String, default: "" },
  
     // NEW: text extracted from the resume PDF at upload time — used by
    // Job Readiness Analysis instead of re-parsing the PDF every run
    resumeText: { type: String, default: "" },

    // NEW: used to pull public repos live from the GitHub API
    githubUsername: { type: String, trim: true, default: "" },
  
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
