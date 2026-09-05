import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LuUsers, LuFileText, LuShieldCheck, LuTarget, LuBriefcase, LuUser, LuTrendingUp, LuArrowRight, LuCircleCheck } from "react-icons/lu";
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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  const roleBadge = { student: "bg-blue-100 text-blue-700", recruiter: "bg-purple-100 text-purple-700", admin: "bg-red-100 text-red-700" };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="admin" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Admin Panel" />
        <main className="relative flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>
          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-extrabold text-red-600">
                <LuShieldCheck size={13} /> ADMIN PANEL
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#101828]">Welcome, {user?.name?.split(" ")[0]}</h1>
              <p className="mt-1 text-sm text-slate-500">Platform overview and management</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-red-300 border-t-red-600" />
              </div>
            ) : (
              <>
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={LuUser} label="Students" value={stats?.totalStudents || 0} color="#3B82F6" to="/admin/users?role=student" />
                  <StatCard icon={LuBriefcase} label="Recruiters" value={stats?.totalRecruiters || 0} color="#8B5CF6" to="/admin/users?role=recruiter" />
                  <StatCard icon={LuFileText} label="Job Postings" value={stats?.totalPostings || 0} color="#0F9D74" to="/admin/jobs" />
                  <StatCard icon={LuCircleCheck} label="Active Jobs" value={stats?.activePostings || 0} color="#D4A84F" to="/admin/jobs?status=active" />
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard icon={LuShieldCheck} label="Quiz Attempts" value={stats?.totalQuizAttempts || 0} color="#EF4444" />
                  <StatCard icon={LuTarget} label="Readiness Analyses" value={stats?.totalReadiness || 0} color="#6366F1" />
                  <StatCard icon={LuUsers} label="Completed Profiles" value={stats?.totalProfiles || 0} color="#00C7A7" />
                  <StatCard icon={LuShieldCheck} label="Admins" value={stats?.totalAdmins || 0} color="#94A3B8" />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Recent Users */}
                  <section className={cardClass}>
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                      <h2 className="text-sm font-extrabold text-[#101828]">Recent Registrations</h2>
                      <Link to="/admin/users" className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">View all <LuArrowRight size={12} /></Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(stats?.recentUsers || []).map((u) => (
                        <div key={u._id} className="flex items-center gap-3 px-5 py-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500">{u.name?.charAt(0)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#101828] truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${roleBadge[u.role]}`}>{u.role}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Category Distribution */}
                  <section className={cardClass}>
                    <div className="border-b border-slate-100 px-5 py-4">
                      <h2 className="text-sm font-extrabold text-[#101828]">Postings by Category</h2>
                    </div>
                    <div className="p-5 space-y-3">
                      {(stats?.categoryStats || []).map((c) => {
                        const maxCount = Math.max(...(stats?.categoryStats || []).map(s => s.count), 1);
                        const pct = Math.round((c.count / maxCount) * 100);
                        return (
                          <div key={c._id}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-600">{c._id}</span>
                              <span className="font-black text-slate-800">{c.count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-red-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      {(!stats?.categoryStats || stats.categoryStats.length === 0) && (
                        <p className="text-xs text-slate-400 text-center py-4">No job postings yet</p>
                      )}
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