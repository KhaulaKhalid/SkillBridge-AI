// Shared across: student profile interests, job posting extraction, career match engine.
// Keeping ONE list prevents mismatches like a student picking "AI/ML" while
// recruiters post under "Machine Learning" — the LLM extraction always maps
// into this exact set so aggregation and matching line up.

const CAREER_CATEGORIES = [
  "Web Development",
  "Mobile App Development",
  "Data Science",
  "AI / Machine Learning",
  "Cybersecurity",
  "Cloud / DevOps",
  "UI/UX Design",
  "Digital Marketing",
  "Game Development",
  "Business Analysis",
];

module.exports = { CAREER_CATEGORIES };