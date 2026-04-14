import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Components
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import HealthSummary from "./HealthSummary";
import RiskScore from "./RiskScore";
import EnvironmentalInsights from "./EnvironmentalInsights";
import MicroGoals from "./MicroGoals";
import WhatIfSimulator from "../simulator/WhatIfSimulator";
import ExplainableAI from "../xai/ExplainableAI";
import AIInsights from "../xai/AIInsights";
import BenchmarkingSection from "./BenchmarkingSection";
import VoiceInput from "../features/VoiceInput";
import FamilyNotification from "../features/FamilyNotification";
import DoctorReadySummary from "../reports/DoctorReadySummary";

export default function Dashboard() {
  const navigate = useNavigate();

  // App State
  const [nav, setNav] = useState("dashboard");
  const [sidebar, setSidebar] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [showProf, setShowProf] = useState(false);

  // User Data
  const USER = { name: "Priya Sharma", role: "Software Engineer", avatar: "PS", email: "priya@healthguard.ai", plan: "Pro" };
  const [notifs, setNotifs] = useState([
    { id: 1, text: "Stress spike detected recently.", time: "2m ago", unread: true, color: "var(--color-danger)" },
    { id: 2, text: "Sleep goal missed.", time: "1h ago", unread: true, color: "var(--color-warning)" },
  ]);

  // Vitals State
  const [sleep, setSleep] = useState(5.1);
  const [stress, setStress] = useState(72);
  const [activity, setActivity] = useState(2400);

  // Derived Score (same as original logic)
  const score = Math.min(100, Math.round(
    stress * 0.40 +
    Math.max(0, (8 - sleep) / 8) * 100 * 0.35 +
    Math.max(0, (10000 - activity) / 10000) * 100 * 0.25
  ));

  const unreadCount = notifs.filter(n => n.unread).length;

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

          {/* Risk Score View */}
          {nav === "risk" && (
            <RiskScore score={score} sleep={sleep} stress={stress} activity={activity} />
          )}

          {/* Simulator View */}
          {nav === "whatif" && (
            <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <WhatIfSimulator 
                sleep={sleep} setSleep={setSleep}
                stress={stress} setStress={setStress}
                activity={activity} setActivity={setActivity}
                currentScore={score}
              />
              <ExplainableAI sleep={sleep} stress={stress} activity={activity} />
            </div>
          )}

          {/* AI Insights View */}
          {nav === "ai" && (
            <div className="fade-in">
              <AIInsights score={score} sleep={sleep} stress={stress} activity={activity} />
            </div>
          )}

          {/* Members View */}
          {nav === "members" && (
            <div className="fade-in">
              <FamilyNotification />
            </div>
          )}

          {/* Reports View */}
          {nav === "report" && (
            <div className="fade-in" style={{ maxWidth: 640, margin: "0 auto" }}>
              <DoctorReadySummary score={score} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
