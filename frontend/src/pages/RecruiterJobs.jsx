import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LuPlus, LuPencil, LuTrash2, LuX, LuMapPin, LuClock, LuBriefcase, LuTrendingUp, LuSparkles, LuEye, LuChevronDown, LuChevronUp } from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10";
const selectClass = inputClass;

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Remote", "Contract"];

export default function RecruiterJobs() {
  const navigate = useNavigate();
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", employmentType: "Full-time" });

  useEffect(() => { loadPostings(); }, []);

  const loadPostings = async () => {
    try {
      const res = await api.get("/recruiter/job-postings");
      setPostings(res.data.postings || []);
    } catch { toast.error("Failed to load job postings"); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ title: "", description: "", location: "", employmentType: "Full-time" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title?.trim() || !form.description?.trim()) { toast.error("Title and description are required"); return; }
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/recruiter/job-postings/${editingId}`, form);
        toast.success("Job posting updated!");
      } else {
        await api.post("/recruiter/job-postings", form);
        toast.success("Job posting created! AI is extracting skills...");
      }
      resetForm();
      loadPostings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save posting");
    } finally { setSubmitting(false); }
  };

  const handleEdit = (posting) => {
    setForm({ title: posting.title, description: posting.rawDescription, location: posting.location || "", employmentType: posting.employmentType || "Full-time" });
    setEditingId(posting._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      await api.patch(`/recruiter/job-postings/${id}/status`, { status: newStatus });
      toast.success(`Posting ${newStatus === "closed" ? "closed" : "reopened"}`);
      loadPostings();
    } catch { toast.error("Failed to update status"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job posting permanently?")) return;
    try {
      await api.delete(`/recruiter/job-postings/${id}`);
      toast.success("Posting deleted");
      loadPostings();
    } catch { toast.error("Failed to delete posting"); }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  const statusBadge = { active: "bg-emerald-100 text-emerald-700", closed: "bg-slate-100 text-slate-500", pending: "bg-amber-100 text-amber-700" };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="recruiter" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Job Postings" />
        <main className="relative flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#101828]">Job Postings</h1>
                <p className="mt-1 text-sm text-slate-500">{postings.length} total posting{postings.length === 1 ? "" : "s"}</p>
              </div>
              {!showForm && (
                <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#5558E6]">
                  <LuPlus size={16} /> New posting
                </button>
              )}
            </div>

            {/* Create/Edit form */}
            {showForm && (
              <section className={`${cardClass} mb-6 p-5 sm:p-6`}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-[#101828]">{editingId ? "Edit posting" : "Create a new posting"}</h2>
                  <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><LuX size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Job title *</label>
                      <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior React Developer" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-slate-700">Location</label>
                      <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Lahore, Remote" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Employment type</label>
                    <select className={selectClass} value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}>
                      {EMPLOYMENT_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700">Job description *</label>
                    <textarea className={`${inputClass} min-h-[160px] resize-y`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, responsibilities, required skills, qualifications..." />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#5558E6] disabled:opacity-60">
                      {submitting ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving...</>) : (<><LuSparkles size={15} /> {editingId ? "Update posting" : "Create posting"}</>)}
                    </button>
                    <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50">Cancel</button>
                  </div>
                </form>
              </section>
            )}

            {/* Postings list */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#6366F1]/30 border-t-[#6366F1]" />
              </div>
            ) : postings.length === 0 ? (
              <div className={`${cardClass} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><LuBriefcase size={26} /></div>
                <p className="text-sm font-semibold text-slate-400">No job postings yet</p>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="text-xs font-bold text-[#6366F1] hover:underline">Create your first posting</button>
              </div>
            ) : (
              <div className="space-y-3">
                {postings.map((p) => {
                  const isExpanded = expandedId === p._id;
                  return (
                    <div key={p._id} className={cardClass}>
                      <div className="flex items-start gap-4 p-5 sm:p-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-base font-extrabold text-[#101828]">{p.title}</h3>
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusBadge[p.status] || statusBadge.pending}`}>{p.status}</span>
                            {p.extractionStatus === "pending" && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700"><LuSparkles size={10} className="inline animate-spin" /> AI extracting...</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                            {p.location && <span className="inline-flex items-center gap-1"><LuMapPin size={11} />{p.location}</span>}
                            {p.employmentType && <span className="inline-flex items-center gap-1"><LuClock size={11} />{p.employmentType}</span>}
                            {p.category !== "Uncategorized" && <span className="inline-flex items-center gap-1"><LuTrendingUp size={11} />{p.category}</span>}
                            <span>{formatDate(p.createdAt)}</span>
                          </div>
                          {p.extractedSkills?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {p.extractedSkills.map((s) => (
                                <span key={s} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button onClick={() => handleEdit(p)} title="Edit" className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"><LuPencil size={14} /></button>
                          <button onClick={() => handleStatusToggle(p._id, p.status)} title={p.status === "active" ? "Close" : "Reopen"} className={`rounded-lg border p-2 text-xs font-bold ${p.status === "active" ? "border-amber-200 text-amber-600 hover:bg-amber-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}>
                            {p.status === "active" ? "Close" : "Reopen"}
                          </button>
                          <button onClick={() => handleDelete(p._id)} title="Delete" className="rounded-lg border border-red-200 p-2 text-red-400 hover:bg-red-50 hover:text-red-600"><LuTrash2 size={14} /></button>
                          <button onClick={() => navigate(`/recruiter/candidates?jobId=${p._id}`)} title="Find candidates" className="rounded-lg bg-[#6366F1] px-3 py-2 text-[11px] font-extrabold text-white hover:bg-[#5558E6]">
                            <LuEye size={14} className="inline mr-1" />Candidates
                          </button>
                        </div>
                      </div>
                      {/* Expandable description */}
                      <div className="border-t border-slate-100">
                        <button onClick={() => setExpandedId(isExpanded ? null : p._id)} className="flex w-full items-center justify-center gap-1 py-2 text-[11px] font-bold text-slate-400 hover:text-slate-600">
                          {isExpanded ? (<><LuChevronUp size={12} />Hide description</>) : (<><LuChevronDown size={12} />View description</>)}
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                            <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs text-slate-600 leading-5 font-sans">{p.rawDescription}</pre>
                            {p.salaryRange?.min && (
                              <p className="mt-2 text-xs text-slate-500">Salary: PKR {p.salaryRange.min?.toLocaleString()} - {p.salaryRange.max?.toLocaleString() || "Negotiable"}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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