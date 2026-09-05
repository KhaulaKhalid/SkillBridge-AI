// Judge0 CE via RapidAPI (free tier).
// Get your free API key at: https://rapidapi.com/judge0-official/api/judge0-ce
// Add JUDGE0_API_KEY=your_key to .env

const JUDGE0_HOST = "judge0-ce.p.rapidapi.com";
const JUDGE0_API_URL = `https://${JUDGE0_HOST}`;

function headers() {
  const h = {
    "Content-Type": "application/json",
    "X-RapidAPI-Host": JUDGE0_HOST,
  };
  if (process.env.JUDGE0_API_KEY) {
    h["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
  }
  return h;
}

// Status IDs from Judge0
const STATUS_MAP = {
  1: "In Queue",
  2: "Processing",
  3: "Accepted",
  4: "Wrong Answer",
  5: "Time Limit Exceeded",
  6: "Compilation Error",
  7: "Runtime Error (SIGSEGV)",
  8: "Runtime Error (SIGXFSZ)",
  9: "Runtime Error (SIGFPE)",
  10: "Runtime Error (SIGABRT)",
  11: "Runtime Error (NZEC)",
  12: "Runtime Error (Other)",
  13: "Internal Error",
  14: "Exec Format Error",
};

/**
 * Submits code to Judge0, waits for result, returns structured outcome.
 */
async function executeCode({ sourceCode, languageId, stdin, expectedOutput }) {
  if (!process.env.JUDGE0_API_KEY) {
    console.warn("JUDGE0_API_KEY not set in .env — code execution will fail.");
    return {
      success: false,
      status: "Configuration Error",
      statusId: -1,
      stdout: "",
      stderr: "JUDGE0_API_KEY not configured. Get a free key at: https://rapidapi.com/judge0-official/api/judge0-ce",
      compileOutput: "",
      time: null,
      memory: null,
    };
  }

  try {
    // 1. Create submission
    const body = {
      source_code: Buffer.from(sourceCode).toString("base64"),
      language_id: languageId,
      stdin: Buffer.from(stdin).toString("base64"),
      cpu_time_limit: 5,
      memory_limit: 128000,
    };
    if (expectedOutput) {
      body.expected_output = Buffer.from(expectedOutput).toString("base64");
    }

    const createRes = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
      {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      }
    );

    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Judge0 create failed (${createRes.status}): ${errText.slice(0, 200)}`);
    }

    const submission = await createRes.json();
    const token = submission.token;

    // 2. Poll for result (max 10 attempts, 1s apart)
    let result = null;
    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const pollRes = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
        { headers: headers() }
      );
      if (!pollRes.ok) continue;
      const data = await pollRes.json();

      if (data.status && data.status.id > 2) {
        result = data;
        break;
      }
    }

    if (!result) {
      return {
        success: false,
        status: "Timeout",
        statusId: 0,
        stdout: "",
        stderr: "Execution timed out after 10 seconds",
        compileOutput: "",
        time: null,
        memory: null,
      };
    }

    // 3. Decode base64 outputs
    const decode = (val) => (val ? Buffer.from(val, "base64").toString("utf-8").trim() : "");

    return {
      success: result.status.id === 3,
      status: STATUS_MAP[result.status.id] || "Unknown",
      statusId: result.status.id,
      stdout: decode(result.stdout),
      stderr: decode(result.stderr),
      compileOutput: decode(result.compile_output),
      time: result.time ? parseFloat(result.time) : null,
      memory: result.memory || null,
    };
  } catch (error) {
    console.error("Judge0 execution error:", error.message);
    return {
      success: false,
      status: "Service Error",
      statusId: -1,
      stdout: "",
      stderr: error.message,
      compileOutput: "",
      time: null,
      memory: null,
    };
  }
}

module.exports = { executeCode };