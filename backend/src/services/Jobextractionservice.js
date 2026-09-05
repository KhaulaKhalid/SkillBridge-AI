const { generateJSON } = require("./GeminiService");
const { CAREER_CATEGORIES } = require("../categories/careercategories");
 
/**
 * Takes a raw job posting (title + description) and returns structured
 * fields the Career Match Engine can aggregate later.
 * Runs right after a recruiter creates a posting — see routes/jobPostingRoutes.js.
 */
async function extractJobPostingFields({ title, description, location }) {
  const prompt = `
You are a job-posting parser for a Pakistan-focused career platform.
Extract structured data from the job posting below. Respond with ONLY a JSON object — no markdown, no explanation.
 
Job title: ${title}
Location: ${location || "Not specified"}
Job description:
"""
${description}
"""
 
Return JSON in exactly this shape:
{
  "category": one of ${JSON.stringify(CAREER_CATEGORIES)} — pick the single closest match, never invent a new category,
  "extractedSkills": array of 5-12 specific technical or tool skills mentioned or clearly implied (e.g. "React", "Figma", "SQL"). Do not include soft skills here.
  "seniorityLevel": one of "Entry", "Mid", "Senior" — infer from years of experience mentioned, job title, or responsibilities. Use "Entry" if nothing suggests otherwise.
  "salaryMinPKR": number or null — monthly salary in PKR if mentioned or reasonably inferable, else null. Do not guess wildly — null is fine.
  "salaryMaxPKR": number or null — same as above, upper bound.
}
`.trim();
 
  const result = await generateJSON(prompt);
 
  // Defensive normalization — never trust the model to be 100% schema-perfect
  return {
    category: CAREER_CATEGORIES.includes(result.category) ? result.category : "Uncategorized",
    extractedSkills: Array.isArray(result.extractedSkills) ? result.extractedSkills.slice(0, 12) : [],
    seniorityLevel: ["Entry", "Mid", "Senior"].includes(result.seniorityLevel)
      ? result.seniorityLevel
      : "Unspecified",
    salaryRange: {
      min: typeof result.salaryMinPKR === "number" ? result.salaryMinPKR : null,
      max: typeof result.salaryMaxPKR === "number" ? result.salaryMaxPKR : null,
    },
  };
}
 
module.exports = { extractJobPostingFields };
 