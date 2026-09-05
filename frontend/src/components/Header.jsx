import { LuLogOut } from "react-icons/lu";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header({ title }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: 64,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    >
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.2 }}>
            {user?.email}
          </div>
        </div>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--color-primary-soft)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <button
          onClick={logout}
          title="Log out"
          style={{
            border: "1px solid var(--color-border)",
            background: "transparent",
            borderRadius: "var(--radius-sm)",
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-muted)",
          }}
        >
          <LuLogOut size={16} />
        </button>
      </div>
    </header>
  );
}
