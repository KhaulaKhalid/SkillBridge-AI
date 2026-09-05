const { generateJSON } = require("./GeminiService");
const { fetchGithubRepos } = require("./Githubservice");
const JobPosting = require("../models/JobPosting");
const QuizAttempt = require("../models/QuizAttempt");
const { CAREER_CATEGORIES } = require("../categories/careercategories");

async function getRequiredSkillsForCategory(category) {
  const postings = await JobPosting.find({
    category,
    status: "active",
    extractionStatus: "done",
  }).lean();

  const frequency = {};
  for (const posting of postings) {
    for (const skill of posting.extractedSkills || []) {
      const key = skill.trim();
      frequency[key] = (frequency[key] || 0) + 1;
    }
  }

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill]) => skill);
}

function formatGithubSummary(repos) {
  if (!repos.length) {
    return "No public GitHub repositories found or GitHub username not provided.";
  }

  return repos
    .map((r) => {
      const parts = [`- ${r.name} (primary language: ${r.language})${r.description ? ` — ${r.description}` : ""}`];

      if (r.dependencyFile) {
        parts.push(`  Dependency manifest (${r.dependencyFile.path} — real tech stack, not just claims):\n  """\n  ${r.dependencyFile.content.replace(/\n/g, "\n  ")}\n  """`);
      }
      if (r.entryFile) {
        parts.push(`  Entry file (${r.entryFile.path} — real code, not just description):\n  """\n  ${r.entryFile.content.replace(/\n/g, "\n  ")}\n  """`);
      }
      if (r.readme) {
        parts.push(`  README excerpt:\n  """\n  ${r.readme.replace(/\n/g, "\n  ")}\n  """`);
      }
      if (!r.dependencyFile && !r.entryFile && !r.readme) {
        parts.push("  (no deeper content fetched for this repo)");
      }

      return parts.join("\n");
    })
    .join("\n\n");
}

function buildEvidenceTrail(repos) {
  return repos
    .filter((r) => r.readme || r.dependencyFile || r.entryFile)
    .map((r) => ({
      repo: r.name,
      language: r.language || "Unknown",
      stars: r.stargazersCount || 0,
      filesChecked: [
        r.dependencyFile?.path,
        r.entryFile?.path,
        r.readme ? "README" : null,
      ].filter(Boolean),
    }));
}

/**
 * Fetch the best quiz attempt for a given user + category.
 * Returns null if no attempt exists.
 */
async function getBestQuizAttempt(userId, category) {
  const attempt = await QuizAttempt.findOne({ user: userId, category })
    .sort({ verificationScore: -1 })
    .lean();
  return attempt;
}

/**
 * Calculate the unified Job-Ready Score from all three signals.
 * Weights: resume+GitHub evidence 35%, quiz verification 35%, market alignment 30%.
 */
function calculateJobReadyScore({ scoreBreakdown, quizScore }) {
  const resumeGithub = Math.round(
    ((scoreBreakdown.resumeStrength || 0) + (scoreBreakdown.githubEvidence || 0)) / 2
  );
  const quizVerification = quizScore || 0;
  const marketAlignment = scoreBreakdown.marketAlignment || 0;

  const jobReadyScore = Math.round(
    resumeGithub * 0.35 +
    quizVerification * 0.35 +
    marketAlignment * 0.30
  );

  return {
    jobReadyScore: Math.max(0, Math.min(100, jobReadyScore)),
    jobReadyBreakdown: {
      resumeGithub,
      quizVerification,
      marketAlignment,
    },
  };
}

/**
 * Generate a milestone-based roadmap with course suggestions from missing skills.
 * Returns an empty array if no missing skills or if AI fails.
 */
