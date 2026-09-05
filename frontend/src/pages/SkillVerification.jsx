import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LuSparkles, LuCode, LuBookOpen, LuCircleCheck, LuBrain, LuPalette,
  LuMegaphone, LuChartBar, LuShield, LuCloud, LuSmartphone, LuGamepad2,
} from "react-icons/lu";
import Sidebar from "../components/Sidebar.jsx";
import Header from "../components/Header.jsx";
import api from "../api/axios.js";
import { readCache, writeCache, CACHE_KEYS } from "../api/cache.js";

const CODING_CATEGORIES = [
  "Web Development", "Mobile App Development", "Data Science",
  "AI / Machine Learning", "Cybersecurity", "Cloud / DevOps", "Game Development",
];

const CATEGORY_ICONS = {
  "Web Development": LuCode , "Mobile App Development": LuSmartphone,
  "Data Science": LuChartBar, "AI / Machine Learning": LuBrain,
  "Cybersecurity": LuShield, "Cloud / DevOps": LuCloud,
  "Game Development": LuGamepad2, "UI/UX Design": LuPalette,
  "Digital Marketing": LuMegaphone, "Business Analysis": LuBookOpen,
};

const cardClass = "rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.05)]";

export default function SkillVerification() {
  const navigate = useNavigate();
  const cached = readCache(CACHE_KEYS.SKILL_VERIFICATION);
  const [history, setHistory] = useState(cached?.history ?? []);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    api.get("/student/quiz/history")
      .then((res) => {
        const fresh = res.data.attempts || [];
        setHistory(fresh);
        writeCache(CACHE_KEYS.SKILL_VERIFICATION, { history: fresh });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getHistoryForCategory = (category) =>
    history.filter((h) => h.category === category);

  const startVerification = (category) => {
    navigate("/student/skill-quiz/" + encodeURIComponent(category));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] text-[#101828]">
      <Sidebar role="student" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Skill Verification" />
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          <div className="pointer-events-none absolute inset-0 opacity-50">
            <div className="h-full w-full" style={{
              backgroundImage: "linear-gradient(rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(16,24,40,0.035) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }} />
          </div>
          <div className="pointer-events-none absolute -right-32 top-10 h-80 w-80 rounded-full bg-[#D4A84F]/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-32 top-[45%] h-72 w-72 rounded-full bg-[#00C7A7]/5 blur-3xl" />

          <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A84F]/35 bg-[#FFFBEA] px-4 py-2 text-xs font-extrabold text-[#9A7220]">
                <LuSparkles size={14} /> SKILL VERIFICATION QUIZ
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl">
                Prove your <span className="text-[#D4A84F]">skills</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Validate your claimed skills with MCQ quizzes and coding challenges.
                Your score contributes to your job-readiness proof.
              </p>
            </div>

            {/* How it works */}
            <section className={cardClass + " mb-6 p-5 sm:p-6"}>
              <h2 className="mb-4 text-sm font-extrabold text-slate-700">How it works</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { n: 1, title: "Pick a category", desc: "Choose any career category", bg: "bg-[#FFFBEA] text-[#B68529]" },
                  { n: 2, title: "Take the quiz", desc: "5 MCQs + coding challenge (coding roles)", bg: "bg-[#F0FDFA] text-[#00A98F]" },
                  { n: 3, title: "Get verified", desc: "Score added to your skill passport", bg: "bg-[#FDF2F8] text-[#C2438A]" },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " + s.bg}>
                      <span className="text-sm font-black">{s.n}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#101828]">{s.title}</p>
                      <p className="text-[11px] text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Coding Categories */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <LuCode size={16} className="text-[#D4A84F]" />
                <h2 className="text-sm font-extrabold text-slate-700">Coding categories</h2>
                <span className="rounded-full bg-[#FFFBEA] px-2 py-0.5 text-[10px] font-bold text-[#9A7220]">Quiz + Code Challenge</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {CODING_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat] || LuCode;
                  const catHistory = getHistoryForCategory(cat);
                  const bestScore = catHistory.length > 0 ? Math.max(...catHistory.map((h) => h.verificationScore)) : null;
                  return (
                    <button key={cat} onClick={() => startVerification(cat)}
                      className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#D4A84F]/40 hover:shadow-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFBEA] text-[#B68529] transition group-hover:bg-[#D4A84F] group-hover:text-[#101828]">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#101828]">{cat}</h3>
                        <p className="mt-0.5 text-[11px] text-slate-400">5 MCQs + Coding challenge</p>
                      </div>
                      {bestScore !== null && (
                        <div className="flex items-center gap-1.5 rounded-full bg-[#F0FDFA] px-2.5 py-1 text-[10px] font-bold text-[#008F7A]">
                          <LuCircleCheck size={12} /> Best: {bestScore}%
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Non-Coding Categories */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <LuBookOpen size={16} className="text-[#00C7A7]" />
                <h2 className="text-sm font-extrabold text-slate-700">Theory categories</h2>
                <span className="rounded-full bg-[#F0FDFA] px-2 py-0.5 text-[10px] font-bold text-[#008F7A]">Quiz only</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {["UI/UX Design", "Digital Marketing", "Business Analysis"].map((cat) => {
                  const Icon = CATEGORY_ICONS[cat] || LuBookOpen;
                  const catHistory = getHistoryForCategory(cat);
                  const bestScore = catHistory.length > 0 ? Math.max(...catHistory.map((h) => h.verificationScore)) : null;
                  return (
                    <button key={cat} onClick={() => startVerification(cat)}
                      className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#00C7A7]/40 hover:shadow-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0FDFA] text-[#00A98F] transition group-hover:bg-[#00C7A7] group-hover:text-white">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#101828]">{cat}</h3>
                        <p className="mt-0.5 text-[11px] text-slate-400">5 MCQ questions</p>
                      </div>
                      {bestScore !== null && (
                        <div className="flex items-center gap-1.5 rounded-full bg-[#F0FDFA] px-2.5 py-1 text-[10px] font-bold text-[#008F7A]">
                          <LuCircleCheck size={12} /> Best: {bestScore}%
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-10" />
          </div>
        </main>
      </div>
    </div>
  );
}