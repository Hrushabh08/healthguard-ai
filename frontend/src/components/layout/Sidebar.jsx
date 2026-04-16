import React from 'react';
import { 
  Home, Activity, Brain, Users, FileText, 
  LogOut, Shield, ClipboardPlus, Settings
} from 'lucide-react';

export default function Sidebar({ nav, setNav, sidebar, setSidebar, navigate, isGuest }) {
  const NAV_ITEMS = [
    { id: "dashboard", icon: <Home size={18} />,           label: "Dashboard" },
    { id: "log",       icon: <ClipboardPlus size={18} />,  label: "Daily Log" },
    { id: "risk",      icon: <Activity size={18} />,       label: "Risk Score" },
    { id: "ai",        icon: <Brain size={18} />,          label: "AI Insights" },
    { id: "members",   icon: <Users size={18} />,          label: "Members" },
    { id: "report",    icon: <FileText size={18} />,       label: "Reports" },
  ];

  return (
    <div style={{
      width: sidebar ? 240 : 70, flexShrink: 0,
      height: "100vh", position: "sticky", top: 0, zIndex: 50,
      background: "var(--bg-secondary)", borderRight: "1px solid var(--border-color)",
      display: "flex", flexDirection: "column",
      transition: "width 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      overflow: "hidden"
    }}>
      {/* Logo */}
      <div 
        onClick={() => setSidebar(!sidebar)}
        style={{ padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: sidebar ? "space-between" : "center", borderBottom: "1px solid var(--border-color)", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
            <Shield size={18} />
          </div>
          {sidebar && (
            <div style={{ animation: "fadeIn 0.2s ease", whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>HealthGuard</div>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Clinical AI</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "20px 12px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = nav === item.id;
          return (
            <div key={item.id}
              onClick={() => setNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                borderRadius: "var(--radius-sm)", cursor: "pointer",
                justifyContent: sidebar ? "flex-start" : "center",
                background: isActive ? "var(--bg-tertiary)" : "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                transition: "all 0.15s"
              }}
              onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.color = "var(--text-primary)" }}
              onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.color = "var(--text-secondary)" }}
              title={!sidebar ? item.label : ""}
            >
              <span style={{ color: isActive ? "var(--color-accent)" : "inherit" }}>
                {item.icon}
              </span>
              {sidebar && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      {/* Settings / Logout */}
      {!isGuest && (
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: 4 }}>
          <div onClick={() => setNav("settings")}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              borderRadius: "var(--radius-sm)", cursor: "pointer", 
              justifyContent: sidebar ? "flex-start" : "center",
              background: nav === "settings" ? "var(--bg-tertiary)" : "transparent",
              color: nav === "settings" ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: nav === "settings" ? 600 : 500, fontSize: 13, transition: "all 0.15s"
            }}
            onMouseEnter={(e) => { if (nav !== "settings") e.currentTarget.style.color = "var(--text-primary)"; }}
            onMouseLeave={(e) => { if (nav !== "settings") e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <span style={{ color: nav === "settings" ? "var(--color-accent)" : "inherit" }}>
              <Settings size={18} />
            </span>
            {sidebar && <span>Settings</span>}
          </div>

          <div onClick={() => {
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('hg_')) localStorage.removeItem(key);
              });
              window.location.href = "/";
            }}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              borderRadius: "var(--radius-sm)", cursor: "pointer", color: "var(--color-danger)",
              justifyContent: sidebar ? "flex-start" : "center", fontSize: 13, fontWeight: 500
            }}>
            <LogOut size={18} />
            {sidebar && <span>Sign Out</span>}
          </div>
        </div>
      )}
    </div>
  );
}
