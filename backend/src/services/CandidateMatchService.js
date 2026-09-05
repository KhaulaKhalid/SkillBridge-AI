const UserProfile = require("../models/UserProfile");
const JobReadinessResult = require("../models/JobReadinessResult");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");

/**
 * Compute match score between a job posting and a student profile.
 * Weights: skills overlap 40% + job readiness 30% + verification 20% + experience 10%
 */
function computeMatchScore({ requiredSkills, category, profile, readiness, bestVerification }) {
  // --- Skill overlap (40%) ---
  const required = (requiredSkills || []).map((s) => s.toLowerCase().trim());
  const claimed = (profile.skills || []).map((s) => s.toLowerCase().trim());
  const softSkills = (profile.softSkills || []).map((s) => s.toLowerCase().trim());
  const allCandidateSkills = new Set([...claimed, ...softSkills]);

  let matchedSkills = [];
  let missingSkills = [];
  for (const skill of required) {
    if (allCandidateSkills.has(skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const skillOverlapScore = required.length > 0
    ? Math.round((matchedSkills.length / required.length) * 100)
    : 0;

  // --- Job readiness (30%) ---
  const readinessScore = readiness?.category === category
    ? readiness.jobReadinessScore || 0
    : 0;

  // --- Verification (20%) ---
  const verificationScore = bestVerification?.verificationScore || 0;

  // --- Experience level (10%) ---
  const expMap = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
  const experienceScore = expMap[readiness?.experienceLevel] || 0;

  const totalScore = Math.round(
    skillOverlapScore * 0.4 +
    readinessScore * 0.3 +
    verificationScore * 0.2 +
    experienceScore * 0.1
  );

  return {
    totalScore: Math.min(totalScore, 100),
    skillOverlapScore,
    readinessScore,
    verificationScore,
    experienceScore,
    matchedSkills: matchedSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    missingSkills: missingSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
  };
}

/**
 * Search candidates for a given job posting (or category + skills).
 * Returns ranked list of candidates with match details.
 */
async function searchCandidates({ category, requiredSkills, limit = 20 }) {
  // 1. Get all student profiles
  const profiles = await UserProfile.find({}).populate("user", "name email company").lean();

  if (profiles.length === 0) return [];

  // 2. Get job readiness results for this category
  const readinessResults = await JobReadinessResult.find({ category }).lean();
  const readinessMap = {};
  for (const r of readinessResults) {
    readinessMap[r.user.toString()] = r;
  }

  // 3. Get best verification scores per user for this category
  const verifications = await QuizAttempt.find({ category })
    .sort({ verificationScore: -1 })
    .lean();
  const verificationMap = {};
  for (const v of verifications) {
    const uid = v.user.toString();
    if (!verificationMap[uid] || v.verificationScore > verificationMap[uid].verificationScore) {
      verificationMap[uid] = v;
    }
  }

  // 4. Score each candidate
  const candidates = [];
  for (const profile of profiles) {
    if (!profile.user) continue;
    const userId = profile.user._id ? profile.user._id.toString() : profile.user.toString();
    const userName = profile.user._id ? profile.user.name : "";
    const userEmail = profile.user._id ? profile.user.email : "";

    const readiness = readinessMap[userId] || null;
    const verification = verificationMap[userId] || null;

    const match = computeMatchScore({
      requiredSkills,
      category,
      profile,
      readiness,
      bestVerification: verification,
    });

    candidates.push({
      userId,
      name: userName,
      email: userEmail,
      headline: profile.headline || "",
      skills: profile.skills || [],
      softSkills: profile.softSkills || [],
      education: profile.education || [],
      githubUsername: profile.githubUsername || "",
      match,
      readinessScore: readiness?.jobReadinessScore || 0,
      verificationScore: verification?.verificationScore || 0,
      experienceLevel: readiness?.experienceLevel || "Unspecified",
      hasCompletedReadiness: !!readiness,
      hasCompletedVerification: !!verification,
    });
  }

  // 5. Sort by total match score descending
  candidates.sort((a, b) => b.match.totalScore - a.match.totalScore);

  return candidates.slice(0, limit);
}

module.exports = { computeMatchScore, searchCandidates };
