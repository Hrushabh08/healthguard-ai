import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Ruler, X, RefreshCw } from "lucide-react";
import { logsAPI, authAPI } from "../../services/api";

// Components
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import HealthSummary from "./HealthSummary";
import RiskScore from "./RiskScore";
import EnvironmentalInsights from "./EnvironmentalInsights";
import MicroGoals from "./MicroGoals";
import AIInsights from "../xai/AIInsights";
import BenchmarkingSection from "./BenchmarkingSection";
import VoiceInput from "../features/VoiceInput";
import FamilyMembers from "../features/FamilyMembers";
import DoctorReadySummary from "../reports/DoctorReadySummary";
import HealthLog from "../healthlog/HealthLog";

function calculateAge(dob) {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

export default function Dashboard() {
  const navigate = useNavigate();

  // App State
  const [nav, setNav] = useState("dashboard");
  const [sidebar, setSidebar] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [showProf, setShowProf] = useState(false);

  // Profile from localStorage
  const [profile, setProfile] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [updateWeight, setUpdateWeight] = useState("");
  const [updateHeight, setUpdateHeight] = useState("");

  // Load profile & auto-update age from DOB
  useEffect(() => {
    const raw = localStorage.getItem("hg_profile");
    if (raw) {
      const p = JSON.parse(raw);
      // Auto-update age from DOB
      if (p.dob) {
        p.age = calculateAge(p.dob);
      }
      setProfile(p);

      // Check if 30+ days since last update → show reminder
      const days = daysSince(p.lastUpdated);
      if (days >= 30) {
        setShowReminder(true);
      }
    }
  }, []);

  // Build USER object from profile
  const USER = profile
    ? {
        name: profile.fullName || "User",
        role: `${profile.age} yrs • ${profile.weight} kg • ${profile.height} cm`,
        avatar: (profile.fullName || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
        email: "user@healthguard.ai",
        plan: "Pro",
      }
    : { name: "Priya Sharma", role: "Software Engineer", avatar: "PS", email: "priya@healthguard.ai", plan: "Pro" };

  const [notifs, setNotifs] = useState([
    { id: 1, text: "Stress spike detected recently.", time: "2m ago", unread: true, color: "var(--color-danger)" },
    { id: 2, text: "Sleep goal missed.", time: "1h ago", unread: true, color: "var(--color-warning)" },
  ]);

  // ── Initialize vitals from today's daily log (unified structure) ──
  const [todayLog, setTodayLog] = useState(null);

  useEffect(() => {
    const loadTodayLog = async () => {
      try {
        const { data } = await logsAPI.getToday();
        if (data.log) setTodayLog(data.log);
      } catch {
        // Fallback: try localStorage
        try {
          const raw = localStorage.getItem("hg_daily_logs");
          if (raw) {
            const logs = JSON.parse(raw);
            const today = new Date().toISOString().slice(0, 10);
            const found = logs.find(l => l.date === today);
            if (found) setTodayLog(found);
          }
        } catch { /* ignore */ }
      }
    };
    loadTodayLog();
  }, [nav]); // Refresh when navigating back to dashboard
  const ls = todayLog?.lifestyle;

  // Vitals State — seeded from today's daily log lifestyle section
  const sleep = ls?.sleep ?? 5.1;
  const stress = (ls?.stress ?? 7) * 10; // 1-10 → 0-100 for score formula
  const activity = ls?.steps ? Number(ls.steps) : 2400;

  // Lifestyle State — seeded from today's daily log
  const water = ls?.waterIntake ?? 1.0;
  const alcohol = ls?.alcohol ?? true;
  const smoking = ls?.smoking ?? true;
  const mealsOnTime = ls ? (ls.breakfast && ls.lunch && ls.dinner) : false;

  // Derived Score
  const baseScore =
    stress * 0.30 +
    Math.max(0, (8 - sleep) / 8) * 100 * 0.25 +
    Math.max(0, (10000 - activity) / 10000) * 100 * 0.15 +
    Math.max(0, (3 - water) / 3) * 100 * 0.10;
  const habitPenalty =
    (alcohol ? 8 : 0) +
    (smoking ? 10 : 0) +
    (!mealsOnTime ? 5 : 0);
  const score = Math.min(100, Math.round(baseScore + habitPenalty));

  const unreadCount = notifs.filter(n => n.unread).length;

  // Handle weight/height update
  const handleUpdateProfile = async () => {
    if (!updateWeight || !updateHeight) return;
    const w = parseFloat(updateWeight);
    const h = parseFloat(updateHeight);
    if (w < 10 || w > 300 || h < 50 || h > 250) return;

    const updated = {
      ...profile,
      weight: w,
      height: h,
      bmi: (w / ((h / 100) ** 2)).toFixed(1),
      age: calculateAge(profile.dob),
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("hg_profile", JSON.stringify(updated));
    setProfile(updated);
    // Sync to DB
    try {
      await authAPI.updateProfile({ weight: w, height: h, dob: profile.dob });
    } catch { /* continue */ }
    setShowUpdateModal(false);
    setShowReminder(false);
    setUpdateWeight("");
    setUpdateHeight("");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <Sidebar nav={nav} setNav={setNav} sidebar={sidebar} setSidebar={setSidebar} navigate={navigate} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar 
          nav={nav} score={score} unreadCount={unreadCount} USER={USER}
          showNotif={showNotif} setShowNotif={setShowNotif} 
          showProf={showProf} setShowProf={setShowProf}
          notifs={notifs} setNotifs={setNotifs}
        />

        <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>

          {/* Monthly Update Reminder Banner */}
          {showReminder && (
            <div className="fade-in" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderRadius: "var(--radius-md)", marginBottom: 20,
              background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
              border: "1px solid #F59E0B40",
              boxShadow: "0 2px 8px rgba(245,158,11,0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", background: "#F59E0B20",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <RefreshCw size={16} color="#D97706" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E" }}>
                    Monthly Update Reminder
                  </div>
                  <div style={{ fontSize: 12, color: "#A16207" }}>
                    It's been {daysSince(profile?.lastUpdated)} days since you last updated your weight & height.
                    {profile?.dob && <span style={{ marginLeft: 8, fontWeight: 600 }}>Current age: {calculateAge(profile.dob)} yrs</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="primary-btn"
                  style={{ padding: "7px 16px", fontSize: 12, background: "#D97706" }}
                  onClick={() => {
                    setUpdateWeight(profile?.weight?.toString() || "");
                    setUpdateHeight(profile?.height?.toString() || "");
                    setShowUpdateModal(true);
                  }}
                >
                  <Scale size={13} /> Update Now
                </button>
                <button
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#A16207", padding: 4
                  }}
                  onClick={() => setShowReminder(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Profile Info Bar (shown on dashboard) */}
          {nav === "dashboard" && profile && (
            <div className="fade-in" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px", borderRadius: "var(--radius-md)", marginBottom: 20,
              background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 14
                }}>
                  {USER.avatar}
                </div>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                    Welcome back, {profile.fullName?.split(" ")[0]}!
                  </span>
                  <div style={{ display: "flex", gap: 16, marginTop: 3 }}>
                    {[
                      { label: "Age", value: `${calculateAge(profile.dob)} yrs` },
                      { label: "Weight", value: `${profile.weight} kg` },
                      { label: "Height", value: `${profile.height} cm` },
                      { label: "BMI", value: profile.bmi },
                    ].map((item, i) => (
                      <span key={i} style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                        <span style={{ fontWeight: 600 }}>{item.label}:</span> {item.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                className="ghost-btn"
                style={{ padding: "6px 14px", fontSize: 12 }}
                onClick={() => {
                  setUpdateWeight(profile.weight?.toString() || "");
                  setUpdateHeight(profile.height?.toString() || "");
                  setShowUpdateModal(true);
                }}
              >
                <Scale size={13} /> Update
              </button>
            </div>
          )}
          
          {/* Dashboard View */}
          {nav === "dashboard" && (
            <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
                <HealthSummary score={score} />
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <EnvironmentalInsights />
                  <BenchmarkingSection userScore={score} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <MicroGoals />
                <VoiceInput />
              </div>
            </div>
          )}

          {/* Health Log View */}
          {nav === "log" && (
            <div className="fade-in">
              <HealthLog />
            </div>
          )}

          {/* Risk Score View */}
          {nav === "risk" && (
            <RiskScore score={score} sleep={sleep} stress={stress} activity={activity} />
          )}


          {/* AI Insights View */}
          {nav === "ai" && (
            <div className="fade-in">
              <AIInsights score={score} sleep={sleep} stress={stress} activity={activity}
                water={water} alcohol={alcohol} smoking={smoking} mealsOnTime={mealsOnTime}
                todayLog={todayLog}
              />
            </div>
          )}

          {/* Members View */}
          {nav === "members" && (
            <div className="fade-in">
              <FamilyMembers />
            </div>
          )}

          {/* Reports View */}
          {nav === "report" && (
            <div className="fade-in" style={{ maxWidth: 640, margin: "0 auto" }}>
              <DoctorReadySummary score={score} sleep={sleep} stress={stress}
                activity={activity} water={water} todayLog={todayLog}
              />
            </div>
          )}

        </main>
      </div>

      {/* Update Weight/Height Modal */}
      {showUpdateModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 999,
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.2s ease"
        }} onClick={() => setShowUpdateModal(false)}>
          <div className="card" style={{
            width: 420, maxWidth: "90vw", padding: 28, position: "relative"
          }} onClick={e => e.stopPropagation()}>
            <button
              style={{
                position: "absolute", top: 16, right: 16, background: "none", border: "none",
                cursor: "pointer", color: "var(--text-muted)", padding: 4
              }}
              onClick={() => setShowUpdateModal(false)}
            >
              <X size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <RefreshCw size={18} color="var(--color-accent)" />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                Update Measurements
              </h3>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 20 }}>
              Keep your weight and height up to date for accurate health tracking.
              {profile?.dob && (
                <span style={{ display: "block", marginTop: 4, fontWeight: 600 }}>
                  🎂 Your current age: {calculateAge(profile.dob)} years (auto-calculated)
                </span>
              )}
            </p>

            {/* Weight */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              <Scale size={12} style={{ marginRight: 4, verticalAlign: "middle" }} /> Weight (kg)
            </label>
            <input
              type="number" value={updateWeight} onChange={e => setUpdateWeight(e.target.value)}
              placeholder="e.g. 65"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)", fontSize: 13, fontFamily: "var(--font-sans)",
                outline: "none", marginBottom: 16, background: "var(--bg-primary)"
              }}
            />

            {/* Height */}
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
              <Ruler size={12} style={{ marginRight: 4, verticalAlign: "middle" }} /> Height (cm)
            </label>
            <input
              type="number" value={updateHeight} onChange={e => setUpdateHeight(e.target.value)}
              placeholder="e.g. 170"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)", fontSize: 13, fontFamily: "var(--font-sans)",
                outline: "none", marginBottom: 20, background: "var(--bg-primary)"
              }}
            />

            {/* BMI Preview */}
            {updateWeight && updateHeight && (
              <div style={{
                padding: "10px 14px", borderRadius: "var(--radius-sm)", marginBottom: 20,
                background: "var(--bg-tertiary)", border: "1px solid var(--border-color)",
                fontSize: 13, color: "var(--text-primary)", fontWeight: 600,
                display: "flex", justifyContent: "space-between"
              }}>
                <span>New BMI:</span>
                <span>{(parseFloat(updateWeight) / ((parseFloat(updateHeight) / 100) ** 2)).toFixed(1)}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="ghost-btn" style={{ flex: 1 }} onClick={() => setShowUpdateModal(false)}>Cancel</button>
              <button
                className="primary-btn"
                style={{ flex: 1, opacity: updateWeight && updateHeight ? 1 : 0.5 }}
                onClick={handleUpdateProfile}
                disabled={!updateWeight || !updateHeight}
              >
                <RefreshCw size={14} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
