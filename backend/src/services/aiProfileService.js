// Node 18+ has global fetch built in. If you're on an older Node version,
// install node-fetch and uncomment the next line:
// const fetch = require('node-fetch');

const LLM_API_URL = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

/**
 * Turns a student's raw profile inputs into a synthesized AI Career Profile:
 * normalized skills, inferred strengths/work-style traits, a plain-language
 * summary, and a few suggested focus areas. This output is what the rest of
 * the platform (Career Compass, Skill Gap Engine, Roadmap) builds on.
 */
async function generateAICareerProfile(rawProfile) {
  if (!LLM_API_KEY) {
    throw new Error('LLM_API_KEY is not set. Add it to your .env file.');
  }

  const prompt = buildPrompt(rawProfile);

  const response = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a career-profiling engine for a Pakistan-focused student career platform. ' +
            'You only output valid JSON, with no preamble, no markdown fences, and no commentary.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content ?? '';
  return parseModelJson(rawText);
}

function buildPrompt({ fullName, education, claimedSkills, interests, careerGoals, resumeText }) {
  return `
Build a career profile for a student on a Pakistan-focused career platform called SkillBridge AI.

STUDENT DATA:
Name: ${fullName || 'N/A'}
Education: ${JSON.stringify(education || [])}
Claimed skills: ${(claimedSkills || []).join(', ') || 'None provided'}
Interests: ${(interests || []).join(', ') || 'None provided'}
Career goals (in their own words): ${careerGoals || 'None provided'}
Resume text (may be partial or messy): """${(resumeText || '').slice(0, 4000)}"""

TASK:
Return ONLY a JSON object with this exact shape:
{
  "normalizedSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "workStyleTraits": ["trait1", "trait2"],
  "profileSummary": "2-3 sentence plain-language summary of who this student is and what they bring",
  "suggestedFocusAreas": ["area1", "area2"]
}

RULES:
- normalizedSkills: deduplicate and standardize skill names from claimedSkills and resumeText
  (e.g. "ReactJS" and "React.js" both become "React").
- strengths and workStyleTraits: infer only from what's actually stated — do not invent
  achievements or traits that aren't implied by the data.
- profileSummary: written for the student to read about themselves — encouraging but honest,
  no generic filler.
- suggestedFocusAreas: 2-4 broad directions (not full career titles) worth exploring next,
  based on the overlap between interests and skills.
- Output raw JSON only. No markdown code fences, no extra text before or after.
`.trim();
}

function parseModelJson(rawText) {
  const cleaned = rawText.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse LLM JSON output: ${err.message}\nRaw output: ${cleaned}`);
  }
}

module.exports = { generateAICareerProfile };