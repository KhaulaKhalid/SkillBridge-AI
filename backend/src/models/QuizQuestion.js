const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, index: true },
    skill: { type: String, required: true },
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: [(arr) => arr.length === 4, "Each question must have exactly 4 options"],
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    type: {
      type: String,
      enum: ["theory", "coding-theory"],
      default: "theory",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizQuestion", quizQuestionSchema);