async function generateRoadmap({ missingSkills, category, matchedSkills, experienceLevel }) {
  if (!missingSkills || missingSkills.length === 0) {
    return [];
  }

  const prompt = `
You are a career coach for students in Pakistan. Generate a milestone-based learning roadmap to help a student close their skill gaps for "${category}" roles.

Current verified/matched skills: ${(matchedSkills || []).join(", ") || "None"}
Missing skills (market-required but candidate lacks): ${missingSkills.join(", ")}
Estimated experience level: ${experienceLevel || "Beginner"}

Rules:
- Create exactly 3 milestones ordered from foundational to advanced.
- Each milestone should group 1-3 related missing skills together.
- For each milestone, suggest 2 specific, real courses or learning resources.
- Course platforms should be accessible in Pakistan (Coursera, freeCodeCamp, YouTube channels like Traversy Media, The Net Ninja, udemy, etc.).
- Provide realistic estimated hours for each course.
- Provide realistic estimated weeks to complete each milestone (assuming part-time study, ~10 hrs/week).
- Each milestone title should be action-oriented (e.g. "Master React Fundamentals").
- Keep descriptions concise (1 sentence per milestone).

Respond with ONLY valid JSON in exactly this shape:
{
  "roadmap": [
    {
      "milestone": "string — short action-oriented title",
      "description": "string — 1 sentence describing what this milestone achieves",
      "targetSkills": ["skill1", "skill2"],
      "courses": [
        {
          "title": "string — course name",
          "platform": "string — e.g. Coursera, freeCodeCamp, YouTube",
          "url": "string — real URL to the course if known, otherwise empty string",
          "estimatedHours": number
        }
      ],
      "estimatedWeeks": number
    }
  ]
}
`.trim();

  try {
    const result = await generateJSON(prompt);
    if (Array.isArray(result.roadmap)) {
      return result.roadmap
        .filter((m) => m.milestone)
        .map((m) => ({
          milestone: m.milestone,
          description: m.description || "",
          targetSkills: Array.isArray(m.targetSkills) ? m.targetSkills : [],
          courses: Array.isArray(m.courses)
            ? m.courses.slice(0, 3).map((c) => ({
                title: c.title || "Untitled",
                platform: c.platform || "",
                url: c.url || "",
                estimatedHours: typeof c.estimatedHours === "number" ? c.estimatedHours : 0,
              }))
            : [],
          estimatedWeeks: typeof m.estimatedWeeks === "number" ? m.estimatedWeeks : 2,
        }));
    }
    return [];
  } catch {
    return [];
  }
}

