import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuSparkles, LuTarget, LuGithub, LuCircleCheck, LuCircleX, LuTriangleAlert,
  LuFileText, LuHistory, LuRefreshCw, LuTrendingUp, LuLightbulb, LuCode,
  LuUser, LuBriefcase, LuStar, LuFlaskConical, LuMap, LuBookOpen, LuClock,
  LuExternalLink, LuChevronRight, LuShieldCheck, LuRocket,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";
import { readCache, writeCache, clearCache, CACHE_KEYS } from "../api/cache.js";

const CAREER_CATEGORIES = [
  "Web Development", "Mobile App Development", "Data Science",
  "AI / Machine Learning", "Cybersecurity", "Cloud / DevOps",
  "UI/UX Design", "Digital Marketing", "Game Development", "Business Analysis",
];

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";
const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#D4A84F] focus:ring-4 focus:ring-[#D4A84F]/10";

function scoreColor(score) {
  if (score >= 75) return { ring: "#0F9D74", text: "text-[#0F9D74]", label: "Strong", bg: "bg-emerald-50" };
  if (score >= 50) return { ring: "#D4A84F", text: "text-[#B68529]", label: "Developing", bg: "bg-amber-50" };
  return { ring: "#EF4444", text: "text-red-500", label: "Needs work", bg: "bg-red-50" };
}

function ScoreRing({ score, size = 160 }) {
  const colors = scoreColor(score);
  const radius = size * 0.42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#F1F5F9" strokeWidth="14" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={colors.ring} strokeWidth="14" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-5xl font-black ${colors.text}`}>{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">/ 100</span>
      </div>
    </div>
  );
}

function SignalBar({ label, value, color, icon: Icon }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: color + "15" }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">{label}</span>
          <span className="text-xs font-black" style={{ color }}>{value}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3">
      <Icon size={16} style={{ color }} />
      <span className="text-xl font-black" style={{ color }}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
    </div>
  );
}

