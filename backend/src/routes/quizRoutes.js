const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getQuestionsForCategory, isCodingCategory } = require("../services/quizBank");
const { getChallengeForCategory } = require("../services/codingChallenges");
const QuizAttempt = require("../models/QuizAttempt");

const router = express.Router();

// @route  GET /api/student/quiz/:category
// @desc   Get quiz questions for a career category
router.get("/quiz/:category", protect, authorize("student"), async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category);

    const questions = getQuestionsForCategory(decodedCategory, 5);
    if (questions.length === 0) {
      return res.status(404).json({ message: "No quiz available for this category" });
    }

    // Strip correctIndex from the response — don't send answers to the client!
    const safeQuestions = questions.map((q) => ({
      _id: q._id,
      skill: q.skill,
      question: q.question,
      options: q.options,
      type: q.type,
      difficulty: q.difficulty,
    }));

    res.json({
      category: decodedCategory,
      isCodingCategory: isCodingCategory(decodedCategory),
      questions: safeQuestions,
    });
  } catch (error) {
    console.error("Quiz fetch error:", error.message);
    res.status(500).json({ message: "Failed to load quiz questions" });
  }
});

// @route  GET /api/student/coding-challenge/:category
// @desc   Get coding challenge for a career category
router.get("/coding-challenge/:category", protect, authorize("student"), async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category);

    if (!isCodingCategory(decodedCategory)) {
      return res.status(400).json({ message: "No coding challenge for non-coding categories" });
    }

    const challenge = getChallengeForCategory(decodedCategory);
    if (!challenge) {
      return res.status(404).json({ message: "No coding challenge available for this category" });
    }

    // Send challenge without the solution!
    res.json({
      category: decodedCategory,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty,
      language: challenge.language,
      languageId: challenge.languageId,
      starterCode: challenge.starterCode,
      testCases: challenge.testCases.map((tc) => ({ input: tc.input })), // hide expected output
    });
  } catch (error) {
    console.error("Coding challenge fetch error:", error.message);
    res.status(500).json({ message: "Failed to load coding challenge" });
  }
});

// @route  POST /api/student/quiz/:category/submit
// @desc   Submit quiz answers and coding challenge result, calculate verification score
router.post("/quiz/:category/submit", protect, authorize("student"), async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category);
    const { answers, codingResult } = req.body;

    // answers: [{ questionId, selectedIndex }] — questionId is the seed ID string
    // codingResult: { passed, language, executionTime, status } or null

    const allQuestions = getQuestionsForCategory(decodedCategory, 5);
    if (allQuestions.length === 0) {
      return res.status(404).json({ message: "No quiz found for this category" });
    }

    // Grade quiz — match by questionId so order doesn't matter
    let correctCount = 0;
    const gradedAnswers = allQuestions.map((q) => {
      const userAnswer = answers?.find((a) => a.questionId === q._id);
      const isCorrect = userAnswer?.selectedIndex === q.correctIndex;
      if (isCorrect) correctCount++;
      return {
        questionId: q._id,
        selectedIndex: userAnswer?.selectedIndex ?? -1,
        isCorrect,
      };
    });

    const totalQuestions = allQuestions.length;
    const quizScore = Math.round((correctCount / totalQuestions) * 100);

    // Calculate verification score
    let verificationScore;
    const coding = codingResult || { passed: false, language: "", executionTime: null, status: "" };

    if (isCodingCategory(decodedCategory) && codingResult) {
      // Coding categories: quiz 60% + coding 40%
      const codingScore = coding.passed ? 100 : 0;
      verificationScore = Math.round(quizScore * 0.6 + codingScore * 0.4);
    } else {
      // Non-coding categories: quiz only
      verificationScore = quizScore;
    }

    // Save attempt
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      category: decodedCategory,
      correctCount,
      totalQuestions,
      quizScore,
      codingChallenge: {
        passed: coding.passed || false,
        language: coding.language || "",
        executionTime: coding.executionTime || null,
        status: coding.status || "",
      },
      verificationScore,
      answers: gradedAnswers,
    });

    res.json({
      attemptId: attempt._id,
      category: decodedCategory,
      correctCount,
      totalQuestions,
      quizScore,
      codingChallenge: attempt.codingChallenge,
      verificationScore,
      // Per-question results so the frontend can show right/wrong
      answers: gradedAnswers.map((a) => {
        const q = allQuestions.find((qq) => qq._id === a.questionId);
        return {
          question: q.question,
          skill: q.skill,
          selectedIndex: a.selectedIndex,
          correctIndex: q.correctIndex,
          isCorrect: a.isCorrect,
          correctAnswer: q.options[q.correctIndex],
        };
      }),
    });
  } catch (error) {
    console.error("Quiz submit error:", error.message);
    res.status(500).json({ message: "Failed to submit quiz results" });
  }
});

// @route  POST /api/student/coding-challenge/:category/submit
// @desc   Submit code to Judge0 for execution and return result
router.post("/coding-challenge/:category/submit", protect, authorize("student"), async (req, res) => {
  try {
    const { category } = req.params;
    const decodedCategory = decodeURIComponent(category);
    const { sourceCode } = req.body;

    if (!sourceCode?.trim()) {
      return res.status(400).json({ message: "Source code is required" });
    }

    if (!isCodingCategory(decodedCategory)) {
      return res.status(400).json({ message: "No coding challenge for this category" });
    }

    const challenge = getChallengeForCategory(decodedCategory);
    if (!challenge) {
      return res.status(404).json({ message: "No coding challenge found" });
    }

    const { executeCode } = require("../services/Judge0Service");

    // Run the first test case to validate
    const testCase = challenge.testCases[0];
    const result = await executeCode({
      sourceCode,
      languageId: challenge.languageId,
      stdin: testCase.input,
      expectedOutput: testCase.expectedOutput,
    });

    // If first test passes, run all remaining test cases
    let allPassed = result.success;
    const allResults = [result];

    if (result.success && challenge.testCases.length > 1) {
      for (let i = 1; i < challenge.testCases.length; i++) {
        const tc = challenge.testCases[i];
        const r = await executeCode({
          sourceCode,
          languageId: challenge.languageId,
          stdin: tc.input,
          expectedOutput: tc.expectedOutput,
        });
        allResults.push(r);
        if (!r.success) allPassed = false;
      }
    }

    res.json({
      passed: allPassed,
      language: challenge.language,
      executionTime: result.time,
      status: result.status,
      testResults: allResults.map((r, i) => ({
        testCase: i + 1,
        passed: r.success,
        status: r.status,
        stdout: r.stdout,
        stderr: r.stderr,
        compileOutput: r.compileOutput,
        time: r.time,
      })),
    });
  } catch (error) {
    console.error("Coding challenge submit error:", error.message);
    res.status(500).json({ message: "Code execution failed — please try again" });
  }
});

// @route  GET /api/student/quiz/history
// @desc   Get all quiz attempts for the logged-in student
router.get("/quiz/history", protect, authorize("student"), async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("category quizScore verificationScore codingChallenge createdAt")
      .lean();

    res.json({ attempts });
  } catch (error) {
    console.error("Quiz history fetch error:", error.message);
    res.status(500).json({ message: "Failed to load quiz history" });
  }
});

module.exports = router;
