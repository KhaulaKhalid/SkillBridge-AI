import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuSearch, LuUsers, LuCircleCheck, LuCircleX, LuBriefcase, LuGithub, LuGraduationCap, LuTarget, LuShieldCheck, LuStar, LuTrendingUp, LuX, LuRefreshCw } from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";

const CAREER_CATEGORIES = [
  "Web Development", "Mobile App Development", "Data Science",
  "AI / Machine Learning", "Cybersecurity", "Cloud / DevOps",
  "UI/UX Design", "Digital Marketing", "Game Development", "Business Analysis",
];

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";
const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10";

function matchColor(score) {
  if (score >= 70) return { color: "#0F9D74", label: "Strong match", bg: "bg-emerald-50 border-emerald-200" };
  if (score >= 40) return { color: "#D4A84F", label: "Moderate match", bg: "bg-amber-50 border-amber-200" };
  return { color: "#94A3B8", label: "Low match", bg: "bg-slate-50 border-slate-200" };
}

function MatchRing({ score, size = 56 }) {
  const colors = matchColor(score);
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="#F1F5F9" strokeWidth="5" fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={colors.color} strokeWidth="5" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="absolute text-sm font-black" style={{ color: colors.color }}>{score}</span>
    </div>
  );
}

function BreakdownBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-[10px] font-bold text-slate-500">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="w-8 text-right text-[10px] font-black" style={{ color }}>{value}</span>
    </div>
  );
}

