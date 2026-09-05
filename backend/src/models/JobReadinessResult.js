const mongoose = require("mongoose");

const jobReadinessResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    jobReadinessScore: { type: Number, default: 0 },
    matchedSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    unverifiedClaims: { type: [String], default: [] },
    summary: { type: String, default: "" },
    scoreBreakdown: {
      resumeStrength: { type: Number, default: 0 },
      githubEvidence: { type: Number, default: 0 },
      marketAlignment: { type: Number, default: 0 },
    },
    experienceLevel: { type: String, default: "Unspecified" },
    actionItems: { type: [String], default: [] },
    githubReposAnalyzed: { type: Number, default: 0 },
    githubError: { type: String, default: null },
    evidenceTrail: [
      {
        repo: { type: String },
        language: { type: String, default: "Unknown" },
        stars: { type: Number, default: 0 },
        filesChecked: { type: [String], default: [] },
      },
    ],

    // ── Quiz signal integration (pulled from QuizAttempt) ──
    quizScore: { type: Number, default: 0 },
    quizAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", default: null },
    codingPassed: { type: Boolean, default: false },

    // ── Unified Job-Ready Score (all 3 signals combined) ──
    jobReadyScore: { type: Number, default: 0 },
    jobReadyBreakdown: {
      resumeGithub: { type: Number, default: 0 },
      quizVerification: { type: Number, default: 0 },
      marketAlignment: { type: Number, default: 0 },
    },

    // ── Milestone-based roadmap (generated from missing skills) ──
    roadmap: [
      {
        milestone: { type: String, required: true },
        description: { type: String, default: "" },
        targetSkills: { type: [String], default: [] },
        courses: [
          {
            title: { type: String, required: true },
            platform: { type: String, default: "" },
            url: { type: String, default: "" },
            estimatedHours: { type: Number, default: 0 },
          },
        ],
        estimatedWeeks: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

jobReadinessResultSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("JobReadinessResult", jobReadinessResultSchema);
