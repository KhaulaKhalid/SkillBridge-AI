import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  LuTrash2,
  LuPlus,
  LuUpload,
  LuFileText,
  LuSparkles,
  LuUser,
  LuGraduationCap,
  LuCheck,
  LuExternalLink,
  LuBriefcaseBusiness,
  LuTarget,
  LuHeart,
  LuGithub,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";
import { readCache, writeCache, clearCache, clearAllStudentCaches, CACHE_KEYS } from "../api/cache.js";

const emptyEducation = { institute: "", degree: "", startYear: "", endYear: "" };

const SUGGESTED_INTERESTS = [
  "Web Development",
  "Mobile App Development",
  "Data Science",
  "AI / Machine Learning",
  "Cybersecurity",
  "Cloud / DevOps",
  "UI/UX Design",
  "Digital Marketing",
  "Game Development",
  "Business Analysis",
];

const SALARY_RANGES = [
  "Below PKR 50,000",
  "PKR 50,000 - 100,000",
  "PKR 100,000 - 150,000",
  "PKR 150,000 - 250,000",
  "PKR 250,000+",
];

const GROWTH_PREFERENCES = [
  "Fast-paced startup",
  "Stable corporate environment",
  "Remote / freelance flexibility",
  "Government / public sector",
  "Not sure yet",
];

const JOB_TIMELINES = [
  "Within 3 months",
  "3-6 months",
  "6-12 months",
  "After 1 year",
  "Just exploring options",
];

const normalizeProfile = (p = {}) => ({
  ...p,
  headline: p.headline || "",
  bio: p.bio || "",
  skills: Array.isArray(p.skills) ? p.skills : [],
  softSkills: Array.isArray(p.softSkills) ? p.softSkills : [],
  interests: Array.isArray(p.interests) ? p.interests : [],
  education: Array.isArray(p.education) ? p.education : [],
  resumeUrl: p.resumeUrl || "",
  githubUsername: p.githubUsername || "",
  goals: {
    targetRole: p.goals?.targetRole || "",
    salaryRange: p.goals?.salaryRange || "",
    growthPreference: p.goals?.growthPreference || "",
    timeline: p.goals?.timeline || "",
  },
});

