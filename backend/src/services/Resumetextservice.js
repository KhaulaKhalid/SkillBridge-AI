const fs = require("fs");
const { PDFParse } = require("pdf-parse"); // v2 API — named export, class-based

/**
 * Reads a PDF file from disk and returns its plain text content.
 * Called once at resume upload time — the result is stored on the
 * profile so Job Readiness Analysis never has to re-parse the PDF.
 *
 * Uses pdf-parse v2's API: new PDFParse({ data: buffer }) + getText().
 * (v1 used to export a plain function — that API no longer exists.)
 */
async function extractResumeText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  // Cap length — resumes are rarely more than a page or two, and this
  // keeps the Gemini prompt from ballooning if someone uploads a huge file
  return (result.text || "").trim().slice(0, 8000);
}

module.exports = { extractResumeText };