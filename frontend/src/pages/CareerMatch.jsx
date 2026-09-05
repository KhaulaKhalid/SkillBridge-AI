import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  LuSparkles,
  LuRefreshCw,
  LuTrendingUp,
  LuBriefcaseBusiness,
  LuTarget,
  LuInfo,
  LuShieldCheck,
  LuShieldX,
  LuCircleCheck,
  LuCircleAlert,
  LuGithub,
  LuFlaskConical,
  LuFileText,
  LuArrowRight,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";
import { readCache, writeCache, CACHE_KEYS } from "../api/cache.js";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

const demandStyles = {
  High: "border-[#00C7A7]/30 bg-[#F0FDFA] text-[#008F7A]",
  Medium: "border-[#D4A84F]/35 bg-[#FFFBEA] text-[#9A7220]",
  Low: "border-slate-200 bg-slate-50 text-slate-500",
  None: "border-slate-200 bg-slate-50 text-slate-400",
};

const evidenceConfig = {
  verified: {
    icon: LuShieldCheck,
    label: "Verified",
    bg: "bg-[#F0FDFA]",
    border: "border-[#00C7A7]/30",
    text: "text-[#008F7A]",
    ring: "#0F9D74",
  },
  partial: {
    icon: LuCircleAlert,
    label: "Partial evidence",
    bg: "bg-[#FFFBEA]",
    border: "border-[#D4A84F]/35",
    text: "text-[#9A7220]",
    ring: "#D4A84F",
  },
  claim_only: {
    icon: LuShieldX,
    label: "Claim only",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-500",
    ring: "#EF4444",
  },
};

function fitScoreColor(score) {
  if (score >= 75) return { bar: "from-[#0F9D74] to-[#1DC79A]", text: "text-[#0F9D74]" };
  if (score >= 50) return { bar: "from-[#C99532] to-[#E2B95F]", text: "text-[#B68529]" };
  return { bar: "from-slate-400 to-slate-300", text: "text-slate-500" };
}

