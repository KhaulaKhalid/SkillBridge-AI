const express = require("express");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const JobPosting = require("../models/JobPosting");
const QuizAttempt = require("../models/QuizAttempt");
const JobReadinessResult = require("../models/JobReadinessResult");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// @route  GET /api/admin/stats
// @desc   Platform-wide statistics for the admin dashboard
router.get("/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const [totalStudents, totalRecruiters, totalAdmins, totalProfiles, totalPostings, activePostings, totalQuizAttempts, totalReadiness] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "admin" }),
      UserProfile.countDocuments({}),
      JobPosting.countDocuments({}),
      JobPosting.countDocuments({ status: "active" }),
      QuizAttempt.countDocuments({}),
      JobReadinessResult.countDocuments({}),
    ]);

    // Category distribution
    const categoryStats = await JobPosting.aggregate([
      { $match: { extractionStatus: "done" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent registrations (last 10)
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 }).limit(10)
      .select("name email role company createdAt").lean();

    // Recent job postings (last 5)
    const recentPostings = await JobPosting.find({})
      .sort({ createdAt: -1 }).limit(5)
      .populate("recruiter", "name company")
      .lean();

    res.json({
      totalStudents, totalRecruiters, totalAdmins, totalProfiles,
      totalPostings, activePostings, totalQuizAttempts, totalReadiness,
      categoryStats, recentUsers, recentPostings,
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({ message: "Failed to load admin stats" });
  }
});

// @route  GET /api/admin/users
// @desc   List all users with optional role/search filters
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== "all") filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .select("name email role company createdAt")
      .lean();

    // Enrich with profile data for students
    const userIds = users.filter(u => u.role === "student").map(u => u._id);
    const profiles = await UserProfile.find({ user: { $in: userIds } })
      .select("user headline skills githubUsername").lean();
    const profileMap = {};
    for (const p of profiles) profileMap[p.user.toString()] = p;

    const enriched = users.map(u => ({
      ...u,
      profile: u.role === "student" ? (profileMap[u._id.toString()] || null) : null,
    }));

    res.json({ users: enriched });
  } catch (error) {
    console.error("Admin users error:", error.message);
    res.status(500).json({ message: "Failed to load users" });
  }
});

// @route  PATCH /api/admin/users/:id/role
// @desc   Change a user role
router.patch("/users/:id/role", protect, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "recruiter", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own role" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { returnDocument: "after" });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `Role updated to ${role}`, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role" });
  }
});

// @route  DELETE /api/admin/users/:id
// @desc   Delete a user and their profile data
router.delete("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    // Clean up related data
    await UserProfile.deleteMany({ user: req.params.id });
    await QuizAttempt.deleteMany({ user: req.params.id });
    await JobReadinessResult.deleteMany({ user: req.params.id });
    if (user.role === "recruiter") {
      await JobPosting.deleteMany({ recruiter: req.params.id });
    }
    res.json({ message: `User "${user.name}" and all related data deleted` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// @route  GET /api/admin/jobs
// @desc   List all job postings across all recruiters
router.get("/jobs", protect, authorize("admin"), async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.category = category;

    const postings = await JobPosting.find(filter)
      .sort({ createdAt: -1 })
      .populate("recruiter", "name email company")
      .lean();

    res.json({ postings });
  } catch (error) {
    res.status(500).json({ message: "Failed to load job postings" });
  }
});

// @route  PATCH /api/admin/jobs/:id/status
// @desc   Force-close or reopen a job posting
router.patch("/jobs/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "closed"].includes(status)) {
      return res.status(400).json({ message: "Status must be active or closed" });
    }
    const posting = await JobPosting.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
    if (!posting) return res.status(404).json({ message: "Job posting not found" });
    res.json({ message: `Posting ${status}`, posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to update posting status" });
  }
});

// @route  DELETE /api/admin/jobs/:id
// @desc   Delete a job posting
router.delete("/jobs/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const posting = await JobPosting.findByIdAndDelete(req.params.id);
    if (!posting) return res.status(404).json({ message: "Job posting not found" });
    res.json({ message: "Job posting deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete posting" });
  }
});

module.exports = router;