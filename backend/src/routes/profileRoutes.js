const express = require("express");
const UserProfile = require("../models/UserProfile");
const { protect, authorize } = require("../middleware/auth");
const uploadResume = require("../middleware/upload");
const { extractResumeText } = require("../services/Resumetextservice");

const router = express.Router();

const studentProfileShape = (user, profile) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  headline: profile?.headline || "",
  bio: profile?.bio || "",
  skills: profile?.skills || [],
  softSkills: profile?.softSkills || [],
  interests: profile?.interests || [],
  goals: profile?.goals || {},
  education: profile?.education || [],
  githubUsername: profile?.githubUsername || "",
  resumeUrl: profile?.resumeUrl || "",
});

// @route  GET /api/student/profile
router.get("/profile", protect, authorize("student"), async (req, res) => {
  const profile = await UserProfile.findOne({ user: req.user._id });
  res.status(200).json({ profile: studentProfileShape(req.user, profile) });
});

// @route  PUT /api/student/profile
router.put("/profile", protect, authorize("student"), async (req, res) => {
  try {
    const { headline, bio, skills, softSkills, interests, goals, education, githubUsername } = req.body;

    const updates = {};
    if (headline !== undefined) updates.headline = headline;
    if (bio !== undefined) updates.bio = bio;
    if (Array.isArray(skills)) updates.skills = skills;
    if (Array.isArray(softSkills)) updates.softSkills = softSkills;
    if (Array.isArray(interests)) updates.interests = interests;
    if (goals !== undefined && typeof goals === "object") {
      updates.goals = {
        targetRole: goals.targetRole || "",
        salaryRange: goals.salaryRange || "",
        growthPreference: goals.growthPreference || "",
        timeline: goals.timeline || "",
      };
    }
    if (Array.isArray(education)) updates.education = education;
    if (githubUsername !== undefined) updates.githubUsername = githubUsername.trim();

    // upsert: agar profile document exist nahi karta to naya bana dega
    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      profile: studentProfileShape(req.user, profile),
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while updating your profile" });
  }
});

// @route  POST /api/student/profile/resume
router.post(
  "/profile/resume",
  protect,
  authorize("student"),
  (req, res, next) => {
    uploadResume.single("resume")(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file was uploaded" });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    // Extract text right after upload so Job Readiness Analysis never has
    // to re-parse the PDF later — non-fatal if it fails, file is still saved
    let resumeText = "";
    try {
      resumeText = await extractResumeText(req.file.path);
    } catch (err) {
      console.error("Resume text extraction failed:", err.message);
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: { resumeUrl, resumeText } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Resume uploaded successfully",
      profile: studentProfileShape(req.user, profile),
    });
  }
);

module.exports = router;