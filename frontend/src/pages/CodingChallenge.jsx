import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuSparkles,
  LuArrowLeft,
  LuPlay,
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuCode,
  LuTrophy,
  LuRotateCcw,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";
import { clearCache, CACHE_KEYS } from "../api/cache.js";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

export default function CodingChallenge() {
  const { category } = useParams();
  const decodedCategory = decodeURIComponent(category || "");
  const location = useLocation();
  const navigate = useNavigate();
  const quizResults = location.state?.quizResults;

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/student/coding-challenge/${encodeURIComponent(decodedCategory)}`)
      .then((res) => {
        setChallenge(res.data);
        setCode(res.data.starterCode || "");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to load coding challenge");
        navigate("/student/skill-verification");
      })
      .finally(() => setLoading(false));
  }, [category]);

  const runCode = async () => {
    if (!code.trim()) {
      toast.warn("Please write some code first");
      return;
    }

    setRunning(true);
    setResult(null);
    try {
      const res = await api.post(
        `/student/coding-challenge/${encodeURIComponent(decodedCategory)}/submit`,
        { sourceCode: code }
      );
      setResult(res.data);
      setSubmitted(true);
      clearCache(CACHE_KEYS.SKILL_VERIFICATION);
      clearCache(CACHE_KEYS.CAREER_MATCH);
      clearCache(CACHE_KEYS.JOB_MATCHES);
      clearCache(CACHE_KEYS.DASHBOARD);

      if (res.data.passed) {
        toast.success("All test cases passed!");
      } else {
        toast.warn("Some test cases failed. Check the output below.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Code execution failed");
    } finally {
      setRunning(false);
    }
  };

  const resetCode = () => {
    setCode(challenge?.starterCode || "");
    setResult(null);
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar role="student" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title="Coding Challenge" />
          <main className="flex flex-1 items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                <LuSparkles size={20} className="animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Loading coding challenge...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!challenge) return null;

  const finalScore = quizResults
    ? Math.round(
        quizResults.quizScore * 0.6 + (result?.passed ? 100 : 0) * 0.4
      )
    : null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title={`Coding: ${decodedCategory}`} />
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#D4A84F]/35 bg-[#FFFBEA] px-3 py-1.5 text-[10px] font-extrabold text-[#9A7220]">
                  <LuCode size={12} /> CODING CHALLENGE
                </div>
                <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                  {challenge.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold">{challenge.language}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold">{challenge.difficulty}</span>
                </div>
              </div>
              <Link
                to="/student/skill-verification"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <LuArrowLeft size={14} /> Back
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
              {/* Problem description */}
              <section className={`${cardClass} p-5 sm:p-6 lg:col-span-2`}>
                <h2 className="mb-3 text-sm font-extrabold text-slate-700">Problem</h2>
                <p className="text-sm leading-6 text-slate-600">{challenge.description}</p>

                {challenge.testCases.length > 0 && (
                  <div className="mt-5">
                    <h3 className="mb-2 text-xs font-extrabold text-slate-600">Example</h3>
                    <div className="rounded-xl bg-slate-900 p-3 font-mono text-xs text-green-400">
                      <div className="text-slate-500">Input:</div>
                      <div className="mt-0.5">{challenge.testCases[0].input}</div>
                    </div>
                  </div>
                )}

                {quizResults && (
                  <div className="mt-5 rounded-xl border border-[#D4A84F]/25 bg-[#FFFBEA] p-4">
                    <p className="text-xs font-bold text-[#9A7220]">Quiz score: {quizResults.quizScore}%</p>
                    <p className="mt-1 text-[11px] text-[#B68529]">
                      Quiz counts 60% + Coding 40% of your verification score
                    </p>
                  </div>
                )}
              </section>

              {/* Code editor */}
              <section className={`${cardClass} flex flex-col p-5 sm:p-6 lg:col-span-3`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-700">Your code</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={resetCode}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                    >
                      <LuRotateCcw size={12} /> Reset
                    </button>
                    <button
                      onClick={runCode}
                      disabled={running}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F9D74] px-4 py-1.5 text-[10px] font-extrabold text-white hover:bg-[#0DB883] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {running ? (
                        <>
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Running...
                        </>
                      ) : (
                        <>
                          <LuPlay size={12} /> Run code
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 resize-none rounded-xl bg-slate-900 p-4 font-mono text-sm leading-6 text-green-400 outline-none placeholder:text-slate-600"
                  style={{ minHeight: "280px", tabSize: 2 }}
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
              </section>
            </div>

            {/* Results */}
            {submitted && result && (
              <div className="mt-6 space-y-4">
                {/* Overall result */}
                <section
                  className={`overflow-hidden rounded-2xl border p-5 sm:p-6 ${
                    result.passed
                      ? "border-[#00C7A7]/30 bg-[#F0FDFA]"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.passed ? (
                      <LuCircleCheck size={22} className="shrink-0 text-[#0F9D74]" />
                    ) : (
                      <LuCircleX size={22} className="shrink-0 text-red-500" />
                    )}
                    <div>
                      <h3
                        className={`text-base font-extrabold ${
                          result.passed ? "text-[#0F9D74]" : "text-red-600"
                        }`}
                      >
                        {result.passed ? "All tests passed!" : "Some tests failed"}
                      </h3>
                      <p className={`mt-1 text-xs ${result.passed ? "text-[#008F7A]" : "text-red-500"}`}>
                        Status: {result.status}
                        {result.executionTime && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <LuClock size={11} /> {result.executionTime}s
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Per-test-case results */}
                <section className={`${cardClass} p-5 sm:p-6`}>
                  <h2 className="mb-4 text-sm font-extrabold text-slate-700">Test case results</h2>
                  <div className="space-y-3">
                    {result.testResults?.map((tr, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 ${
                          tr.passed
                            ? "border-[#00C7A7]/20 bg-[#F0FDFA]/50"
                            : "border-red-200 bg-red-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {tr.passed ? (
                            <LuCircleCheck size={14} className="text-[#0F9D74]" />
                          ) : (
                            <LuCircleX size={14} className="text-red-500" />
                          )}
                          <span className="text-xs font-bold text-slate-700">Test Case {tr.testCase}</span>
                          <span className={`text-[10px] font-bold ${tr.passed ? "text-[#0F9D74]" : "text-red-500"}`}>
                            {tr.status}
                          </span>
                          {tr.time && (
                            <span className="ml-auto text-[10px] text-slate-400">{tr.time}s</span>
                          )}
                        </div>
                        {!tr.passed && tr.stderr && (
                          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-red-400">
                            {tr.stderr}
                          </pre>
                        )}
                        {!tr.passed && tr.compileOutput && (
                          <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-2 font-mono text-[11px] text-amber-400">
                            {tr.compileOutput}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Final combined score */}
                {finalScore !== null && (
                  <section className={`${cardClass} p-5 text-center sm:p-6`}>
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                      <LuTrophy size={22} />
                    </div>
                    <h2 className="text-lg font-black text-[#101828]">
                      Verification Score:{" "}
                      <span
                        className={
                          finalScore >= 75
                            ? "text-[#0F9D74]"
                            : finalScore >= 50
                            ? "text-[#B68529]"
                            : "text-red-500"
                        }
                      >
                        {finalScore}%
                      </span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Quiz ({quizResults?.quizScore}% x 60%) + Coding ({result.passed ? 100 : 0}% x 40%)
                    </p>
                  </section>
                )}

                {/* Actions */}
                <div className="flex justify-center gap-3">
                  <Link
                    to="/student/skill-verification"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                  >
                    <LuArrowLeft size={14} /> All categories
                  </Link>
                  <button
                    onClick={() => {
                      setCode(challenge.starterCode);
                      setResult(null);
                      setSubmitted(false);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#D4A84F] px-5 py-3 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]"
                  >
                    <LuRotateCcw size={14} /> Try again
                  </button>
                </div>
              </div>
            )}

            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}
