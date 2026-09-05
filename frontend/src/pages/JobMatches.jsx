import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  LuBriefcase, LuMapPin, LuClock, LuDollarSign, LuRefreshCw, LuCircleCheck,
  LuCircleX, LuSparkles, LuTrendingUp, LuUser, LuBuilding, LuFilter,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";
import { readCache, writeCache, CACHE_KEYS } from "../api/cache.js";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

function matchColor(score) {
  if (score >= 70) return { bar: "#0F9D74", text: "text-[#0F9D74]", bg: "bg-emerald-50", label: "Strong match" };
  if (score >= 40) return { bar: "#D4A84F", text: "text-[#B68529]", bg: "bg-amber-50", label: "Good match" };
  return { bar: "#94A3B8", text: "text-slate-500", bg: "bg-slate-50", label: "Low match" };
}

function formatPKR(value) {
  if (!value) return null;
  if (value >= 1000) return `PKR ${(value / 1000).toFixed(0)}K`;
  return `PKR ${value.toLocaleString()}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const CATEGORIES = [
  "All", "Web Development", "Mobile App Development", "Data Science",
  "AI / Machine Learning", "Cybersecurity", "Cloud / DevOps",
  "UI/UX Design", "Digital Marketing", "Game Development", "Business Analysis",
];

function MatchBadge({ score }) {
  const c = matchColor(score);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
          <circle cx="28" cy="28" r="22" stroke="#F1F5F9" strokeWidth="5" fill="none" />
          <circle cx="28" cy="28" r="22" stroke={c.bar} strokeWidth="5" fill="none"
            strokeDasharray={138.2} strokeDashoffset={138.2 - (Math.min(score, 100) / 100) * 138.2}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <span className={`absolute text-sm font-black ${c.text}`}>{score}</span>
      </div>
      <span className={`text-[9px] font-bold ${c.text}`}>{c.label}</span>
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
      <Icon size={13} style={{ color }} />
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
}

export default function JobMatches() {
  const cached = readCache(CACHE_KEYS.JOB_MATCHES);
  const [jobs, setJobs] = useState(cached?.jobs ?? []);
  const [summary, setSummary] = useState(cached?.summary ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState("");
  const [emptyMessage, setEmptyMessage] = useState(cached?.emptyMessage ?? "");
  const [filter, setFilter] = useState("All");

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/student/job-matches");
      const freshJobs = res.data.jobs || [];
      const freshSummary = res.data.summary || null;
      const freshEmpty = res.data.message || "";
      setJobs(freshJobs);
      setSummary(freshSummary);
      setEmptyMessage(freshEmpty);
      writeCache(CACHE_KEYS.JOB_MATCHES, { jobs: freshJobs, summary: freshSummary, emptyMessage: freshEmpty });
    } catch (err) {
      if (!cached) {
        setError(err.response?.data?.message || "Couldn't load job matches");
        toast.error(err.response?.data?.message || "Couldn't load job matches");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const filtered = filter === "All" ? jobs : jobs.filter((j) => j.category === filter);
  const categories = ["All", ...new Set(jobs.map((j) => j.category))];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Job Matches" />
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>
          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#D4A84F]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-[45%] h-72 w-72 rounded-full bg-[#00C7A7]/5 blur-3xl" />

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A84F]/35 bg-[#FFFBEA] px-4 py-2 text-xs font-extrabold text-[#9A7220]">
                  <LuBriefcase size={14} /> PERSONALISED JOB MATCHES
                </div>
                <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">
                  Jobs that fit <span className="text-[#D4A84F]">you</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                  Active postings ranked by how well your skills, quiz scores, and readiness align.
                </p>
              </div>
              <button onClick={fetchJobs} disabled={loading}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-extrabold text-slate-700 transition hover:border-[#D4A84F]/40 hover:bg-[#FFFBEA] disabled:cursor-not-allowed disabled:opacity-60">
                <LuRefreshCw size={14} className={loading ? "animate-spin" : ""} />
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            {/* Summary pills */}
            {summary && !loading && jobs.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <StatPill icon={LuTrendingUp} label="strong" value={summary.highMatch} color="#0F9D74" />
                <StatPill icon={LuTrendingUp} label="good" value={summary.mediumMatch} color="#D4A84F" />
                <StatPill icon={LuTrendingUp} label="low" value={summary.lowMatch} color="#94A3B8" />
              </div>
            )}

            {/* Category filter */}
            {jobs.length > 0 && (
              <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
                <LuFilter size={14} className="shrink-0 text-slate-400" />
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      filter === cat
                        ? "border-[#D4A84F] bg-[#FFFBEA] text-[#9A7220]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && !cached && (
              <div className={`${cardClass} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                  <LuSparkles size={20} className="animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-slate-500">Matching your profile against active job postings...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className={`${cardClass} px-6 py-12 text-center`}>
                <p className="text-sm font-bold text-red-500">{error}</p>
                <button onClick={fetchJobs}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#D4A84F] px-5 py-2.5 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]">
                  Try again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <div className={`${cardClass} flex flex-col items-center gap-4 px-6 py-16 text-center`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                  <LuBriefcase size={20} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#101828]">
                    {filter !== "All" ? "No jobs in this category" : "No matches yet"}
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    {filter !== "All" ? "Try selecting a different category or 'All'." : (emptyMessage || "No active job postings yet. Check back soon!")}
                  </p>
                </div>
              </div>
            )}

            {/* Job list */}
            {filtered.length > 0 && (
              <div className="space-y-4">
                {filtered.map((job, i) => {
                  const c = matchColor(job.match.totalScore);
                  const salary = job.salaryRange || {};
                  const salaryLabel = salary.min && salary.max
                    ? `${formatPKR(salary.min)} – ${formatPKR(salary.max)}`
                    : salary.min ? `From ${formatPKR(salary.min)}` : salary.max ? `Up to ${formatPKR(salary.max)}` : null;

                  return (
                    <section key={job._id} className={`${cardClass} overflow-hidden`}>
                      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                        {/* Left: job details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-500">#{i + 1}</span>
                            <h2 className="text-base font-extrabold text-[#101828]">{job.title}</h2>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${c.bg} ${c.text}`}>
                              {c.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                            {(job.recruiter.company || job.recruiter.name) && (
                              <span className="inline-flex items-center gap-1">
                                <LuBuilding size={12} /> {job.recruiter.company || job.recruiter.name}
                              </span>
                            )}
                            {job.location && (
                              <span className="inline-flex items-center gap-1">
                                <LuMapPin size={12} /> {job.location}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <LuClock size={12} /> {job.employmentType}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <LuUser size={12} /> {job.seniorityLevel}
                            </span>
                            {salaryLabel && (
                              <span className="inline-flex items-center gap-1 font-bold text-[#101828]">
                                <LuDollarSign size={12} /> {salaryLabel}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400">{timeAgo(job.postedAt)}</span>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 mb-3">
                            {job.category}
                          </span>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(job.extractedSkills || []).map((skill) => {
                              const isMatched = (job.match.matchedSkills || []).map(s => s.toLowerCase()).includes(skill.toLowerCase());
                              return (
                                <span key={skill} className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                                  isMatched
                                    ? "border-[#00C7A7]/25 bg-[#F0FDFA] text-[#008F7A]"
                                    : "border-red-100 bg-red-50/50 text-red-400"
                                }`}>
                                  {isMatched ? <LuCircleCheck size={10} /> : <LuCircleX size={10} />}
                                  {skill}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right: match ring + breakdown */}
                        <div className="flex shrink-0 flex-col items-center gap-3 sm:w-36">
                          <MatchBadge score={job.match.totalScore} />
                          <div className="w-full space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2">
                            {[
                              { label: "Skills", value: job.match.skillOverlapScore, color: "#6366F1" },
                              { label: "Readiness", value: job.match.readinessScore, color: "#0F9D74" },
                              { label: "Verified", value: job.match.verificationScore, color: "#D4A84F" },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center gap-2">
                                <span className="w-14 text-[9px] font-bold text-slate-400">{item.label}</span>
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color }} />
                                </div>
                                <span className="min-w-[24px] text-right text-[9px] font-extrabold text-slate-500">{item.value}%</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-[#008F7A]">{job.match.matchedSkills?.length || 0} matched</p>
                            <p className="text-[10px] font-bold text-red-400">{job.match.missingSkills?.length || 0} missing</p>
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
