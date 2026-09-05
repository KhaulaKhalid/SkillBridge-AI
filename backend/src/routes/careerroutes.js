const express = require("express");
const UserProfile = require("../models/UserProfile");
const QuizAttempt = require("../models/QuizAttempt");
const JobReadinessResult = require("../models/JobReadinessResult");
const { protect, authorize } = require("../middleware/auth");
const { buildMarketSnapshot } = require("../services/JobdataService");
const { generateJSON } = require("../services/GeminiService");

const router = express.Router();

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function clampScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
}

// Load all evidence for this student across every market category
async function buildEvidenceMap(userId) {
  const [quizAttempts, readinessResults] = await Promise.all([
    QuizAttempt.find({ user: userId }).sort({ verificationScore: -1 }).lean(),
    JobReadinessResult.find({ user: userId }).lean(),
  ]);

  const quizByCategory = {};
  for (const attempt of quizAttempts) {
    const cat = attempt.category;
    if (!quizByCategory[cat] || attempt.verificationScore > quizByCategory[cat].verificationScore) {
      quizByCategory[cat] = attempt;
    }
  }

  const readinessByCategory = {};
  for (const result of readinessResults) {
    readinessByCategory[result.category] = result;
  }

  return { quizByCategory, readinessByCategory };
}

// Build full evidence profile for one career category
function buildEvidenceForCategory(category, evidenceMap, profile) {
  const quiz = evidenceMap.quizByCategory[category];
  const readiness = evidenceMap.readinessByCategory[category];

  const quizScore = quiz?.verificationScore || 0;
  const quizPassed = quizScore >= 50;
  const codingPassed = Boolean(quiz?.codingChallenge?.passed);
  const readinessScore = readiness?.jobReadinessScore || 0;
  const scoreBreakdown = readiness?.scoreBreakdown || { resumeStrength: 0, githubEvidence: 0, marketAlignment: 0 };

  const githubLanguages = new Set();
  const githubRepos = readiness?.githubReposAnalyzed || 0;
  for (const entry of readiness?.evidenceTrail || []) {
    if (entry.language && entry.language !== "Unknown") githubLanguages.add(entry.language);
  }

  const unverifiedClaims = (readiness?.unverifiedClaims || []).map(normalize);
  const verifiedByReadiness = (readiness?.matchedSkills || []).map(normalize);

  const claimedSkills = [...(profile.skills || []), ...(profile.softSkills || [])].map(normalize);
  const hasQuiz = Boolean(quiz);
  const hasReadiness = Boolean(readiness);

  let evidenceLevel = "claim_only";
  const evidenceScore = quizScore * 0.4 + readinessScore * 0.4 + (codingPassed ? 20 : 0);
  if (hasQuiz && hasReadiness && evidenceScore >= 50) evidenceLevel = "verified";
  else if (hasQuiz || hasReadiness) evidenceLevel = "partial";

  const verifiedSkills = [];
  const claimOnlySkills = [];
  for (const skill of claimedSkills) {
    if (
      quizPassed ||
      codingPassed ||
      verifiedByReadiness.includes(skill) ||
      [...githubLanguages].some((lang) => normalize(lang).includes(skill) || skill.includes(normalize(lang)))
    ) {
      verifiedSkills.push(skill);
    } else if (!unverifiedClaims.includes(skill)) {
      verifiedSkills.push(skill);
    } else {
      claimOnlySkills.push(skill);
    }
  }

  return {
    quizScore,
    quizPassed,
    codingPassed,
    readinessScore,
    scoreBreakdown,
    githubLanguages: [...githubLanguages],
    githubRepos,
    unverifiedClaims: (readiness?.unverifiedClaims || []),
    evidenceLevel,
    evidenceScore: clampScore(evidenceScore),
    verifiedSkills,
    claimOnlySkills,
    hasQuiz,
    hasReadiness,
    experienceLevel: readiness?.experienceLevel || "Unspecified",
  };
}

