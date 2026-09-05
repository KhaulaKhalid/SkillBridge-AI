// export default function AuthLayout({ children }) {
//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       <div
//         style={{
//           flex: "0 0 42%",
//           background: "linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
//           color: "#fff",
//           padding: "56px 48px",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//         }}
//         className="auth-brand-panel"
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--color-student)" }} />
//           <span style={{ fontWeight: 700, fontSize: 16 }}>SkillBridge AI</span>
//         </div>

//         <div>
//           <h1 style={{ fontSize: 34, lineHeight: 1.25, fontWeight: 700, maxWidth: 380, margin: "0 0 20px" }}>
//             Where talent finds its next opportunity.
//           </h1>
//           <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
//             {[
//               "Students showcase skills and get matched to real roles",
//               "Recruiters find candidates faster with less noise",
//               "One account, one dashboard, built for your role",
//             ].map((line) => (
//               <li key={line} style={{ display: "flex", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
//                 <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-student)", marginTop: 7, flexShrink: 0 }} />
//                 {line}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0 }}>
//           © {new Date().getFullYear()} SkillBridge AI
//         </p>
//       </div>

//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "40px 24px",
//           background: "var(--color-bg)",
//         }}
//       >
//         <div style={{ width: "100%", maxWidth: 380 }}>{children}</div>
//       </div>
//     </div>
//   );
// }

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#172033]">

      {/* Header */}
      <header className="h-[76px] border-b border-[#E7E2D8] bg-[#F8F7F3]/95">
        <div className="max-w-7xl mx-auto h-full px-6 lg:px-10 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D9A943] flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                S
              </span>
            </div>

            <div className="text-lg font-bold tracking-tight text-[#172033]">
              SkillBridge <span className="text-[#D9A943]">AI</span>
            </div>
          </div>

          {/* Back */}
          <a
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-[#172033] transition-colors no-underline"
          >
            ← Back to home
          </a>

        </div>
      </header>


      {/* Main */}
      <main className="min-h-[calc(100vh-76px)] flex items-center justify-center px-5 py-12">

        <div className="w-full max-w-[430px]">

          {children}

        </div>

      </main>

    </div>
  );
}