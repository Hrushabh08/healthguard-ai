import React, { useRef, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';

export default function Topbar({ nav, score, unreadCount, USER, showNotif, setShowNotif, showProf, setShowProf, notifs, setNotifs }) {
  const notifRef = useRef(null);
  const profRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profRef.current && !profRef.current.contains(e.target)) setShowProf(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const riskColor = s => s >= 70 ? "var(--color-danger)" : s >= 50 ? "var(--color-warning)" : "var(--color-success)";
  const getNavTitle = () => {
    switch(nav) {
      case "dashboard": return "Dashboard";
      case "risk": return "Risk Score";
      case "whatif": return "What-If Simulator";
      case "ai": return "Explainable AI (XAI)";
      case "members": return "Family & Members";
      case "report": return "Doctor-Ready Reports";
      default: return "Dashboard";
    }
  }

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40, height: 72,
      background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-color)",
      padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>{getNavTitle()}</h1>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Health Score Badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
          borderRadius: "var(--radius-xl)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)"
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: riskColor(score) }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Clinical Score:</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: riskColor(score), fontFamily: "var(--font-mono)" }}>{score}</span>
        </div>

        <div style={{ width: 1, height: 24, background: "var(--border-color)" }} />

        {/* Notifications */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button onClick={() => { setShowNotif(!showNotif); setShowProf(false); }}
            style={{ position: "relative", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)", width: 40, height: 40, borderRadius: "50%", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span style={{ position: "absolute", top: 8, right: 10, width: 8, height: 8, borderRadius: "50%", background: "var(--color-danger)", border: "2px solid #fff" }} />}
          </button>

          {showNotif && (
            <div style={{
              position: "absolute", right: 0, top: 50, width: 340, background: "#fff",
              border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)", zIndex: 100, overflow: "hidden"
            }}>
              <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>Notifications</div>
                <button onClick={() => setNotifs(p => p.map(n => ({...n, unread: false})))} style={{ fontSize: 11, color: "var(--color-accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Mark all read</button>
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {notifs.map(n => (
                  <div key={n.id} onClick={() => setNotifs(p => p.map(x => x.id === n.id ? {...x, unread: false} : x))}
                    style={{ padding: "16px", borderBottom: "1px solid var(--bg-tertiary)", cursor: "pointer", background: n.unread ? "var(--bg-primary)" : "#fff", display: "flex", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: n.unread ? 600 : 400, lineHeight: 1.4 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={{ position: "relative" }} ref={profRef}>
          <div onClick={() => { setShowProf(!showProf); setShowNotif(false); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", borderRadius: "999px", background: "transparent", cursor: "pointer", border: "1px solid transparent", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>{USER.avatar}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{USER.name.split(" ")[0]}</span>
            <ChevronDown size={14} color="var(--text-secondary)" />
          </div>
          
          {showProf && (
            <div style={{
              position: "absolute", right: 0, top: 48, width: 220, background: "#fff",
              border: "1px solid var(--border-color)", borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)", zIndex: 100, padding: 8
            }}>
              <div style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{USER.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{USER.email}</div>
              </div>
              <button style={{ width: "100%", padding: "10px 12px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", borderRadius: "var(--radius-sm)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-tertiary)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>Account Settings</button>
              <button style={{ width: "100%", padding: "10px 12px", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--color-danger)", borderRadius: "var(--radius-sm)" }}
                onMouseEnter={e => e.currentTarget.style.background = "#FEE2E2"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>Sign Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