function formatPKR(value) {
  if (value === null || value === undefined) return null;
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function EvidenceBadge({ level }) {
  const config = evidenceConfig[level] || evidenceConfig.claim_only;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${config.border} ${config.bg} ${config.text}`}>
      <Icon size={11} /> {config.label}
    </span>
  );
}

function ScoreBreakdownRow({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-[10px] font-bold text-slate-400">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="min-w-[28px] text-right text-[10px] font-extrabold text-slate-500">{value}%</span>
    </div>
  );
}

function EvidenceSection({ match }) {
  const items = [];
  if (match.hasQuiz) {
    items.push({ icon: LuFlaskConical, label: "Quiz", value: `${match.quizScore}%`, color: match.quizPassed ? "text-[#008F7A]" : "text-[#9A7220]" });
  }
  if (match.codingPassed) {
    items.push({ icon: LuCircleCheck, label: "Coding", value: "Passed", color: "text-[#008F7A]" });
  } else if (match.hasQuiz) {
    items.push({ icon: LuCircleAlert, label: "Coding", value: "Not passed", color: "text-slate-400" });
  }
  if (match.hasReadiness) {
    items.push({ icon: LuFileText, label: "Readiness", value: `${match.readinessScore}%`, color: match.readinessScore >= 50 ? "text-[#008F7A]" : "text-[#9A7220]" });
  }
  if (match.githubRepos > 0) {
    items.push({ icon: LuGithub, label: "GitHub", value: `${match.githubRepos} repo${match.githubRepos === 1 ? "" : "s"}`, color: "text-[#101828]" });
  }
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.length > 0 ? items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
          <item.icon size={13} className={item.color} />
          <div>
            <p className="text-[10px] font-bold text-slate-400">{item.label}</p>
            <p className={`text-xs font-extrabold ${item.color}`}>{item.value}</p>
          </div>
        </div>
      )) : (
        <div className="col-span-full flex items-center gap-2 rounded-lg border border-red-100 bg-red-50/50 px-3 py-2">
          <LuShieldX size={13} className="text-red-400" />
          <p className="text-[11px] font-bold text-red-400">No evidence yet — take a quiz or run job readiness analysis</p>
        </div>
      )}
    </div>
  );
}

export default function CareerMatch() {
  const cached = readCache(CACHE_KEYS.CAREER_MATCH);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState(cached?.matches ?? []);
  const [emptyMessage, setEmptyMessage] = useState(cached?.emptyMessage ?? "");
  const [error, setError] = useState("");
  const [evidenceCoverage, setEvidenceCoverage] = useState(cached?.evidenceCoverage ?? null);

  const fetchMatches = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const res = await api.get("/student/career-match");
      const freshMatches = res.data.matches || [];
      const freshEmpty = res.data.message || "";
      const freshCoverage = res.data.evidenceCoverage || null;
      setMatches(freshMatches);
      setEmptyMessage(freshEmpty);
      setEvidenceCoverage(freshCoverage);
      writeCache(CACHE_KEYS.CAREER_MATCH, { matches: freshMatches, emptyMessage: freshEmpty, evidenceCoverage: freshCoverage });
    } catch (err) {
      if (!cached) {
        setError(err.response?.data?.message || "Couldn't load your career matches");
        toast.error(err.response?.data?.message || "Couldn't load your career matches");
      }
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Career Compass" />

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
          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#D4A84F]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-[45%] h-72 w-72 rounded-full bg-[#00C7A7]/5 blur-3xl" />

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A84F]/35 bg-[#FFFBEA] px-4 py-2 text-xs font-extrabold text-[#9A7220]">
                  <LuTarget size={14} /> EVIDENCE-WEIGHTED COMPASS
                </div>
                <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">
                  Your best-fit <span className="text-[#D4A84F]">career paths</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Ranked using verified evidence (quizzes, GitHub, readiness) — not just claimed skills.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchMatches(true)}
                disabled={refreshing || loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 transition hover:border-[#D4A84F]/40 hover:bg-[#FFFBEA] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LuRefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh matches"}
              </button>
            </div>

            {evidenceCoverage && !loading && matches.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Evidence coverage</span>
                {evidenceCoverage.verified > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDFA] px-2.5 py-1 text-[10px] font-extrabold text-[#008F7A]">
                    <LuShieldCheck size={11} /> {evidenceCoverage.verified} verified
                  </span>
                )}
                {evidenceCoverage.partial > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEA] px-2.5 py-1 text-[10px] font-extrabold text-[#9A7220]">
                    <LuCircleAlert size={11} /> {evidenceCoverage.partial} partial
                  </span>
                )}
                {evidenceCoverage.claimOnly > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-extrabold text-red-500">
                    <LuShieldX size={11} /> {evidenceCoverage.claimOnly} claim only
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className={`${cardClass} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                  <LuSparkles size={20} className="animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Analyzing your evidence against the market...</p>
              </div>
            ) : error ? (
              <div className={`${cardClass} px-6 py-12 text-center`}>
                <p className="text-sm font-bold text-red-500">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchMatches()}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D4A84F] px-5 py-2.5 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]"
                >
                  Try again
                </button>
              </div>
            ) : matches.length === 0 ? (
              <div className={`${cardClass} flex flex-col items-center gap-4 px-6 py-16 text-center`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                  <LuInfo size={20} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#101828]">No matches yet</p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    {emptyMessage || "No market data is available yet. Check back once recruiters start posting jobs."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {matches.map((match, i) => {
                  const colors = fitScoreColor(match.fitScore);
                  const salary = match.salaryRange || {};
                  const salaryLabel =
                    formatPKR(salary.min) && formatPKR(salary.max)
                      ? `${formatPKR(salary.min)} - ${formatPKR(salary.max)}`
                      : formatPKR(salary.min) || formatPKR(salary.max) || "Not enough data yet";

                  return (
                    <section key={`${match.category}-${i}`} className={`${cardClass} overflow-hidden`}>
                      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFFBEA] text-[#B68529]">
                            <span className="text-sm font-black">#{i + 1}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-base font-extrabold text-[#101828] sm:text-lg">{match.category}</h2>
                              <EvidenceBadge level={match.evidenceLevel} />
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                                  demandStyles[match.demandLevel] || demandStyles.None
                                }`}
                              >
                                <LuTrendingUp size={11} /> {match.demandLevel || "Unknown"} demand
                              </span>
                            </div>
                            <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
                              {match.reasoning}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-extrabold text-slate-500">
                                {match.postingCount || 0} active role{match.postingCount === 1 ? "" : "s"}
                              </span>
                              {(match.topSkills || []).slice(0, 4).map((skill) => (
                                <span key={skill} className={`rounded-full border px-2.5 py-1 font-bold ${
                                  (match.verifiedSkills || []).map(s => s.toLowerCase()).includes(skill.toLowerCase())
                                    ? "border-[#00C7A7]/25 bg-[#F0FDFA] text-[#008F7A]"
                                    : "border-slate-200 bg-white text-slate-500"
                                }`}>
                                  {skill}
                                </span>
                              ))}
                            </div>

                            {match.claimOnlySkills?.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-bold text-red-400">Unverified:</span>
                                {match.claimOnlySkills.slice(0, 3).map((skill) => (
                                  <span key={skill} className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-400">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}

                            <EvidenceSection match={match} />

                            <p className="mt-3 text-xs font-bold text-slate-600">
                              Expected salary: <span className="text-[#101828]">{salaryLabel}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col items-center gap-2 lg:w-32">
                          <span className={`text-2xl font-black ${colors.text}`}>{match.fitScore}%</span>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-500`}
                              style={{ width: `${Math.min(match.fitScore, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Fit score</span>

                          <div className="mt-2 w-full space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2">
                            <ScoreBreakdownRow label="Claimed" value={Math.round(((match.topSkills || []).filter(s => (match.verifiedSkills || []).concat(match.claimOnlySkills || []).map(x=>x.toLowerCase()).includes(s.toLowerCase())).length / Math.max((match.topSkills || []).length, 1)) * 100)} color="bg-slate-400" />
                            <ScoreBreakdownRow label="Verified" value={Math.round(((match.topSkills || []).filter(s => (match.verifiedSkills || []).map(x=>x.toLowerCase()).includes(s.toLowerCase())).length / Math.max((match.topSkills || []).length, 1)) * 100)} color="bg-[#0F9D74]" />
                            <ScoreBreakdownRow label="Readiness" value={match.readinessScore || 0} color="bg-[#D4A84F]" />
                            <ScoreBreakdownRow label="GitHub" value={match.githubRepos > 0 ? Math.min(100, Math.round(((match.githubLanguages || []).length / Math.max((match.topSkills || []).length, 1)) * 100)) : 0} color="bg-[#6366F1]" />
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}