function SkillChipList({ title, icon: Icon, skills, tone, emptyText }) {
  const toneClasses = {
    green: "border-[#00C7A7]/25 bg-[#F0FDFA] text-[#008F7A]",
    amber: "border-[#D4A84F]/30 bg-[#FFFBEA] text-[#9A7220]",
    red: "border-red-200 bg-red-50 text-red-600",
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} className="text-slate-500" />
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 ? (
          <span className="text-xs text-slate-400">{emptyText}</span>
        ) : (
          skills.map((skill) => (
            <span key={skill} className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-bold ${toneClasses[tone]}`}>
              {skill}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function MilestoneCard({ milestone, index, total }) {
  const isLast = index === total - 1;
  const totalHours = milestone.courses.reduce((sum, c) => sum + (c.estimatedHours || 0), 0);
  return (
    <div className="relative flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A84F] to-[#E2B95F] text-sm font-black text-white shadow-md">
          {index + 1}
        </div>
        {!isLast && <div className="mt-2 w-0.5 flex-1 bg-gradient-to-b from-[#D4A84F]/40 to-transparent" />}
      </div>

      {/* Content card */}
      <div className={`${cardClass} mb-5 flex-1 p-5`}>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <h4 className="text-sm font-extrabold text-[#101828]">{milestone.milestone}</h4>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEA] px-2.5 py-0.5 text-[10px] font-bold text-[#9A7220]">
            <LuClock size={10} /> ~{milestone.estimatedWeeks} week{milestone.estimatedWeeks === 1 ? "" : "s"}
          </span>
        </div>
        {milestone.description && (
          <p className="text-xs leading-5 text-slate-500 mb-3">{milestone.description}</p>
        )}

        {/* Target skills */}
        {milestone.targetSkills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {milestone.targetSkills.map((skill) => (
              <span key={skill} className="inline-flex items-center gap-1 rounded-md border border-[#D4A84F]/25 bg-[#FFFBEA] px-2 py-0.5 text-[10px] font-bold text-[#9A7220]">
                <LuTarget size={9} /> {skill}
              </span>
            ))}
          </div>
        )}

        {/* Course suggestions */}
        {milestone.courses?.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Recommended courses</p>
            <div className="space-y-2">
              {milestone.courses.map((course, ci) => (
                <div key={ci} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F0FDFA] text-[#0F9D74]">
                    <LuBookOpen size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#101828]">{course.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
                      {course.platform && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-500">
                          {course.platform}
                        </span>
                      )}
                      {course.estimatedHours > 0 && (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <LuClock size={9} /> {course.estimatedHours}h
                        </span>
                      )}
                      {course.url && (
                        <a href={course.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEA] px-2 py-0.5 font-bold text-[#9A7220] hover:bg-[#D4A84F]/20 transition">
                          <LuExternalLink size={9} /> Open
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalHours > 0 && (
          <p className="mt-3 text-[10px] font-bold text-slate-400">Total: ~{totalHours} hours</p>
        )}
      </div>
    </div>
  );
}

export default function JobReadiness() {
  const navigate = useNavigate();
  const cached = readCache(CACHE_KEYS.JOB_READINESS);
  const [category, setCategory] = useState(cached?.category ?? "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(cached?.result ?? null);
  const [error, setError] = useState("");
  const [savedResults, setSavedResults] = useState(cached?.savedResults ?? []);
  const [isSaved, setIsSaved] = useState(!!cached?.result);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    try {
      const res = await api.get("/student/job-readiness/history");
      const fresh = res.data.results || [];
      setSavedResults(fresh);
      writeCache(CACHE_KEYS.JOB_READINESS, { ...cached, savedResults: fresh });
    } catch {}
  };

  const handleCategoryChange = async (newCategory) => {
    setCategory(newCategory);
    setResult(null);
    setIsSaved(false);
    setError("");
    if (!newCategory) return;
    try {
      const res = await api.get(`/student/job-readiness/${encodeURIComponent(newCategory)}`);
      setResult(res.data);
      setIsSaved(true);
    } catch {}
  };

  const runAnalysis = async () => {
    if (!category) { toast.error("Please select a career category first"); return; }
    setLoading(true); setError(""); setResult(null); setIsSaved(false);
    try {
      const res = await api.post("/student/job-readiness", { category });
      setResult(res.data);
      setIsSaved(true);
      writeCache(CACHE_KEYS.JOB_READINESS, { category, result: res.data, savedResults });
      clearCache(CACHE_KEYS.CAREER_MATCH);
      clearCache(CACHE_KEYS.JOB_MATCHES);
      clearCache(CACHE_KEYS.DASHBOARD);
      toast.success("Analysis complete & saved!");
      loadHistory();
    } catch (err) {
      setError(err.response?.data?.message || "Job readiness analysis failed");
      toast.error(err.response?.data?.message || "Job readiness analysis failed");
    } finally { setLoading(false); }
  };

  const loadSavedResult = async (savedCat) => {
    setCategory(savedCat); setLoading(true); setError("");
    try {
      const res = await api.get(`/student/job-readiness/${encodeURIComponent(savedCat)}`);
      setResult(res.data); setIsSaved(true);
    } catch { toast.error("Could not load saved result"); }
    finally { setLoading(false); }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

  const expBadge = {
    Beginner: { bg: "bg-blue-100 text-blue-700" },
    Intermediate: { bg: "bg-amber-100 text-amber-700" },
    Advanced: { bg: "bg-emerald-100 text-emerald-700" },
    Expert: { bg: "bg-purple-100 text-purple-700" },
    Unspecified: { bg: "bg-slate-100 text-slate-500" },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Job Ready Score + Roadmap" />
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>
          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#D4A84F]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-[45%] h-72 w-72 rounded-full bg-[#00C7A7]/5 blur-3xl" />

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A84F]/35 bg-[#FFFBEA] px-4 py-2 text-xs font-extrabold text-[#9A7220]">
                <LuRocket size={14} /> UNIFIED JOB-READY SCORE + ROADMAP
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">
                Your <span className="text-[#D4A84F]">complete picture</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                All three signals combined into one score — resume/GitHub evidence, quiz verification, and market alignment — plus a roadmap to close your gaps.
              </p>
            </div>

            {/* Category picker */}
            <section className={`${cardClass} mb-6 p-5 sm:p-6`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label htmlFor="category" className="mb-2 block text-xs font-bold text-slate-700">Choose a career category</label>
                  <select id="category" className={selectClass} value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                    <option value="">Select a category</option>
                    {CAREER_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <button type="button" onClick={runAnalysis} disabled={loading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#D4A84F] px-6 py-3 text-sm font-extrabold text-[#101828] transition hover:bg-[#E2B95F] disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#101828]/30 border-t-[#101828]" /> Analyzing...</>
                  ) : (
                    <>{isSaved ? <LuRefreshCw size={16} /> : <LuSparkles size={16} />} {isSaved ? "Re-run analysis" : "Run analysis"}</>
                  )}
                </button>
              </div>
              {isSaved && result && (
                <p className="mt-3 text-xs text-emerald-600 font-semibold">Saved result loaded. Click &quot;Re-run analysis&quot; to refresh with latest data.</p>
              )}
            </section>

            {error && (<div className={`${cardClass} mb-6 px-6 py-6 text-center`}><p className="text-sm font-bold text-red-500">{error}</p></div>)}

            {loading && (
              <div className={`${cardClass} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                  <LuSparkles size={20} className="animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Analyzing resume, GitHub, quiz results, and market data...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6">
                {/* ═══════════════════════════════════════════════
                    UNIFIED JOB-READY SCORE (hero section)
                ═══════════════════════════════════════════════ */}
                <section className={`${cardClass} overflow-hidden`}>
                  <div className="grid gap-0 lg:grid-cols-[1fr_1.4fr]">
                    {/* Left: Unified score ring */}
                    <div className="flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#FFFBEA]/60 to-white p-8">
                      <ScoreRing score={result.jobReadyScore || 0} />
                      <div className="text-center">
                        <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Unified Job-Ready Score</p>
                        <h2 className="text-lg font-extrabold text-[#101828]">{result.category}</h2>
                        <span className={`text-sm font-extrabold ${scoreColor(result.jobReadyScore || 0).text}`}>
                          {scoreColor(result.jobReadyScore || 0).label}
                        </span>
                      </div>
                      {result.experienceLevel && result.experienceLevel !== "Unspecified" && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${expBadge[result.experienceLevel]?.bg || expBadge.Unspecified.bg}`}>
                          <LuStar size={12} /> {result.experienceLevel}
                        </span>
                      )}
                    </div>

                    {/* Right: 3-signal breakdown */}
                    <div className="flex flex-col gap-5 p-6 sm:p-8">
                      <div>
                        <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Score composition (3 signals)</p>
                        <div className="space-y-4">
                          <SignalBar
                            label="Resume + GitHub Evidence"
                            value={result.jobReadyBreakdown?.resumeGithub || 0}
                            color="#6366F1"
                            icon={LuGithub}
                          />
                          <SignalBar
                            label="Quiz Verification"
                            value={result.jobReadyBreakdown?.quizVerification || 0}
                            color="#0F9D74"
                            icon={LuFlaskConical}
                          />
                          <SignalBar
                            label="Market Alignment"
                            value={result.jobReadyBreakdown?.marketAlignment || 0}
                            color="#D4A84F"
                            icon={LuBriefcase}
                          />
                        </div>
                      </div>

                      {/* Quiz status indicator */}
                      <div className="flex flex-wrap items-center gap-3">
                        {result.quizScore > 0 ? (
                          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <LuShieldCheck size={14} className="text-[#0F9D74]" />
                            <div>
                              <p className="text-[10px] font-bold text-[#008F7A]">Quiz verified</p>
                              <p className="text-xs font-extrabold text-[#101828]">{result.quizScore}% score{result.codingPassed ? " + coding passed" : ""}</p>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => navigate("/student/skill-verification")}
                            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 transition hover:bg-amber-100"
                          >
                            <LuTriangleAlert size={14} className="text-amber-600" />
                            <div>
                              <p className="text-[10px] font-bold text-[#9A7220]">No quiz taken yet</p>
                              <p className="text-xs font-extrabold text-amber-700">Take a quiz to improve your score <LuChevronRight size={11} className="inline" /></p>
                            </div>
                          </button>
                        )}
                        <span className="text-xs text-slate-400">
                          <LuGithub size={13} className="inline" /> {result.githubReposAnalyzed} repo{result.githubReposAnalyzed === 1 ? "" : "s"} analyzed
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-slate-600">{result.summary}</p>
                    </div>
                  </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    STATS + MISSING/MATCHED SKILLS
                ═══════════════════════════════════════════════ */}
                <section className={`${cardClass} p-5 sm:p-6`}>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <StatCard icon={LuCircleCheck} label="Matched" value={result.matchedSkills?.length || 0} color="#0F9D74" />
                    <StatCard icon={LuCircleX} label="Unverified" value={result.unverifiedClaims?.length || 0} color="#EF4444" />
                    <StatCard icon={LuTrendingUp} label="Missing" value={result.missingSkills?.length || 0} color="#D4A84F" />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <SkillChipList title="Verified skills" icon={LuCircleCheck} skills={result.matchedSkills} tone="green" emptyText="No verified skills found yet." />
                    <SkillChipList title="Missing for this role" icon={LuFileText} skills={result.missingSkills} tone="amber" emptyText="No major gaps found — nice work." />
                  </div>
                </section>

                {/* ═══════════════════════════════════════════════
                    UNVERIFIED CLAIMS
                ═══════════════════════════════════════════════ */}
                {result.unverifiedClaims?.length > 0 && (
                  <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <LuTriangleAlert size={16} className="text-amber-600" />
                      <h3 className="text-sm font-extrabold text-amber-700">Claimed but not backed by evidence</h3>
                    </div>
                    <p className="mb-3 text-xs leading-5 text-amber-700/80">
                      You listed these skills, but we found no evidence in your resume or GitHub. Consider adding a project, or removing the claim.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.unverifiedClaims.map((skill) => (
                        <span key={skill} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700">
                          <LuCircleX size={13} /> {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* ═══════════════════════════════════════════════
                    MILESTONE-BASED ROADMAP
                ═══════════════════════════════════════════════ */}
                {result.roadmap?.length > 0 && (
                  <section className={`${cardClass} p-5 sm:p-7`}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A84F] to-[#E2B95F] text-white shadow-sm">
                        <LuMap size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#101828]">Your Learning Roadmap</h3>
                        <p className="text-[11px] text-slate-500">Milestone-based path to close your skill gaps</p>
                      </div>
                    </div>

                    <div>
                      {result.roadmap.map((milestone, i) => (
                        <MilestoneCard key={i} milestone={milestone} index={i} total={result.roadmap.length} />
                      ))}
                    </div>

                    {result.roadmap.length > 0 && (
                      <div className="mt-2 rounded-xl bg-slate-50/60 border border-slate-100 px-4 py-3 text-center">
                        <p className="text-xs font-bold text-slate-500">
                          Total roadmap: ~{result.roadmap.reduce((s, m) => s + (m.estimatedWeeks || 0), 0)} weeks &middot; ~{result.roadmap.reduce((s, m) => s + m.courses.reduce((h, c) => h + (c.estimatedHours || 0), 0), 0)} hours of learning
                        </p>
                      </div>
                    )}
                  </section>
                )}

                {/* ═══════════════════════════════════════════════
                    EVIDENCE TRAIL (GitHub repos checked)
                ═══════════════════════════════════════════════ */}
                {result.evidenceTrail?.length > 0 && (
                  <section className={`${cardClass} p-5 sm:p-7`}>
                    <div className="mb-4 flex items-center gap-2">
                      <LuGithub size={16} className="text-slate-500" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Evidence checked</h3>
                    </div>
                    <div className="space-y-3">
                      {result.evidenceTrail.map((entry) => (
                        <div key={entry.repo} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                          <span className="text-xs font-extrabold text-[#101828]">{entry.repo}</span>
                          {entry.language && entry.language !== "Unknown" && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                              <LuCode size={10} /> {entry.language}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">—</span>
                          {entry.filesChecked.map((file) => (
                            <span key={file} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
                              {file}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Past analyses */}
            {savedResults.length > 0 && (
              <section className={`${cardClass} mt-6 p-5 sm:p-6`}>
                <div className="mb-4 flex items-center gap-2">
                  <LuHistory size={15} className="text-slate-500" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-600">Past analyses</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {savedResults.map((r) => {
                    const colors = scoreColor(r.jobReadyScore || r.jobReadinessScore || 0);
                    return (
                      <button key={r._id} onClick={() => loadSavedResult(r.category)}
                        className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-left transition hover:border-[#D4A84F]/40 hover:bg-white">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black"
                          style={{ backgroundColor: colors.ring + "18", color: colors.ring }}>{r.jobReadyScore || r.jobReadinessScore || 0}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-extrabold text-[#101828] truncate">{r.category}</p>
                          <p className="text-[11px] text-slate-400">{formatDate(r.updatedAt)} &middot; {r.matchedSkills?.length || 0} matched</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}
