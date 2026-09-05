const express = require("express");
const JobPosting = require("../models/JobPosting");
const JobReadinessResult = require("../models/JobReadinessResult");
const UserProfile = require("../models/UserProfile");
const { protect, authorize } = require("../middleware/auth");
const { searchCandidates } = require("../services/CandidateMatchService");

const router = express.Router();

// @route  GET /api/recruiter/dashboard-stats
router.get("/dashboard-stats", protect, authorize("recruiter"), async (req, res) => {
  try {
    const totalPostings = await JobPosting.countDocuments({ recruiter: req.user._id });
    const activePostings = await JobPosting.countDocuments({ recruiter: req.user._id, status: "active" });
    const closedPostings = await JobPosting.countDocuments({ recruiter: req.user._id, status: "closed" });
    const totalProfiles = await UserProfile.countDocuments({});
    const recentPostings = await JobPosting.find({ recruiter: req.user._id })
      .sort({ createdAt: -1 }).limit(5).lean();

    res.json({ totalPostings, activePostings, closedPostings, totalProfiles, recentPostings });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
});

// @route  GET /api/recruiter/candidates
router.get("/candidates", protect, authorize("recruiter"), async (req, res) => {
  try {
    const { category, jobId } = req.query;

    let requiredSkills = [];
    let searchCategory = category || "";

    // If a jobId is provided, use its extracted skills + category
    if (jobId) {
      const posting = await JobPosting.findById(jobId);
      if (posting) {
        requiredSkills = posting.extractedSkills || [];
        searchCategory = posting.category;
      }
    }

    if (!searchCategory && !jobId) {
      return res.status(400).json({ message: "Provide a category or jobId to search candidates" });
    }

    const candidates = await searchCandidates({
      category: searchCategory,
      requiredSkills,
      limit: 30,
    });

    res.json({ candidates, category: searchCategory, requiredSkills });
  } catch (error) {
    console.error("Candidate search error:", error.message);
    res.status(500).json({ message: "Candidate search failed" });
  }
});

// @route  GET /api/recruiter/candidates/:userId
router.get("/candidates/:userId", protect, authorize("recruiter"), async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.params.userId }).lean();
    if (!profile) return res.status(404).json({ message: "Candidate not found" });

    const readinessResults = await JobReadinessResult.find({ user: req.params.userId }).lean();

    res.json({ profile, readinessResults });
  } catch (error) {
    console.error("Candidate detail error:", error.message);
    res.status(500).json({ message: "Failed to load candidate details" });
  }
});

module.exports = router;
