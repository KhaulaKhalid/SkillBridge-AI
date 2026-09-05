const express = require("express");
const JobPosting = require("../models/JobPosting");
const { protect, authorize } = require("../middleware/auth");
const { extractJobPostingFields } = require("../services/Jobextractionservice");

const router = express.Router();

// @route  POST /api/recruiter/job-postings
router.post("/job-postings", protect, authorize("recruiter"), async (req, res) => {
  try {
    const { title, description, location, employmentType } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const posting = await JobPosting.create({
      recruiter: req.user._id,
      title,
      rawDescription: description,
      location,
      employmentType,
    });

    try {
      const extracted = await extractJobPostingFields({ title, description, location });
      posting.category = extracted.category;
      posting.extractedSkills = extracted.extractedSkills;
      posting.seniorityLevel = extracted.seniorityLevel;
      posting.salaryRange = extracted.salaryRange;
      posting.extractionStatus = "done";
      await posting.save();
    } catch (extractionErr) {
      posting.extractionStatus = "failed";
      await posting.save();
      console.error("Job posting extraction failed:", extractionErr.message);
    }

    return res.status(201).json({ message: "Job posting created", posting });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong while creating the job posting" });
  }
});

// @route  GET /api/recruiter/job-postings
router.get("/job-postings", protect, authorize("recruiter"), async (req, res) => {
  const postings = await JobPosting.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ postings });
});

// @route  GET /api/recruiter/job-postings/:id
router.get("/job-postings/:id", protect, authorize("recruiter"), async (req, res) => {
  try {
    const posting = await JobPosting.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!posting) return res.status(404).json({ message: "Job posting not found" });
    res.json({ posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job posting" });
  }
});

// @route  PUT /api/recruiter/job-postings/:id
router.put("/job-postings/:id", protect, authorize("recruiter"), async (req, res) => {
  try {
    const posting = await JobPosting.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    const { title, description, location, employmentType } = req.body;
    if (title) posting.title = title;
    if (description) posting.rawDescription = description;
    if (location !== undefined) posting.location = location;
    if (employmentType) posting.employmentType = employmentType;

    // Re-extract if description changed
    if (description && description !== posting.rawDescription) {
      posting.extractionStatus = "pending";
    }

    await posting.save();

    if (posting.extractionStatus === "pending") {
      try {
        const extracted = await extractJobPostingFields({
          title: posting.title,
          description: posting.rawDescription,
          location: posting.location,
        });
        posting.category = extracted.category;
        posting.extractedSkills = extracted.extractedSkills;
        posting.seniorityLevel = extracted.seniorityLevel;
        posting.salaryRange = extracted.salaryRange;
        posting.extractionStatus = "done";
        await posting.save();
      } catch (e) {
        posting.extractionStatus = "failed";
        await posting.save();
      }
    }

    res.json({ message: "Job posting updated", posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to update job posting" });
  }
});

// @route  PATCH /api/recruiter/job-postings/:id/status
router.patch("/job-postings/:id/status", protect, authorize("recruiter"), async (req, res) => {
  try {
    const posting = await JobPosting.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!posting) return res.status(404).json({ message: "Job posting not found" });

    const { status } = req.body;
    if (!["active", "closed"].includes(status)) {
      return res.status(400).json({ message: "Status must be active or closed" });
    }
    posting.status = status;
    await posting.save();
    res.json({ message: `Posting ${status === "closed" ? "closed" : "reopened"}`, posting });
  } catch (error) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// @route  DELETE /api/recruiter/job-postings/:id
router.delete("/job-postings/:id", protect, authorize("recruiter"), async (req, res) => {
  try {
    const posting = await JobPosting.findOneAndDelete({ _id: req.params.id, recruiter: req.user._id });
    if (!posting) return res.status(404).json({ message: "Job posting not found" });
    res.json({ message: "Job posting deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete job posting" });
  }
});

module.exports = router;
