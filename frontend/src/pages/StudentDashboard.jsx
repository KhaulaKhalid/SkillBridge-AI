import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight,
  LuBriefcase,
  LuBriefcaseBusiness,
  LuCircleCheck,
  LuCompass,
  LuFileText,
  LuLightbulb,
  LuShieldCheck,
  LuShieldX,
  LuCircleAlert,
  LuSparkles,
  LuTarget,
  LuUser,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { readCache, writeCache, CACHE_KEYS } from "../api/cache.js";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

const evidenceMini = {
  verified: { icon: LuShieldCheck, bg: "bg-[#F0FDFA]", border: "border-[#00C7A7]/30", text: "text-[#008F7A]", label: "Verified" },
  partial: { icon: LuCircleAlert, bg: "bg-[#FFFBEA]", border: "border-[#D4A84F]/35", text: "text-[#9A7220]", label: "Partial" },
  claim_only: { icon: LuShieldX, bg: "bg-red-50", border: "border-red-200", text: "text-red-400", label: "Claim only" },
};

function fitColor(score) {
  if (score >= 75) return "text-[#0F9D74]";
  if (score >= 50) return "text-[#B68529]";
  return "text-slate-500";
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const cached = readCache(CACHE_KEYS.DASHBOARD);
  const [profile, setProfile] = useState(cached?.profile ?? null);
  const [matches, setMatches] = useState(cached?.matches ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      try {
        const [profileRes, matchesRes] = await Promise.all([
          api.get("/student/profile"),
          api.get("/student/career-match").catch(() => ({ data: { matches: [] } })),
        ]);
        if (cancelled) return;
        const freshProfile = profileRes.data.profile;
        const freshMatches = matchesRes.data.matches || [];
        setProfile(freshProfile);
        setMatches(freshMatches);
        writeCache(CACHE_KEYS.DASHBOARD, { profile: freshProfile, matches: freshMatches });
      } catch {
        if (!cached) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  const hasProfileSignals = Boolean(
    profile?.skills?.length || profile?.interests?.length || profile?.goals?.targetRole
  );
  const topMatches = matches.slice(0, 3);
  const verifiedCount = matches.filter((m) => m.evidenceLevel === "verified").length;
  const claimOnlyCount = matches.filter((m) => m.evidenceLevel === "claim_only").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Overview" />
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

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A84F]/35 bg-[#FFFBEA] px-4 py-2 text-xs font-extrabold text-[#9A7220]">
                  <LuSparkles size={14} /> STUDENT OVERVIEW
                </div>
                <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">
                  Welcome back, <span className="text-[#D4A84F]">{user?.name?.split(" ")[0]}</span>
                </h1>
                <p className="mt-2 text-sm text-slate-500">Build evidence, explore career paths, and move toward your next role.</p>
              </div>
              <Link to="/student/profile" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 transition hover:border-[#D4A84F]/40 hover:bg-[#FFFBEA]">
                <LuUser size={14} /> Edit profile
              </Link>
            </section>

            {loading ? (
              <div className={`${cardClass} flex items-center justify-center py-20`}>
                <span className="h-8 w-8 animate-spin rounded-full border-3 border-[#D4A84F]/30 border-t-[#D4A84F]" />
              </div>
            ) : (
              <>
                {!hasProfileSignals && (
                  <section className="mb-6 rounded-2xl border border-amber-200 bg-[#FFFBEA] p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-sm font-extrabold text-[#9A7220]">Complete your profile to unlock accurate matches</h2>
                        <p className="mt-1 text-xs leading-5 text-amber-700/80">Add skills, interests, and career goals so the Career Compass can rank roles for you.</p>
                      </div>
                      <Link to="/student/profile" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#D4A84F] px-4 py-2.5 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]">
                        Complete profile <LuArrowRight size={13} />
                      </Link>
                    </div>
                  </section>
                )}

                <section className={`${cardClass} mb-6 overflow-hidden`}>
                  <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-r from-[#FFFBEA] to-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D4A84F] text-white"><LuCompass size={19} /></div>
                      <div>
                        <h2 className="text-lg font-extrabold text-[#101828]">Career Compass</h2>
                        <p className="mt-1 text-xs leading-5 text-slate-500">Evidence-weighted ranking against active Pakistan-focused jobs.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {matches.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-extrabold">
                          {verifiedCount > 0 && <span className="text-[#008F7A]">{verifiedCount} verified</span>}
                          {claimOnlyCount > 0 && <span className="text-red-400">{claimOnlyCount} claim only</span>}
                        </div>
                      )}
                      <Link to="/student/career-match" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold text-[#B68529] hover:underline">
                        View full ranking <LuArrowRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {topMatches.length ? (
                    <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                      {topMatches.map((match, index) => {
                        const ev = evidenceMini[match.evidenceLevel] || evidenceMini.claim_only;
                        const EvIcon = ev.icon;
                        return (
                          <Link key={match.category} to="/student/career-match" className="p-5 transition hover:bg-slate-50/70">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-black text-slate-500">#{index + 1}</span>
                              <span className={`text-xl font-black ${fitColor(match.fitScore)}`}>{match.fitScore}%</span>
                            </div>
                            <h3 className="text-sm font-extrabold text-[#101828]">{match.category}</h3>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold ${ev.border} ${ev.bg} ${ev.text}`}>
                                <EvIcon size={9} /> {ev.label}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">{match.postingCount} role{match.postingCount === 1 ? "" : "s"}</span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1">
                              {(match.topSkills || []).slice(0, 3).map((skill) => <span key={skill} className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${
                                (match.verifiedSkills || []).map(s => s.toLowerCase()).includes(skill.toLowerCase())
                                  ? "border-[#00C7A7]/25 bg-[#F0FDFA] text-[#008F7A]"
                                  : "border-slate-200 bg-white text-slate-500"
                              }`}>{skill}</span>)}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm font-semibold text-slate-500">Add your profile signals, then open Career Compass to see ranked career paths.</p>
                      <Link to="/student/career-match" className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#B68529] hover:underline">Open Career Compass <LuArrowRight size={13} /></Link>
                    </div>
                  )}
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                  <section className={`${cardClass} p-5 sm:p-6`}>
                    <div className="mb-4 flex items-center gap-2"><LuTarget size={16} className="text-[#D4A84F]" /><h2 className="text-sm font-extrabold text-[#101828]">Your matching signals</h2></div>
                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Skills</p>
                        <div className="flex flex-wrap gap-1.5">{profile?.skills?.length ? profile.skills.slice(0, 10).map((skill) => <span key={skill} className="rounded-md border border-[#00C7A7]/25 bg-[#F0FDFA] px-2 py-1 text-[11px] font-bold text-[#008F7A]">{skill}</span>) : <span className="text-xs text-slate-400">No skills added yet</span>}</div>
                      </div>
                      <div>
                        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Interests</p>
                        <div className="flex flex-wrap gap-1.5">{profile?.interests?.length ? profile.interests.slice(0, 8).map((interest) => <span key={interest} className="rounded-md border border-[#D4A84F]/30 bg-[#FFFBEA] px-2 py-1 text-[11px] font-bold text-[#9A7220]">{interest}</span>) : <span className="text-xs text-slate-400">No interests added yet</span>}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Target role</p><p className="mt-1 text-sm font-bold text-slate-700">{profile?.goals?.targetRole || "Not set yet"}</p></div>
                    </div>
                  </section>

                  <section className={`${cardClass} p-5 sm:p-6`}>
                    <div className="mb-4 flex items-center gap-2"><LuLightbulb size={16} className="text-[#D4A84F]" /><h2 className="text-sm font-extrabold text-[#101828]">Next best steps</h2></div>
                    <div className="space-y-3">
                      <Link to="/student/skill-verification" className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-[#D4A84F]/30 hover:bg-[#FFFBEA]/50"><LuShieldCheck size={16} className="mt-0.5 text-[#B68529]" /><span><b className="block text-xs text-slate-700">Verify your skills</b><span className="mt-0.5 block text-[11px] leading-4 text-slate-400">Take quizzes and coding challenges to prove your skills.</span></span></Link>
                      <Link to="/student/job-readiness" className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-[#D4A84F]/30 hover:bg-[#FFFBEA]/50"><LuFileText size={16} className="mt-0.5 text-[#B68529]" /><span><b className="block text-xs text-slate-700">Job Ready + Roadmap</b><span className="mt-0.5 block text-[11px] leading-4 text-slate-400">See your unified score and a milestone-based learning roadmap.</span></span></Link>
                      <Link to="/student/career-match" className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-[#D4A84F]/30 hover:bg-[#FFFBEA]/50"><LuCompass size={16} className="mt-0.5 text-[#B68529]" /><span><b className="block text-xs text-slate-700">Explore career paths</b><span className="mt-0.5 block text-[11px] leading-4 text-slate-400">See evidence-weighted rankings from active market data.</span></span></Link>
                      <Link to="/student/job-matches" className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition hover:border-[#D4A84F]/30 hover:bg-[#FFFBEA]/50"><LuBriefcase size={16} className="mt-0.5 text-[#B68529]" /><span><b className="block text-xs text-slate-700">View job matches</b><span className="mt-0.5 block text-[11px] leading-4 text-slate-400">Active job postings ranked by how well you fit.</span></span></Link>
                    </div>
                  </section>
                </div>
              </>
            )}
            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}
