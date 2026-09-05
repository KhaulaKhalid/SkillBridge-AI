const express = require("express");
const UserProfile = require("../models/UserProfile");
const JobReadinessResult = require("../models/JobReadinessResult");
const { protect, authorize } = require("../middleware/auth");
const { analyzeJobReadiness } = require("../services/Jobreadinessservice");

const router = express.Router();

router.post("/job-readiness", protect, authorize("student"), async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: "category is required" });
    }

    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Complete your profile before running this analysis" });
    }

    const result = await analyzeJobReadiness({
      profile,
      category,
      userId: req.user._id,
    });

    await JobReadinessResult.findOneAndUpdate(
      { user: req.user._id, category },
      {
        jobReadinessScore: result.jobReadinessScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        unverifiedClaims: result.unverifiedClaims,
        summary: result.summary,
        scoreBreakdown: result.scoreBreakdown || {},
        experienceLevel: result.experienceLevel || "Unspecified",
        actionItems: result.actionItems || [],
        githubReposAnalyzed: result.githubReposAnalyzed,
        githubError: result.githubError || null,
        evidenceTrail: result.evidenceTrail || [],

        // Quiz signal
        quizScore: result.quizScore || 0,
        quizAttemptId: result.quizAttemptId || null,
        codingPassed: result.codingPassed || false,

        // Unified score
        jobReadyScore: result.jobReadyScore || 0,
        jobReadyBreakdown: result.jobReadyBreakdown || {},

        // Roadmap
        roadmap: result.roadmap || [],
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Job readiness analysis failed:", error.message);
    console.error(error.stack);
    if (error.message === "Invalid career category") {
      return res.status(400).json({ message: "Invalid career category" });
    }
    return res.status(502).json({ message: `Job readiness analysis failed: ${error.message}` });
  }
});

router.get("/job-readiness/history", protect, authorize("student"), async (req, res) => {
  try {
    const results = await JobReadinessResult.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ results });
  } catch (error) {
    console.error("Job readiness history error:", error.message);
    res.status(500).json({ message: "Failed to load job readiness history" });
  }
});

router.get("/job-readiness/:category", protect, authorize("student"), async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category);
    const result = await JobReadinessResult.findOne({
      user: req.user._id,
      category: decodedCategory,
    }).lean();
    if (!result) {
      return res.status(404).json({ message: "No saved analysis found for this category" });
    }
    res.json(result);
  } catch (error) {
    console.error("Job readiness fetch error:", error.message);
    res.status(500).json({ message: "Failed to load saved analysis" });
  }
});

module.exports = router;