export default function RecruiterCandidates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(searchParams.get("jobId") || "");

  useEffect(() => { loadJobPostings(); }, []);

  useEffect(() => {
    const jobId = searchParams.get("jobId");
    const cat = searchParams.get("category");
    if (jobId || cat) { handleSearch(jobId, cat); }
  }, []);

  const loadJobPostings = async () => {
    try {
      const res = await api.get("/recruiter/job-postings");
      setJobPostings((res.data.postings || []).filter((p) => p.status === "active" && p.extractionStatus === "done"));
    } catch {}
  };

  const handleSearch = async (jobId, cat) => {
    setLoading(true); setSearched(true); setCandidates([]);
    try {
      let url = "/recruiter/candidates?";
      if (jobId || selectedJob) { url += `jobId=${jobId || selectedJob}`; }
      else if (cat || category) { url += `category=${encodeURIComponent(cat || category)}`; }
      else { toast.error("Select a category or job posting to search"); setLoading(false); return; }
      const res = await api.get(url);
      setCandidates(res.data.candidates || []);
    } catch (err) { toast.error("Candidate search failed"); }
    finally { setLoading(false); }
  };

  const expBadge = {
    Beginner: "bg-blue-100 text-blue-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced: "bg-emerald-100 text-emerald-700",
    Expert: "bg-purple-100 text-purple-700",
    Unspecified: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="recruiter" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Candidate Search" />
        <main className="relative flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-black text-[#101828]">Find Candidates</h1>
              <p className="mt-1 text-sm text-slate-500">Search students ranked by AI-powered match scoring against your job requirements.</p>
            </div>

            {/* Search controls */}
            <section className={`${cardClass} mb-6 p-5 sm:p-6`}>
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Search by category</label>
                  <select className={selectClass} value={category} onChange={(e) => { setCategory(e.target.value); setSelectedJob(""); }}>
                    <option value="">Select a category</option>
                    {CAREER_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Or match against a job posting</label>
                  <select className={selectClass} value={selectedJob} onChange={(e) => { setSelectedJob(e.target.value); setCategory(""); }}>
                    <option value="">Select a job posting</option>
                    {jobPostings.map((p) => (<option key={p._id} value={p._id}>{p.title} ({p.category})</option>))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => handleSearch()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#5558E6] disabled:opacity-60">
                    {loading ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Searching...</>) : (<><LuSearch size={16} /> Search</>)}
                  </button>
                </div>
              </div>
            </section>

            {/* Results */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#6366F1]/30 border-t-[#6366F1]" />
                <p className="text-sm font-semibold text-slate-400">Scoring candidates...</p>
              </div>
            )}

            {!loading && searched && candidates.length === 0 && (
              <div className={`${cardClass} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><LuUsers size={26} /></div>
                <p className="text-sm font-semibold text-slate-400">No candidates found</p>
                <p className="text-xs text-slate-400">Students need to complete their profiles first.</p>
              </div>
            )}

            {!loading && candidates.length > 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-600">{candidates.length} candidate{candidates.length === 1 ? "" : "s"} found</p>
                  <p className="text-xs text-slate-400">Ranked by match score</p>
                </div>
                <div className="space-y-3">
                  {candidates.map((c, idx) => {
                    const match = c.match;
                    const colors = matchColor(match.totalScore);
                    const isExpanded = expandedCandidate === c.userId;
                    return (
                      <div key={c.userId} className={`${cardClass} overflow-hidden transition hover:shadow-md`}>
                        {/* Main row */}
                        <div className="flex items-center gap-4 p-4 sm:p-5 cursor-pointer" onClick={() => setExpandedCandidate(isExpanded ? null : c.userId)}>
                          <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-400">#{idx + 1}</div>
                          <MatchRing score={match.totalScore} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-extrabold text-[#101828]">{c.name || "Unknown"}</h3>
                              {c.experienceLevel !== "Unspecified" && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${expBadge[c.experienceLevel] || expBadge.Unspecified}`}>
                                  <LuStar size={9} className="inline mr-0.5" />{c.experienceLevel}
                                </span>
                              )}
                            </div>
                            {c.headline && <p className="text-xs text-slate-500 mt-0.5 truncate">{c.headline}</p>}
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {match.matchedSkills.slice(0, 5).map((s) => (
                                <span key={s} className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  <LuCircleCheck size={10} />{s}
                                </span>
                              ))}
                              {match.missingSkills.slice(0, 3).map((s) => (
                                <span key={s} className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500">
                                  <LuCircleX size={10} />{s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-[10px] font-bold" style={{ color: colors.color }}>{colors.label}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              {c.hasCompletedReadiness && <span className="inline-flex items-center gap-0.5"><LuTarget size={9} />{c.readinessScore}</span>}
                              {c.hasCompletedVerification && <span className="inline-flex items-center gap-0.5"><LuShieldCheck size={9} />{c.verificationScore}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                              {/* Match breakdown */}
                              <div>
                                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-slate-500">Match Breakdown</h4>
                                <div className="space-y-2">
                                  <BreakdownBar label="Skills overlap" value={match.skillOverlapScore} color="#0F9D74" />
                                  <BreakdownBar label="Job readiness" value={match.readinessScore} color="#6366F1" />
                                  <BreakdownBar label="Verification" value={match.verificationScore} color="#D4A84F" />
                                  <BreakdownBar label="Experience" value={match.experienceScore} color="#00C7A7" />
                                </div>
                              </div>
                              {/* Candidate info */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-500">Candidate Details</h4>
                                {c.email && <p className="flex items-center gap-2 text-xs text-slate-600"><LuUsers size={12} />{c.email}</p>}
                                {c.githubUsername && <p className="flex items-center gap-2 text-xs text-slate-600"><LuGithub size={12} />github.com/{c.githubUsername}</p>}
                                {c.education?.length > 0 && (
                                  <div className="flex items-start gap-2 text-xs text-slate-600">
                                    <LuGraduationCap size={12} className="mt-0.5 shrink-0" />
                                    <div>{c.education.map((e, i) => (<p key={i}>{e.degree} — {e.institute} ({e.startYear}-{e.endYear || "present"})</p>))}</div>
                                  </div>
                                )}
                                <div>
                                  <p className="mb-1.5 text-[10px] font-bold uppercase text-slate-400">All claimed skills</p>
                                  <div className="flex flex-wrap gap-1">
                                    {(c.skills || []).map((s) => (
                                      <span key={s} className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${match.matchedSkills.map((m) => m.toLowerCase()).includes(s.toLowerCase()) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>{s}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
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