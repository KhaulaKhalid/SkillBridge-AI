import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuTrash2, LuBriefcase, LuMapPin, LuClock, LuTrendingUp, LuRefreshCw } from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";

const CAREER_CATEGORIES = ["Web Development","Mobile App Development","Data Science","AI / Machine Learning","Cybersecurity","Cloud / DevOps","UI/UX Design","Digital Marketing","Game Development","Business Analysis"];
const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";
const selectClass = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500";

export default function AdminJobs() {
  const [searchParams] = useSearchParams();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => { loadJobs(); }, [statusFilter, categoryFilter]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      let url = "/admin/jobs?";
      if (statusFilter !== "all") url += `status=${statusFilter}&`;
      if (categoryFilter !== "all") url += `category=${encodeURIComponent(categoryFilter)}`;
      const res = await api.get(url);
      setPostings(res.data.postings || []);
    } catch { toast.error("Failed to load postings"); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/admin/jobs/${id}/status`, { status: newStatus });
      toast.success(`Posting ${newStatus}`);
      loadJobs();
    } catch { toast.error("Failed to update status"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job posting permanently?")) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      toast.success("Posting deleted");
      loadJobs();
    } catch { toast.error("Failed to delete posting"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  const statusBadge = { active: "bg-emerald-100 text-emerald-700", closed: "bg-slate-100 text-slate-500", pending: "bg-amber-100 text-amber-700" };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="admin" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Job Postings" />
        <main className="relative flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>
          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#101828]">All Job Postings</h1>
                <p className="mt-1 text-sm text-slate-500">{postings.length} posting{postings.length === 1 ? "" : "s"}</p>
              </div>
              <div className="flex gap-2">
                <select className={selectClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                </select>
                <select className={selectClass} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  <option value="all">All categories</option>
                  {CAREER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-red-300 border-t-red-600" />
              </div>
            ) : postings.length === 0 ? (
              <div className={`${cardClass} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center`}>
                <LuBriefcase size={26} className="text-slate-300" />
                <p className="text-sm font-semibold text-slate-400">No postings found</p>
              </div>
            ) : (
              <div className={cardClass}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3">Job</th>
                        <th className="hidden px-5 py-3 sm:table-cell">Recruiter</th>
                        <th className="hidden px-5 py-3 md:table-cell">Category</th>
                        <th className="hidden px-5 py-3 lg:table-cell">Skills</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {postings.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3">
                            <p className="text-sm font-bold text-[#101828]">{p.title}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                              {p.location && <span className="inline-flex items-center gap-0.5"><LuMapPin size={9} />{p.location}</span>}
                              {p.employmentType && <span>{p.employmentType}</span>}
                              <span>{formatDate(p.createdAt)}</span>
                            </div>
                          </td>
                          <td className="hidden px-5 py-3 sm:table-cell">
                            <p className="text-xs font-semibold text-slate-600">{p.recruiter?.name || "—"}</p>
                            <p className="text-[10px] text-slate-400">{p.recruiter?.company || p.recruiter?.email || ""}</p>
                          </td>
                          <td className="hidden px-5 py-3 md:table-cell">
                            <span className="text-xs text-slate-500">{p.category}</span>
                          </td>
                          <td className="hidden px-5 py-3 lg:table-cell">
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(p.extractedSkills || []).slice(0, 3).map((s) => (
                                <span key={s} className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{s}</span>
                              ))}
                              {(p.extractedSkills?.length || 0) > 3 && <span className="text-[10px] text-slate-400">+{p.extractedSkills.length - 3}</span>}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <select value={p.status} onChange={(e) => handleStatusChange(p._id, e.target.value)} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 cursor-pointer ${statusBadge[p.status]}`}>
                              <option value="active">active</option>
                              <option value="closed">closed</option>
                            </select>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleDelete(p._id)} className="rounded-lg border border-red-200 p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition">
                              <LuTrash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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