const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    quizScore: { type: Number, default: 0 },
    codingChallenge: {
      passed: { type: Boolean, default: false },
      language: { type: String, default: "" },
      executionTime: { type: Number, default: null },
      status: { type: String, default: "" },
    },
    verificationScore: { type: Number, default: 0 },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedIndex: { type: Number },
        isCorrect: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
