const express = require("express");
const UserProfile = require("../models/UserProfile");
const JobPosting = require("../models/JobPosting");
const JobReadinessResult = require("../models/JobReadinessResult");
const QuizAttempt = require("../models/QuizAttempt");
const { protect, authorize } = require("../middleware/auth");
const { computeMatchScore } = require("../services/CandidateMatchService");

const router = express.Router();

// @route  GET /api/student/job-matches
// @desc   Return all active job postings ranked by match score for the logged-in student
router.get("/job-matches", protect, authorize("student"), async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get student profile
    const profile = await UserProfile.findOne({ user: userId }).lean();
    if (!profile) {
      return res.status(404).json({ message: "Complete your profile to see job matches" });
    }

    // 2. Get all active job postings
    const postings = await JobPosting.find({
      status: "active",
      extractionStatus: "done",
    })
      .sort({ createdAt: -1 })
      .populate("recruiter", "name company")
      .lean();

    if (postings.length === 0) {
      return res.json({ jobs: [], message: "No active job postings yet. Check back soon!" });
    }

    // 3. Get student's readiness results (all categories)
    const readinessResults = await JobReadinessResult.find({ user: userId }).lean();
    const readinessMap = {};
    for (const r of readinessResults) {
      readinessMap[r.category] = r;
    }

    // 4. Get student's best quiz verification scores (all categories)
    const quizAttempts = await QuizAttempt.find({ user: userId })
      .sort({ verificationScore: -1 })
      .lean();
    const verificationMap = {};
    for (const v of quizAttempts) {
      if (!verificationMap[v.category] || v.verificationScore > verificationMap[v.category].verificationScore) {
        verificationMap[v.category] = v;
      }
    }

    // 5. Score each job posting against the student
    const jobs = postings.map((posting) => {
      const readiness = readinessMap[posting.category] || null;
      const verification = verificationMap[posting.category] || null;

      const match = computeMatchScore({
        requiredSkills: posting.extractedSkills || [],
        category: posting.category,
        profile,
        readiness,
        bestVerification: verification,
      });

      return {
        _id: posting._id,
        title: posting.title,
        category: posting.category,
        location: posting.location || "",
        employmentType: posting.employmentType || "Full-time",
        seniorityLevel: posting.seniorityLevel || "Unspecified",
        salaryRange: posting.salaryRange || {},
        extractedSkills: posting.extractedSkills || [],
        recruiter: posting.recruiter
          ? { name: posting.recruiter.name || "", company: posting.recruiter.company || "" }
          : { name: "", company: "" },
        postedAt: posting.createdAt,
        match,
      };
    });

    // 6. Sort by match score descending
    jobs.sort((a, b) => b.match.totalScore - a.match.totalScore);

    // 7. Summary stats
    const highMatch = jobs.filter((j) => j.match.totalScore >= 70).length;
    const mediumMatch = jobs.filter((j) => j.match.totalScore >= 40 && j.match.totalScore < 70).length;
    const lowMatch = jobs.filter((j) => j.match.totalScore < 40).length;

    return res.json({
      jobs,
      summary: {
        total: jobs.length,
        highMatch,
        mediumMatch,
        lowMatch,
      },
      profileSkills: profile.skills || [],
    });
  } catch (error) {
    console.error("Job matches error:", error.message);
    return res.status(500).json({ message: "Failed to load job matches" });
  }
});

module.exports = router;
