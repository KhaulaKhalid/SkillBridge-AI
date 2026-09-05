import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { LuSearch, LuTrash2, LuUsers, LuX, LuRefreshCw } from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10";
const selectClass = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500";

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "all");

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let url = "/admin/users?";
      if (roleFilter !== "all") url += `role=${roleFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      setUsers(res.data.users || []);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); loadUsers(); };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success("Role updated");
      loadUsers();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update role"); }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Delete "${name}" and all their data? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`User "${name}" deleted`);
      loadUsers();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to delete user"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  const roleBadge = { student: "bg-blue-100 text-blue-700", recruiter: "bg-purple-100 text-purple-700", admin: "bg-red-100 text-red-700" };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="admin" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="User Management" />
        <main className="relative flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
          </div>
          <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-black text-[#101828]">Users</h1>
                <p className="mt-1 text-sm text-slate-500">{users.length} user{users.length === 1 ? "" : "s"} found</p>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className={`${inputClass} pl-9 w-64`} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <select className={selectClass} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">All roles</option>
                  <option value="student">Students</option>
                  <option value="recruiter">Recruiters</option>
                  <option value="admin">Admins</option>
                </select>
              </form>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-red-300 border-t-red-600" />
              </div>
            ) : users.length === 0 ? (
              <div className={`${cardClass} flex flex-col items-center justify-center gap-4 px-6 py-16 text-center`}>
                <LuUsers size={26} className="text-slate-300" />
                <p className="text-sm font-semibold text-slate-400">No users found</p>
              </div>
            ) : (
              <div className={cardClass}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="hidden px-5 py-3 sm:table-cell">Company / Headline</th>
                        <th className="hidden px-5 py-3 lg:table-cell">Joined</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500 shrink-0">{u.name?.charAt(0)}</div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[#101828] truncate">{u.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-0 cursor-pointer ${roleBadge[u.role]}`}>
                              <option value="student">student</option>
                              <option value="recruiter">recruiter</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="hidden px-5 py-3 sm:table-cell">
                            <span className="text-xs text-slate-500">{u.role === "recruiter" ? (u.company || "—") : (u.profile?.headline || "—")}</span>
                          </td>
                          <td className="hidden px-5 py-3 lg:table-cell">
                            <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleDelete(u._id, u.name)} title="Delete user" className="rounded-lg border border-red-200 p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition">
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