// Evidence-weighted ranking: claimed 30% + verified 30% + readiness 25% + GitHub 15%
function buildEvidenceWeightedMatches(marketSnapshot, profile, evidenceMap) {
  const maxPostings = Math.max(...marketSnapshot.map((s) => s.postingCount), 1);

  return marketSnapshot
    .map((snapshot) => {
      const evidence = buildEvidenceForCategory(snapshot.category, evidenceMap, profile);
      const required = (snapshot.topSkills || []).map(normalize);
      const claimed = [...(profile.skills || []), ...(profile.softSkills || [])].map(normalize);
      const matchedClaimed = claimed.filter((s) => required.includes(s)).length;
      const claimedMatchScore = required.length ? (matchedClaimed / required.length) * 100 : 0;
      const verifiedMatchScore = required.length
        ? (evidence.verifiedSkills.filter((s) => required.includes(normalize(s))).length / required.length) * 100
        : 0;
      const readinessScore = evidence.readinessScore;

      const githubLangs = evidence.githubLanguages.map(normalize);
      const githubMatchScore = required.length
        ? (required.filter((s) => githubLangs.some((l) => l.includes(s) || s.includes(l))).length / required.length) * 100
        : 0;

      const fitScore = clampScore(
        claimedMatchScore * 0.3 +
        verifiedMatchScore * 0.3 +
        readinessScore * 0.25 +
        githubMatchScore * 0.15
      );

      const categoryText = normalize(snapshot.category);
      const interestText = (profile.interests || []).map(normalize).join(" ");
      const goalText = normalize(profile.goals?.targetRole);
      const interestBonus = interestText.includes(categoryText) || goalText.includes(categoryText);
      const marketScore = (snapshot.postingCount / maxPostings) * 10;

      let reasoning = "";
      if (evidence.evidenceLevel === "verified") {
        reasoning = `Strong verified evidence: quiz score ${evidence.quizScore}%, ${evidence.codingPassed ? "coding challenge passed" : "no coding challenge"}, and ${evidence.readinessScore}% job readiness. ${snapshot.postingCount} active Pakistan posting${snapshot.postingCount === 1 ? "" : "s"}.`;
      } else if (evidence.evidenceLevel === "partial") {
        const parts = [];
        if (evidence.hasQuiz) parts.push(`quiz score ${evidence.quizScore}%`);
        if (evidence.hasReadiness) parts.push(`readiness ${evidence.readinessScore}%`);
        reasoning = `Partial evidence (${parts.join(", ")}). ${evidence.claimOnlySkills.length > 0 ? "Skills like " + evidence.claimOnlySkills.slice(0, 2).join(", ") + " are claimed but not verified yet. " : ""}${snapshot.postingCount} active Pakistan posting${snapshot.postingCount === 1 ? "" : "s"}.`;
      } else {
        reasoning = `No verified evidence for this path. Skills are based on profile claims only. Complete skill verification and job readiness analysis to improve accuracy. ${snapshot.postingCount} active Pakistan posting${snapshot.postingCount === 1 ? "" : "s"}.`;
      }
      if (interestBonus) reasoning += " Matches your stated interest.";

      return {
        category: snapshot.category,
        fitScore,
        reasoning,
        demandLevel: snapshot.demandLevel,
        salaryRange: snapshot.salaryRange,
        postingCount: snapshot.postingCount,
        topSkills: snapshot.topSkills,
        evidenceLevel: evidence.evidenceLevel,
        evidenceScore: evidence.evidenceScore,
        quizScore: evidence.quizScore,
        quizPassed: evidence.quizPassed,
        codingPassed: evidence.codingPassed,
        readinessScore: evidence.readinessScore,
        githubLanguages: evidence.githubLanguages,
        githubRepos: evidence.githubRepos,
        unverifiedClaims: evidence.unverifiedClaims,
        verifiedSkills: evidence.verifiedSkills,
        claimOnlySkills: evidence.claimOnlySkills,
        hasQuiz: evidence.hasQuiz,
        hasReadiness: evidence.hasReadiness,
        experienceLevel: evidence.experienceLevel,
        scoreBreakdown: evidence.scoreBreakdown,
        interestBonus,
        marketScore: clampScore(marketScore),
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore || b.evidenceScore - a.evidenceScore || b.postingCount - a.postingCount)
    .slice(0, 5);
}

// @route  GET /api/student/career-match
// @desc   Evidence-weighted career ranking using quiz, readiness, GitHub + claims.
router.get("/career-match", protect, authorize("student"), async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id }).lean();
    if (!profile) {
      return res.status(404).json({ message: "Complete your profile before running a career match" });
    }

    const marketSnapshot = await buildMarketSnapshot();
    if (marketSnapshot.length === 0) {
      return res.status(200).json({
        matches: [],
        message: "No active Pakistan-focused job postings are available yet. Check back once recruiters post roles.",
        profileSignals: { skills: profile.skills || [], interests: profile.interests || [], targetRole: profile.goals?.targetRole || "" },
      });
    }

    const evidenceMap = await buildEvidenceMap(req.user._id);
    const matches = buildEvidenceWeightedMatches(marketSnapshot, profile, evidenceMap);

    // Ask AI for enhanced reasoning that respects our evidence levels
    let aiReasoning = {};
    try {
      const evidenceContext = matches.map((m) => ({
        category: m.category,
        evidenceLevel: m.evidenceLevel,
        quizScore: m.quizScore,
        readinessScore: m.readinessScore,
        verifiedSkills: m.verifiedSkills.slice(0, 5),
        claimOnlySkills: m.claimOnlySkills.slice(0, 3),
        githubLanguages: m.githubLanguages,
        postingCount: m.postingCount,
      }));

      const prompt = `
You are a career advisor for students in Pakistan. For each career category below, write a brief 1-2 sentence reasoning that honestly reflects the evidence level.

Student profile:
- Claimed skills: ${(profile.skills || []).join(", ") || "None"}
- Interests: ${(profile.interests || []).join(", ") || "None"}
- Target role: ${profile.goals?.targetRole || "Not specified"}

Evidence-based rankings with live market data:
${JSON.stringify(evidenceContext, null, 2)}

Rules:
- If evidenceLevel is "claim_only", clearly state that skills are unverified and suggest taking a quiz or readiness analysis.
- If "partial", mention what evidence exists and what is missing.
- If "verified", highlight the strong evidence.
- Reference the Pakistani market (posting count).

Respond with ONLY valid JSON:
{ "reasonings": { "CategoryName": "reasoning string", ... } }
`.trim();

      const aiResult = await generateJSON(prompt);
      if (aiResult.reasonings && typeof aiResult.reasonings === "object") {
        aiReasoning = aiResult.reasonings;
      }
    } catch (aiErr) {
      // AI reasoning is optional — fallback reasoning is already set
    }

    const finalMatches = matches.map((m) => ({
      ...m,
      reasoning: aiReasoning[m.category] || m.reasoning,
    }));

    return res.status(200).json({
      matches: finalMatches,
      source: "evidence-weighted",
      profileSignals: {
        skills: profile.skills || [],
        interests: profile.interests || [],
        targetRole: profile.goals?.targetRole || "",
        growthPreference: profile.goals?.growthPreference || "",
      },
      evidenceCoverage: {
        totalCategories: marketSnapshot.length,
        verified: matches.filter((m) => m.evidenceLevel === "verified").length,
        partial: matches.filter((m) => m.evidenceLevel === "partial").length,
        claimOnly: matches.filter((m) => m.evidenceLevel === "claim_only").length,
      },
      marketCategories: marketSnapshot.length,
    });
  } catch (error) {
    console.error("Career match failed:", error.message);
    return res.status(500).json({ message: "Career matching failed — please try again shortly" });
  }
});

module.exports = router;
