const mongoose = require("mongoose");
const { CAREER_CATEGORIES } = require("../categories/careercategories");
 
const jobPostingSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
 
    // Raw input, exactly as the recruiter typed it
    title: { type: String, required: true, trim: true, maxlength: 150 },
    rawDescription: { type: String, required: true, trim: true, maxlength: 5000 },
    location: { type: String, trim: true, maxlength: 100, default: "" },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Internship", "Remote", "Contract"],
      default: "Full-time",
    },
 
    // Gemini-extracted structured fields — filled in right after creation
    category: {
      type: String,
      enum: [...CAREER_CATEGORIES, "Uncategorized"],
      default: "Uncategorized",
    },
    extractedSkills: { type: [String], default: [] },
    seniorityLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Unspecified"],
      default: "Unspecified",
    },
    salaryRange: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
    },
 
    // Lets us stop counting a posting in market data once it's filled/closed,
    // without deleting the record (recruiters may want history later)
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
 
    extractionStatus: {
      type: String,
      enum: ["pending", "done", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("JobPosting", jobPostingSchema);
 