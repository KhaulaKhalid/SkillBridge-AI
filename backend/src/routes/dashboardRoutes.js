const express = require("express");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Only logged-in students can reach this
router.get("/student/overview", protect, authorize("student"), (req, res) => {
  res.status(200).json({
    message: `Welcome back, ${req.user.name}`,
    role: req.user.role,
  });
});

// Only logged-in recruiters can reach this
router.get("/recruiter/overview", protect, authorize("recruiter"), (req, res) => {
  res.status(200).json({
    message: `Welcome back, ${req.user.name}`,
    role: req.user.role,
  });
});

module.exports = router;