function completion(profile) {
  const checks = [
    !!profile.headline?.trim(),
    !!profile.bio?.trim(),
    profile.skills?.length > 0,
    profile.softSkills?.length > 0,
    profile.interests?.length > 0,
    !!profile.goals?.salaryRange && !!profile.goals?.timeline,
    profile.education?.length > 0,
    !!profile.githubUsername?.trim(),
    !!profile.resumeUrl,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition placeholder:text-slate-400 focus:border-[#D4A84F] focus:ring-4 focus:ring-[#D4A84F]/10";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#101828] outline-none transition focus:border-[#D4A84F] focus:ring-4 focus:ring-[#D4A84F]/10";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

const addButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4A84F]/40 bg-[#FFFBEA] px-4 py-2.5 text-xs font-extrabold text-[#8C6A22] transition hover:border-[#D4A84F] hover:bg-[#D4A84F]/15";

export default function StudentProfile() {
  const cached = readCache(CACHE_KEYS.STUDENT_PROFILE);
  const [loading, setLoading] = useState(!cached);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(cached ? normalizeProfile(cached) : null);
  const [skillInput, setSkillInput] = useState("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    let mounted = true;
    api
      .get("/student/profile")
      .then((res) => {
        if (mounted) {
          const fresh = normalizeProfile(res.data.profile);
          setProfile(fresh);
          writeCache(CACHE_KEYS.STUDENT_PROFILE, res.data.profile);
        }
      })
      .catch(() => toast.error("Couldn't load your profile"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (profile.skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setProfile((p) => ({ ...p, skills: [...p.skills, value] }));
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const addSoftSkill = () => {
    const value = softSkillInput.trim();
    if (!value) return;
    if (profile.softSkills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setSoftSkillInput("");
      return;
    }
    setProfile((p) => ({ ...p, softSkills: [...p.softSkills, value] }));
    setSoftSkillInput("");
  };

  const removeSoftSkill = (skill) =>
    setProfile((p) => ({ ...p, softSkills: p.softSkills.filter((s) => s !== skill) }));

  const addInterest = (value) => {
    const v = (value ?? interestInput).trim();
    if (!v) return;
    if (profile.interests.some((i) => i.toLowerCase() === v.toLowerCase())) {
      setInterestInput("");
      return;
    }
    setProfile((p) => ({ ...p, interests: [...p.interests, v] }));
    setInterestInput("");
  };

  const removeInterest = (interest) =>
    setProfile((p) => ({ ...p, interests: p.interests.filter((i) => i !== interest) }));

  const toggleSuggestedInterest = (interest) => {
    const exists = profile.interests.some((i) => i.toLowerCase() === interest.toLowerCase());
    if (exists) {
      removeInterest(interest);
    } else {
      addInterest(interest);
    }
  };

  const updateGoal = (field, value) =>
    setProfile((p) => ({ ...p, goals: { ...p.goals, [field]: value } }));

  const updateEducation = (index, field, value) => {
    setProfile((p) => {
      const education = [...p.education];
      education[index] = { ...education[index], [field]: value };
      return { ...p, education };
    });
  };

  const addEducation = () =>
    setProfile((p) => ({ ...p, education: [...p.education, { ...emptyEducation }] }));

  const removeEducation = (index) =>
    setProfile((p) => ({ ...p, education: p.education.filter((_, i) => i !== index) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        headline: profile.headline,
        bio: profile.bio,
        skills: profile.skills,
        softSkills: profile.softSkills,
        interests: profile.interests,
        goals: profile.goals,
        education: profile.education,
        githubUsername: profile.githubUsername.trim(),
      };
      const res = await api.put("/student/profile", payload);
      setProfile(normalizeProfile(res.data.profile));
      writeCache(CACHE_KEYS.STUDENT_PROFILE, res.data.profile);
      clearAllStudentCaches();
      toast.success(res.data.message || "Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      e.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    setUploading(true);
    try {
      const res = await api.post("/student/profile/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(normalizeProfile(res.data.profile));
      writeCache(CACHE_KEYS.STUDENT_PROFILE, res.data.profile);
      clearAllStudentCaches();
      toast.success(res.data.message || "Resume uploaded successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't upload your resume");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar role="student" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header title="My Profile" />
          <main className="flex flex-1 items-center justify-center bg-[#F8FAFC]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#D4A84F]">
                <LuSparkles size={20} className="animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const pct = completion(profile);
  const apiOrigin = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="My Profile" />

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

          <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A84F]/35 bg-[#FFFBEA] px-4 py-2 text-xs font-extrabold text-[#9A7220]">
                <LuSparkles size={14} /> CAREER PROFILE
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">
                Build your <span className="text-[#D4A84F]">SkillBridge</span> profile
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Keep your skills, education, GitHub and resume updated to improve your AI-powered job matching.
              </p>
            </div>

            {/* Completion */}
            <section className={`${cardClass} mb-6 overflow-hidden`}>
              <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFFBEA] text-[#D4A84F]">
                    <LuSparkles size={19} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#101828]">Profile completeness</h2>
                    <p className="mt-1 text-xs text-slate-500">Complete profiles get matched with more relevant opportunities.</p>
                  </div>
                </div>
                <div className="flex w-full items-center gap-4 lg:max-w-sm">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#C99532] to-[#E2B95F] transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="min-w-[42px] text-right text-sm font-black text-[#B68529]">{pct}%</span>
                </div>
              </div>
              <div className={pct === 100 ? "flex items-center gap-2 border-t border-slate-100 bg-[#F0FDFA] px-5 py-3 text-xs font-semibold text-[#008F7A] sm:px-6" : "border-t border-slate-100 bg-[#FFFBEA] px-5 py-3 text-xs font-medium text-[#8C6A22] sm:px-6"}>
                {pct === 100 ? <><LuCheck size={15} /> Your profile is complete and ready for better job matching.</> : "Complete the remaining sections to improve your AI job recommendations."}
              </div>
            </section>

            {/* About */}
            <section className={`${cardClass} mb-6 p-5 sm:p-7`}>
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFFBEA] text-[#B68529]"><LuUser size={19} /></div>
                <div><h2 className="text-base font-extrabold sm:text-lg">About you</h2><p className="mt-1 text-xs leading-5 text-slate-500">Tell recruiters who you are and what you're looking for.</p></div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label htmlFor="headline" className="mb-2 block text-xs font-bold text-slate-700">Professional headline</label>
                  <input id="headline" className={inputClass} placeholder="e.g. Final-year CS student" value={profile.headline} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} />
                  <p className="mt-2 text-[11px] text-slate-400">A short title recruiters can quickly understand.</p>
                </div>
                <div>
                  <label htmlFor="bio" className="mb-2 block text-xs font-bold text-slate-700">About / Bio</label>
                  <textarea id="bio" rows={5} className={`${inputClass} resize-y leading-6`} placeholder="Describe your background, interests and the type of opportunities you're looking for..." value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                </div>
              </div>
            </section>

            {/* Skills */}
            <div className="mb-6 grid gap-6 lg:grid-cols-2">
              <section className={`${cardClass} p-5 sm:p-6`}>
                <div className="mb-6 flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFFBEA] text-[#B68529]"><LuSparkles size={19} /></div><div><h2 className="text-base font-extrabold">Technical skills</h2><p className="mt-1 text-xs leading-5 text-slate-500">Your tools, technologies and technical expertise.</p></div></div>
                <div className="mb-4 flex gap-2"><input className={inputClass} placeholder="e.g. React" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} /><button type="button" onClick={addSkill} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#D4A84F] px-4 py-3 text-xs font-extrabold text-[#101828] transition hover:bg-[#E2B95F]"><LuPlus size={14} /> Add</button></div>
                <div className="flex flex-wrap gap-2">{profile.skills.length === 0 ? <span className="text-xs text-slate-400">No technical skills added yet.</span> : profile.skills.map((skill) => <span key={skill} className="inline-flex items-center gap-2 rounded-lg border border-[#D4A84F]/25 bg-[#FFFBEA] px-3 py-1.5 text-xs font-bold text-[#8C6A22]">{skill}<button type="button" onClick={() => removeSkill(skill)} className="text-[#B68529] hover:text-red-500">×</button></span>)}</div>
              </section>

              <section className={`${cardClass} p-5 sm:p-6`}>
                <div className="mb-6 flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#00A98F]"><LuUser size={19} /></div><div><h2 className="text-base font-extrabold">Soft skills</h2><p className="mt-1 text-xs leading-5 text-slate-500">Show the qualities that make you effective at work.</p></div></div>
                <div className="mb-4 flex gap-2"><input className={`${inputClass} focus:border-[#00C7A7] focus:ring-[#00C7A7]/10`} placeholder="e.g. Communication" value={softSkillInput} onChange={(e) => setSoftSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSoftSkill())} /><button type="button" onClick={addSoftSkill} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#101828] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#1B2638]"><LuPlus size={14} /> Add</button></div>
                <div className="flex flex-wrap gap-2">{profile.softSkills.length === 0 ? <span className="text-xs text-slate-400">No soft skills added yet.</span> : profile.softSkills.map((skill) => <span key={skill} className="inline-flex items-center gap-2 rounded-lg border border-[#00C7A7]/20 bg-[#F0FDFA] px-3 py-1.5 text-xs font-bold text-[#008F7A]">{skill}<button type="button" onClick={() => removeSoftSkill(skill)} className="text-[#00A98F] hover:text-red-500">×</button></span>)}</div>
              </section>
            </div>

            {/* Interests */}
            <section className={`${cardClass} mb-6 p-5 sm:p-7`}>
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDF2F8] text-[#C2438A]"><LuHeart size={19} /></div>
                <div>
                  <h2 className="text-base font-extrabold sm:text-lg">Career interests</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">If you're multi-talented, add every field you're curious about — our AI will help you find where they overlap with real market demand.</p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {SUGGESTED_INTERESTS.map((interest) => {
                  const active = profile.interests.some((i) => i.toLowerCase() === interest.toLowerCase());
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleSuggestedInterest(interest)}
                      className={
                        active
                          ? "inline-flex items-center gap-1.5 rounded-full border border-[#C2438A] bg-[#FDF2F8] px-3.5 py-2 text-xs font-bold text-[#C2438A] transition"
                          : "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-500 transition hover:border-[#C2438A]/40 hover:text-[#C2438A]"
                      }
                    >
                      {active && <LuCheck size={13} />} {interest}
                    </button>
                  );
                })}
              </div>

              <div className="mb-4 flex gap-2">
                <input
                  className={`${inputClass} focus:border-[#C2438A] focus:ring-[#C2438A]/10`}
                  placeholder="Add a custom interest..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                />
                <button type="button" onClick={() => addInterest()} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#C2438A] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#D65A9E]">
                  <LuPlus size={14} /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.interests.length === 0 ? (
                  <span className="text-xs text-slate-400">No interests selected yet.</span>
                ) : (
                  profile.interests.map((interest) => (
                    <span key={interest} className="inline-flex items-center gap-2 rounded-lg border border-[#C2438A]/25 bg-[#FDF2F8] px-3 py-1.5 text-xs font-bold text-[#C2438A]">
                      {interest}
                      <button type="button" onClick={() => removeInterest(interest)} className="text-[#C2438A] hover:text-red-500">×</button>
                    </span>
                  ))
                )}
              </div>
            </section>

            {/* Goals */}
            <section className={`${cardClass} mb-6 p-5 sm:p-7`}>
              <div className="mb-7 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]"><LuTarget size={19} /></div>
                <div>
                  <h2 className="text-base font-extrabold sm:text-lg">Career goals</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Help the AI factor in what you actually want, not just what you can do.</p>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label htmlFor="targetRole" className="mb-2 block text-xs font-bold text-slate-700">Target role / career goal</label>
                  <input
                    id="targetRole"
                    className={inputClass}
                    placeholder="e.g. Frontend Developer, Data Analyst"
                    value={profile.goals.targetRole}
                    onChange={(e) => updateGoal("targetRole", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="salaryRange" className="mb-2 block text-xs font-bold text-slate-700">Expected salary range</label>
                  <select id="salaryRange" className={selectClass} value={profile.goals.salaryRange} onChange={(e) => updateGoal("salaryRange", e.target.value)}>
                    <option value="">Select a range</option>
                    {SALARY_RANGES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="growthPreference" className="mb-2 block text-xs font-bold text-slate-700">Growth / work environment preference</label>
                  <select id="growthPreference" className={selectClass} value={profile.goals.growthPreference} onChange={(e) => updateGoal("growthPreference", e.target.value)}>
                    <option value="">Select a preference</option>
                    {GROWTH_PREFERENCES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="timeline" className="mb-2 block text-xs font-bold text-slate-700">When do you want to land a job?</label>
                  <select id="timeline" className={selectClass} value={profile.goals.timeline} onChange={(e) => updateGoal("timeline", e.target.value)}>
                    <option value="">Select a timeline</option>
                    {JOB_TIMELINES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Education */}
            <section className={`${cardClass} mb-6 p-5 sm:p-7`}>
              <div className="mb-6 flex items-start justify-between gap-4"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFFBEA] text-[#B68529]"><LuGraduationCap size={19} /></div><div><h2 className="text-base font-extrabold sm:text-lg">Education</h2><p className="mt-1 text-xs leading-5 text-slate-500">Add your academic background.</p></div></div><button type="button" onClick={addEducation} className={addButtonClass}><LuPlus size={14} /> <span className="hidden sm:inline">Add</span></button></div>
              {profile.education.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-400">No education added yet.</div> : <div className="space-y-4">{profile.education.map((edu, i) => <div key={i} className="relative rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5"><button type="button" onClick={() => removeEducation(i)} className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-500"><LuTrash2 size={15} /></button><div className="grid gap-4 pr-8 md:grid-cols-2"><input className={inputClass} placeholder="University / Institute" value={edu.institute || ""} onChange={(e) => updateEducation(i, "institute", e.target.value)} /><input className={inputClass} placeholder="Degree" value={edu.degree || ""} onChange={(e) => updateEducation(i, "degree", e.target.value)} /><input className={inputClass} type="number" placeholder="Start year" value={edu.startYear || ""} onChange={(e) => updateEducation(i, "startYear", e.target.value)} /><input className={inputClass} type="number" placeholder="End year / Expected" value={edu.endYear || ""} onChange={(e) => updateEducation(i, "endYear", e.target.value)} /></div></div>)}</div>}
            </section>

            {/* GitHub */}
            <section className={`${cardClass} mb-6 p-5 sm:p-7`}>
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white"><LuGithub size={19} /></div>
                <div>
                  <h2 className="text-base font-extrabold sm:text-lg">GitHub</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Connect your GitHub username — SkillBridge analyzes your public repositories as real evidence of your skills, not just claims.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label htmlFor="githubUsername" className="mb-2 block text-xs font-bold text-slate-700">GitHub username</label>
                  <input
                    id="githubUsername"
                    className={inputClass}
                    placeholder="e.g. octocat"
                    value={profile.githubUsername}
                    onChange={(e) => setProfile({ ...profile, githubUsername: e.target.value })}
                  />
                  <p className="mt-2 text-[11px] text-slate-400">Only public repositories are analyzed.</p>
                </div>
                {profile.githubUsername?.trim() && (
                  <a
                    href={`https://github.com/${profile.githubUsername.trim()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 hover:border-[#D4A84F]/40 hover:bg-[#FFFBEA]"
                  >
                    <LuExternalLink size={14} /> View profile
                  </a>
                )}
              </div>
            </section>

            {/* Resume */}
            <section className={`${cardClass} mb-6 overflow-hidden`}>
              <div className="p-5 sm:p-7"><div className="mb-6 flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFFBEA] text-[#B68529]"><LuFileText size={19} /></div><div><h2 className="text-base font-extrabold sm:text-lg">Resume</h2><p className="mt-1 text-xs leading-5 text-slate-500">Upload your resume for AI analysis and smarter job matching.</p></div></div>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center sm:p-8"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFFBEA] text-[#B68529]"><LuFileText size={23} /></div>{profile.resumeUrl ? <><p className="text-sm font-extrabold">Your resume is uploaded</p><p className="mt-1 text-xs text-slate-500">You can view it or upload a new version.</p><div className="mt-5 flex flex-wrap justify-center gap-3"><a href={`${apiOrigin}${profile.resumeUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-[#D4A84F]/40 hover:bg-[#FFFBEA]"><LuExternalLink size={14} /> View resume</a><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#D4A84F] px-4 py-2.5 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]"><LuUpload size={14} /> {uploading ? "Uploading..." : "Replace resume"}<input type="file" accept="application/pdf" onChange={handleResumeChange} className="hidden" disabled={uploading} /></label></div></> : <><p className="text-sm font-extrabold">Upload your resume</p><p className="mt-1 text-xs text-slate-500">PDF files only. Your resume will be used for AI-powered analysis.</p><label className="mx-auto mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#D4A84F] px-5 py-3 text-xs font-extrabold text-[#101828] hover:bg-[#E2B95F]"><LuUpload size={15} /> {uploading ? "Uploading..." : "Upload PDF"}<input type="file" accept="application/pdf" onChange={handleResumeChange} className="hidden" disabled={uploading} /></label></>}</div>
              </div>
            </section>

            {/* AI tip */}
            <section className="mb-6 overflow-hidden rounded-2xl border border-[#D4A84F]/25 bg-gradient-to-r from-[#FFFBEA] via-white to-white"><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4A84F] text-[#101828]"><LuBriefcaseBusiness size={19} /></div><div><h3 className="text-sm font-extrabold text-[#101828]">Build a stronger career profile</h3><p className="mt-1 text-xs leading-5 text-slate-500">The more complete your profile is, the better SkillBridge AI can understand your skills and recommend relevant opportunities.</p></div></div></section>

            {/* Save */}
            <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div className="hidden items-center gap-2 sm:flex"><div className={`flex h-8 w-8 items-center justify-center rounded-full ${pct === 100 ? "bg-[#F0FDFA] text-[#00C7A7]" : "bg-[#FFFBEA] text-[#D4A84F]"}`}>{pct === 100 ? <LuCheck size={15} /> : <LuSparkles size={15} />}</div><div><p className="text-xs font-bold text-[#101828]">{pct === 100 ? "Profile complete" : "Keep building your profile"}</p><p className="text-[10px] text-slate-500">{pct}% complete</p></div></div><button type="button" onClick={handleSave} disabled={saving} className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4A84F] px-6 py-3 text-sm font-extrabold text-[#101828] shadow-lg shadow-[#D4A84F]/10 transition hover:bg-[#E2B95F] disabled:cursor-not-allowed disabled:opacity-60">{saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#101828]/30 border-t-[#101828]" /> Saving...</> : <><LuCheck size={16} /> Save profile</>}</button></div></div>
            <div className="h-20" />
          </div>
        </main>
      </div>
    </div>
  );
}