async function analyzeJobReadiness({ profile, category, userId }) {
  if (!CAREER_CATEGORIES.includes(category)) {
    throw new Error("Invalid career category");
  }

  // ── 1. Fetch market requirements + GitHub evidence in parallel ──
  const [requiredSkills, githubResult, quizAttempt] = await Promise.all([
    getRequiredSkillsForCategory(category),
    fetchGithubRepos(profile.githubUsername),
    getBestQuizAttempt(userId, category),
  ]);

  const { repos, error: githubError } = githubResult;
  const githubSummary = formatGithubSummary(repos);
  const evidenceTrail = buildEvidenceTrail(repos);

  // ── 2. Quiz signal ──
  const quizScore = quizAttempt?.verificationScore || 0;
  const codingPassed = Boolean(quizAttempt?.codingChallenge?.passed);
  const quizAttemptId = quizAttempt?._id || null;
  const hasQuizEvidence = Boolean(quizAttempt);

  // ── 3. AI analysis (resume + GitHub + market) ──
  const prompt = `
You are a senior technical recruiter assessing a candidate's real job readiness for "${category}" roles in Pakistan.
Compare their CLAIMED skills against ACTUAL EVIDENCE (resume text + GitHub public repos) and against what the market actually requires (from real job postings).

Claimed technical skills: ${(profile.skills || []).join(", ") || "None listed"}
Claimed soft skills: ${(profile.softSkills || []).join(", ") || "None listed"}
Resume text (may be empty if not uploaded):
"""
${profile.resumeText || "No resume uploaded."}
"""

GitHub public repositories (evidence of practical work)${githubError ? ` — note: ${githubError}` : ""}:
${githubSummary}

Skills most in-demand for "${category}" based on real, live job postings on this platform:
${requiredSkills.length ? requiredSkills.join(", ") : "No postings yet for this category — infer typical requirements for this role in the Pakistan market."}

Weigh evidence in this order, strongest first: (1) dependency manifest content, (2) entry file code snippet, (3) README excerpt, (4) bare repo description alone. A skill backed by a dependency file is much stronger evidence than a skill only mentioned in a resume.

Respond with ONLY a JSON object, no markdown, in exactly this shape:
{
  "jobReadinessScore": number 0-100 — overall readiness weighted toward EVIDENCE over CLAIMS,
  "matchedSkills": array of skills the candidate both claims AND shows evidence for,
  "missingSkills": array of skills required by the market that the candidate has neither claimed nor shown evidence for,
  "unverifiedClaims": array of skills the candidate CLAIMS but has NO resume or GitHub evidence for,
  "summary": string, 2-3 sentences, plain English, explaining the score and the biggest gap to close,
  "scoreBreakdown": {
    "resumeStrength": number 0-100 — how strong is the resume content for this role,
    "githubEvidence": number 0-100 — how much practical code evidence exists on GitHub,
    "marketAlignment": number 0-100 — how well the candidate's skills match what the market demands
  },
  "experienceLevel": one of "Beginner", "Intermediate", "Advanced", "Expert" — estimated from code quality and project complexity,
  "actionItems": array of 3-5 specific, actionable recommendations (each a short sentence) that would most improve their readiness score. Prioritize the highest-impact gaps first. E.g. "Build a React project using TypeScript to demonstrate frontend proficiency"
}
`.trim();

  const result = await generateJSON(prompt);

  const scoreBreakdown = result.scoreBreakdown || {};
  const experienceLevel = ["Beginner", "Intermediate", "Advanced", "Expert"].includes(result.experienceLevel)
    ? result.experienceLevel : "Unspecified";
  const missingSkills = Array.isArray(result.missingSkills) ? result.missingSkills : [];
  const matchedSkills = Array.isArray(result.matchedSkills) ? result.matchedSkills : [];

  // ── 4. Calculate unified Job-Ready Score (all 3 signals) ──
  const { jobReadyScore, jobReadyBreakdown } = calculateJobReadyScore({
    scoreBreakdown,
    quizScore,
  });

  // ── 5. Generate milestone-based roadmap from missing skills ──
  const roadmap = await generateRoadmap({
    missingSkills,
    category,
    matchedSkills,
    experienceLevel,
  });

  return {
    category,
    jobReadinessScore: typeof result.jobReadinessScore === "number" ? result.jobReadinessScore : 0,
    matchedSkills,
    missingSkills,
    unverifiedClaims: Array.isArray(result.unverifiedClaims) ? result.unverifiedClaims : [],
    summary: result.summary || "",
    scoreBreakdown: {
      resumeStrength: typeof scoreBreakdown.resumeStrength === "number" ? scoreBreakdown.resumeStrength : 0,
      githubEvidence: typeof scoreBreakdown.githubEvidence === "number" ? scoreBreakdown.githubEvidence : 0,
      marketAlignment: typeof scoreBreakdown.marketAlignment === "number" ? scoreBreakdown.marketAlignment : 0,
    },
    experienceLevel,
    actionItems: Array.isArray(result.actionItems) ? result.actionItems.slice(0, 5) : [],
    githubReposAnalyzed: repos.length,
    githubError,
    evidenceTrail,

    // Quiz signal
    quizScore,
    quizAttemptId,
    codingPassed,
    hasQuizEvidence,

    // Unified score
    jobReadyScore,
    jobReadyBreakdown,

    // Roadmap
    roadmap,
  };
}

module.exports = { analyzeJobReadiness };
