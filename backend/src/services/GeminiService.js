const { GoogleGenerativeAI } = require("@google/generative-ai");

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set — Gemini calls will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = "gemini-3.6-flash";
const MAX_RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Sends a prompt to Gemini and returns parsed JSON.
 * Retries up to 3 times with exponential backoff on rate-limit (429).
 */
async function generateJSON(prompt) {
  let lastError = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 200)}`);
      }
    } catch (error) {
      lastError = error;
      const msg = error.message || "";
      const isQuota = msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests");

      if (isQuota && attempt < MAX_RETRIES - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.warn(`Gemini rate-limited — retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("Gemini quota exhausted. Try again after a few minutes.");
}

module.exports = { generateJSON };
