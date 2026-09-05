import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuBriefcase,
  LuUser,
  LuUsers,
  LuFileText,
  LuCompass,
  LuTarget,
  LuShieldCheck,
  LuShield,
  LuSparkles,
} from "react-icons/lu";

const studentLinks = [
  { label: "Overview", icon: LuLayoutDashboard, to: "/student/dashboard" },
  { label: "My profile", icon: LuUser, to: "/student/profile" },
  { label: "Skill verification", icon: LuShieldCheck, to: "/student/skill-verification" },
  { label: "Job Ready + Roadmap", icon: LuTarget, to: "/student/job-readiness" },
  { label: "Career compass", icon: LuCompass, to: "/student/career-match" },
  { label: "Job matches", icon: LuBriefcase, to: "/student/job-matches" },
];

const recruiterLinks = [
  { label: "Overview", icon: LuLayoutDashboard, to: "/recruiter/dashboard" },
  { label: "Candidates", icon: LuUsers, to: "/recruiter/candidates" },
  { label: "Job postings", icon: LuFileText, to: "/recruiter/jobs" },
];

const adminLinks = [
  { label: "Overview", icon: LuLayoutDashboard, to: "/admin/dashboard" },
  { label: "Users", icon: LuUsers, to: "/admin/users" },
  { label: "Job postings", icon: LuFileText, to: "/admin/jobs" },
];

const roleMeta = {
  student: { label: "Student account", accent: "#D4A84F", soft: "#FFFBEA" },
  recruiter: { label: "Recruiter account", accent: "#6366F1", soft: "#EEF2FF" },
  admin: { label: "Admin account", accent: "#EF4444", soft: "#FEE2E2" },
};

export default function Sidebar({ role }) {
  const links = role === "admin" ? adminLinks : role === "recruiter" ? recruiterLinks : studentLinks;
  const meta = roleMeta[role] || roleMeta.student;

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "22px 18px 20px",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}CC)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: `0 2px 8px ${meta.accent}30`,
          }}
        >
          <LuSparkles size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#101828", letterSpacing: "-0.01em" }}>
            SkillBridge
          </div>
          <div style={{ fontWeight: 600, fontSize: 10, color: meta.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            AI Platform
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "18px 18px 8px" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#94A3B8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Navigation
        </span>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px", flex: 1 }}>
        {links.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "10px 12px",
              borderRadius: 10,
              textDecoration: "none",
              background: isActive ? meta.soft : "transparent",
              color: isActive ? meta.accent : "#64748B",
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              transition: "all 0.15s ease",
              position: "relative",
              borderLeft: isActive ? `3px solid ${meta.accent}` : "3px solid transparent",
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains("active-link")) {
                e.currentTarget.style.background = "#F8FAFC";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains("active-link")) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <link.icon size={17} style={{ flexShrink: 0 }} />
            <span style={{ lineHeight: 1.2 }}>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Role badge */}
      <div style={{ padding: "16px 18px 20px", borderTop: "1px solid var(--color-border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 10,
            background: meta.soft,
            border: `1px solid ${meta.accent}20`,
          }}
        >
          <LuShield size={14} color={meta.accent} />
          <span style={{ fontSize: 11, fontWeight: 700, color: meta.accent }}>
            {meta.label}
          </span>
        </div>
      </div>
    </aside>
  );
}
