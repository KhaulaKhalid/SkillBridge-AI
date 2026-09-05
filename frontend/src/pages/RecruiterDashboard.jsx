import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuLayoutDashboard, LuBriefcase, LuFileText, LuUsers, LuPlus, LuArrowRight, LuClock, LuCircleCheck, LuTrendingUp } from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

function StatCard({ icon: Icon, label, value, color, to }) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition hover:border-slate-200 hover:shadow-md">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: color + "12" }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-black text-[#101828]">{value}</p>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/recruiter/dashboard-stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

  const statusColors = { active: "bg-emerald-100 text-emerald-700", closed: "bg-slate-100 text-slate-500", pending: "bg-amber-100 text-amber-700" };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="recruiter" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Dashboard" />
        <main className="relative flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>
          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#6366F1]/8 blur-3xl" />

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">
                Welcome, <span className="text-[#6366F1]">{user?.name?.split(" ")[0]}</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm text-slate-500">
                {user?.company ? `${user.company} — ` : ""}Manage your job postings and find the best candidates using AI-powered matching.
              </p>
            </div>

            {/* Quick actions */}
            <div className="mb-8 flex flex-wrap gap-3">
              <Link to="/recruiter/jobs" className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#5558E6]">
                <LuPlus size={16} /> Post a job
              </Link>
              <Link to="/recruiter/candidates" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-[#101828] transition hover:bg-slate-50">
                <LuUsers size={16} /> Search candidates
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#6366F1]/30 border-t-[#6366F1]" />
              </div>
            ) : (
              <>
                {/* Stats grid */}
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={LuFileText} label="Total postings" value={stats?.totalPostings || 0} color="#6366F1" to="/recruiter/jobs" />
                  <StatCard icon={LuCircleCheck} label="Active postings" value={stats?.activePostings || 0} color="#0F9D74" to="/recruiter/jobs" />
                  <StatCard icon={LuUsers} label="Candidates on platform" value={stats?.totalProfiles || 0} color="#D4A84F" to="/recruiter/candidates" />
                  <StatCard icon={LuBriefcase} label="Closed positions" value={stats?.closedPostings || 0} color="#94A3B8" />
                </div>

                {/* Recent postings */}
                <section className={cardClass}>
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                    <h2 className="text-sm font-extrabold text-[#101828]">Recent job postings</h2>
                    <Link to="/recruiter/jobs" className="text-xs font-bold text-[#6366F1] hover:underline flex items-center gap-1">
                      View all <LuArrowRight size={12} />
                    </Link>
                  </div>
                  {stats?.recentPostings?.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {stats.recentPostings.map((p) => (
                        <div key={p._id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-extrabold text-[#101828] truncate">{p.title}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                              {p.location && <span>{p.location}</span>}
                              {p.location && p.employmentType && <span>&middot;</span>}
                              {p.employmentType && <span>{p.employmentType}</span>}
                              {p.category !== "Uncategorized" && (<><span>&middot;</span><span>{p.category}</span></>)}
                            </div>
                            {p.extractedSkills?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {p.extractedSkills.slice(0, 4).map((s) => (
                                  <span key={s} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">{s}</span>
                                ))}
                                {p.extractedSkills.length > 4 && <span className="text-[10px] text-slate-400">+{p.extractedSkills.length - 4} more</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColors[p.status] || statusColors.pending}`}>{p.status}</span>
                            <span className="text-[10px] text-slate-400">{formatDate(p.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <LuFileText size={22} />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">No job postings yet</p>
                      <Link to="/recruiter/jobs" className="text-xs font-bold text-[#6366F1] hover:underline">Create your first posting</Link>
                    </div>
                  )}
                </section>
              </>
            )}
            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}