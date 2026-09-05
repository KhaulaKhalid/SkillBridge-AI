const JobPosting = require("../models/JobPosting");

// Thresholds for labeling demand — tune these once you have real data volume.
// For a hackathon demo with ~15-20 seed postings, 5+ active postings in a
// category is already a meaningful signal.
function demandLevelFor(postingCount) {
  if (postingCount >= 8) return "High";
  if (postingCount >= 3) return "Medium";
  if (postingCount >= 1) return "Low";
  return "None";
}

/**
 * Builds a live market snapshot from active job postings, grouped by category.
 * Called fresh on every Career Match request — no separate cache collection,
 * since posting volume is small enough that this aggregation is cheap.
 *
 * Returns an array like:
 * [
 *   {
 *     category: "Web Development",
 *     postingCount: 6,
 *     demandLevel: "Medium",
 *     topSkills: ["React", "Node.js", "MongoDB", ...],
 *     salaryRange: { min: 60000, max: 150000 }
 *   },
 *   ...
 * ]
 */
async function buildMarketSnapshot() {
  const postings = await JobPosting.find({
    status: "active",
    extractionStatus: "done",
  }).lean();

  const byCategory = {};

  for (const posting of postings) {
    const cat = posting.category;
    if (!byCategory[cat]) {
      byCategory[cat] = {
        category: cat,
        postingCount: 0,
        skillFrequency: {},
        salaryMins: [],
        salaryMaxes: [],
      };
    }

    const bucket = byCategory[cat];
    bucket.postingCount += 1;

    for (const skill of posting.extractedSkills || []) {
      const key = skill.trim().toLowerCase();
      bucket.skillFrequency[key] = (bucket.skillFrequency[key] || 0) + 1;
    }

    if (typeof posting.salaryRange?.min === "number") bucket.salaryMins.push(posting.salaryRange.min);
    if (typeof posting.salaryRange?.max === "number") bucket.salaryMaxes.push(posting.salaryRange.max);
  }

  return Object.values(byCategory).map((bucket) => ({
    category: bucket.category,
    postingCount: bucket.postingCount,
    demandLevel: demandLevelFor(bucket.postingCount),
    topSkills: Object.entries(bucket.skillFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill]) => skill),
    salaryRange: {
      min: bucket.salaryMins.length ? Math.min(...bucket.salaryMins) : null,
      max: bucket.salaryMaxes.length ? Math.max(...bucket.salaryMaxes) : null,
    },
  }));
}

module.exports = { buildMarketSnapshot };