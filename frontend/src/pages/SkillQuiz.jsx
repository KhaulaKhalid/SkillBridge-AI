import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuSparkles,
  LuArrowLeft,
  LuArrowRight,
  LuCircleCheck,
  LuCircleX,
  LuCode,
  LuTrophy,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";
import { clearCache, CACHE_KEYS } from "../api/cache.js";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

export default function SkillQuiz() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category || "");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [isCoding, setIsCoding] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/student/quiz/${encodeURIComponent(decodedCategory)}`)
      .then((res) => {
        setQuestions(res.data.questions || []);
        setIsCoding(res.data.isCodingCategory || false);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to load quiz");
        navigate("/student/skill-verification");
      })
      .finally(() => setLoading(false));
  }, [category]);

  const selectAnswer = (index) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQ]: index }));
  };

  const goNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const goPrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const handleSubmit = async () => {
    // Check all questions answered
    const unanswered = questions.filter((_, i) => selectedAnswers[i] === undefined);
    if (unanswered.length > 0) {
      toast.warn(`Please answer all questions first (${unanswered.length} remaining)`);
      return;
    }

    setSubmitting(true);
    try {
      const answers = questions.map((q, i) => ({
        questionId: q._id,
        selectedIndex: selectedAnswers[i],
      }));

      const res = await api.post(
        `/student/quiz/${encodeURIComponent(decodedCategory)}/submit`,
        { answers, codingResult: null }
      );

      setResults(res.data);
      setSubmitted(true);
      clearCache(CACHE_KEYS.SKILL_VERIFICATION);
      clearCache(CACHE_KEYS.CAREER_MATCH);
      clearCache(CACHE_KEYS.JOB_MATCHES);
      clearCache(CACHE_KEYS.DASHBOARD);
      toast.success("Quiz submitted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToCoding = () => {
    navigate(`/student/coding-challenge/${encodeURIComponent(decodedCategory)}`, {
      state: { quizResults: results },
    });
  };

  // ---- LOADING STATE ----
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar role="student" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title="Skill Quiz" />
          <main className="flex flex-1 items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                <LuSparkles size={20} className="animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Loading quiz questions...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ---- RESULTS STATE ----
  if (submitted && results) {
    const scoreColor =
      results.quizScore >= 75 ? "text-[#0F9D74]" : results.quizScore >= 50 ? "text-[#B68529]" : "text-red-500";
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (Math.min(results.quizScore, 100) / 100) * circumference;

    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
        <Sidebar role="student" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title="Quiz Results" />
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
            <div className="relative mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                  <LuTrophy size={24} />
                </div>
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  Quiz <span className="text-[#D4A84F]">Complete!</span>
                </h1>
                <p className="mt-2 text-sm text-slate-500">{decodedCategory}</p>
              </div>

              {/* Score Card */}
              <section className={`${cardClass} mb-6 p-6`}>
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                    <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                      <circle
                        cx="64" cy="64" r="54"
                        stroke={results.quizScore >= 75 ? "#0F9D74" : results.quizScore >= 50 ? "#D4A84F" : "#EF4444"}
                        strokeWidth="12" fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.6s ease" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-3xl font-black ${scoreColor}`}>{results.quizScore}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">/ 100</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg font-extrabold text-[#101828]">
                      {results.correctCount} / {results.totalQuestions} correct
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {results.quizScore >= 75
                        ? "Excellent! Strong knowledge demonstrated."
                        : results.quizScore >= 50
                        ? "Good foundation. Keep studying to strengthen weak areas."
                        : "Needs improvement. Review the topics and try again."}
                    </p>
                  </div>
                </div>
              </section>

              {/* Per-question review */}
              <section className={`${cardClass} mb-6 p-5 sm:p-6`}>
                <h2 className="mb-4 text-sm font-extrabold text-slate-700">Answer review</h2>
                <div className="space-y-3">
                  {results.answers?.map((a, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-4 ${
                        a.isCorrect
                          ? "border-[#00C7A7]/30 bg-[#F0FDFA]"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {a.isCorrect ? (
                          <LuCircleCheck size={18} className="mt-0.5 shrink-0 text-[#0F9D74]" />
                        ) : (
                          <LuCircleX size={18} className="mt-0.5 shrink-0 text-red-500" />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-700">{a.skill}</p>
                          <p className="mt-0.5 text-sm font-semibold text-[#101828]">{a.question}</p>
                          {!a.isCorrect && (
                            <p className="mt-1 text-xs text-red-600">
                              Your answer: {a.selectedIndex >= 0 ? questions[i]?.options[a.selectedIndex] : "Not answered"} |
                              Correct: <strong>{a.correctAnswer}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/student/skill-verification"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:border-[#D4A84F]/40 hover:bg-[#FFFBEA]"
                >
                  <LuArrowLeft size={14} /> Back to categories
                </Link>

                {isCoding && (
                  <button
                    onClick={handleProceedToCoding}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4A84F] px-6 py-3 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]"
                  >
                    <LuCode size={14} /> Take coding challenge
                    <LuArrowRight size={14} />
                  </button>
                )}
              </div>

              <div className="h-10" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ---- QUIZ STATE ----
  const q = questions[currentQ];
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={`Quiz: ${decodedCategory}`} />
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
          </div>

          <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>
                  Question {currentQ + 1} of {questions.length}
                </span>
                <span>{answeredCount} answered</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#C99532] to-[#E2B95F] transition-all duration-300"
                  style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <section className={`${cardClass} mb-6 p-5 sm:p-7`}>
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-[#FFFBEA] px-2.5 py-1 text-[10px] font-extrabold text-[#9A7220]">
                  QUESTION {currentQ + 1}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                  {q.skill}
                </span>
              </div>

              <h2 className="mb-6 mt-3 text-lg font-extrabold text-[#101828] sm:text-xl">{q.question}</h2>

              <div className="space-y-3">
                {q.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQ] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => selectAnswer(idx)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                        isSelected
                          ? "border-[#D4A84F] bg-[#FFFBEA] font-bold text-[#101828]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-[#D4A84F]/40 hover:bg-[#FFFBEA]/50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                          isSelected ? "bg-[#D4A84F] text-[#101828]" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={goPrev}
                disabled={currentQ === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <LuArrowLeft size={14} /> Previous
              </button>

              {currentQ < questions.length - 1 ? (
                <button
                  onClick={goNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4A84F] px-5 py-3 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]"
                >
                  Next <LuArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0F9D74] px-6 py-3 text-xs font-extrabold text-white hover:bg-[#0DB883] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <LuCircleCheck size={14} /> Submit quiz
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Question navigator dots */}
            <div className="mt-6 flex justify-center gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`h-3 w-3 rounded-full transition ${
                    i === currentQ
                      ? "bg-[#D4A84F]"
                      : selectedAnswers[i] !== undefined
                      ? "bg-[#0F9D74]"
                      : "bg-slate-200"
                  }`}
                  title={`Question ${i + 1}`}
                />
              ))}
            </div>

            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}
