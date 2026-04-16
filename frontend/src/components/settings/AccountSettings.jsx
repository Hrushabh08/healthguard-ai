import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Download, Trash2, Save, Lock } from 'lucide-react';
import { authAPI, logsAPI } from '../../services/api';

export default function AccountSettings({ profile, updateProfileSettings, isGuest, navigate }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    dailyReminder: true,
    medicationReminder: false,
    riskAlerts: true,
  });

  const [confirmClear, setConfirmClear] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    weight: "",
    height: "",
    dob: ""
  });

  useEffect(() => {
    // Load settings from local storage
    try {
      const stored = localStorage.getItem("hg_settings");
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch { /* ignore */ }

    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        weight: profile.weight || "",
        height: profile.height || "",
        dob: profile.dob ? profile.dob.split("T")[0] : ""
      });
    }
  }, [profile]);

  const handleSettingsToggle = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    localStorage.setItem("hg_settings", JSON.stringify(next));
  };

  const handleProfileSave = async () => {
    if (updateProfileSettings) {
      await updateProfileSettings(formData);
    }
  };

  const handleClearHistory = async () => {
    try {
      const { data } = await logsAPI.clearAll();
      if (data.success) {
        setConfirmClear(false);
        alert("Your health history has been permanently cleared.");
        // Refresh or handle UI state update if needed
      }
    } catch (err) {
      console.error("Error clearing history:", err);
      alert("Failed to clear history. Please try again.");
    }
  };

  return (
    <div className="card fade-in" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-color)" }}>
        {[
          { id: "profile", label: "Profile", icon: <User size={16} /> },
          { id: "notifications", label: "Notifications & Reminders", icon: <Bell size={16} /> },
          { id: "data", label: "Data & Privacy", icon: <Shield size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "16px", background: activeTab === tab.id ? "var(--bg-primary)" : "transparent",
              border: "none", borderBottom: activeTab === tab.id ? "2px solid var(--color-accent)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--color-accent)" : "var(--text-secondary)",
              fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 32, minHeight: 400 }}>
        {activeTab === "profile" && (
          <div className="fade-in" style={{ maxWidth: 480 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: "var(--text-primary)" }}>Personal Information</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className={isGuest ? "guest-blurred" : ""}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Full Name</label>
                <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-primary)" }} />
              </div>

              <div style={{ display: "flex", gap: 16 }} className={isGuest ? "guest-blurred" : ""}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Weight (kg)</label>
                  <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-primary)" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Height (cm)</label>
                  <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-primary)" }} />
                </div>
              </div>

              <div className={isGuest ? "guest-blurred" : ""}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Date of Birth</label>
                <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-primary)" }} />
              </div>

              {isGuest ? (
                <div className="guest-overlay-container" style={{ marginTop: 16, alignSelf: "flex-start" }}>
                  <button className="primary-btn" onClick={() => navigate('/login')} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    <Lock size={16} /> Login to Continue
                  </button>
                  <div className="guest-tooltip">Please login to save your settings</div>
                </div>
              ) : (
                <button className="primary-btn" onClick={handleProfileSave} style={{ marginTop: 16, alignSelf: "flex-start", display: "flex", gap: 8 }}>
                  <Save size={16} /> Save Changes
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="fade-in" style={{ maxWidth: 480 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Alerts & Reminders</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Manage how and when HealthGuard AI notifies you.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { id: "dailyReminder", title: "Daily Health Log Reminder", desc: "Get reminded every evening if you haven't logged your health data." },
                { id: "medicationReminder", title: "Medication Reminders", desc: "Receive alerts for scheduled medications." },
                { id: "riskAlerts", title: "Clinical Risk Alerts", desc: "Get notified immediately if your risk score indicates a potential issue." }
              ].map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{item.desc}</div>
                  </div>
                  <div 
                    onClick={() => {
                      if (isGuest) return navigate('/login');
                      handleSettingsToggle(item.id);
                    }}
                    style={{ 
                      width: 44, height: 24, borderRadius: 12, background: settings[item.id] ? "var(--color-success)" : "var(--border-color)",
                      position: "relative", cursor: "pointer", transition: "all 0.2s", flexShrink: 0, marginTop: 4,
                      opacity: isGuest ? 0.6 : 1
                    }}
                  >
                    <div style={{ 
                      width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, 
                      left: settings[item.id] ? 22 : 2, transition: "all 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" 
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="fade-in" style={{ maxWidth: 480 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Data & Privacy</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>Control your personal health data.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <button className="ghost-btn" style={{ 
                justifyContent: "flex-start", padding: "16px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)" 
              }}>
                <Download size={18} style={{ marginRight: 12, color: "var(--color-accent)" }} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Export Data</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>Download a copy of your health logs and reports.</div>
                </div>
              </button>

              <div style={{ padding: "16px", border: "1px solid #FECACA", background: "#FEF2F2", borderRadius: "var(--radius-sm)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                  <Trash2 size={18} style={{ marginRight: 12, color: "var(--color-danger)", marginTop: 2 }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-danger)" }}>Clear Account History</div>
                    <div style={{ fontSize: 12, color: "#991B1B", marginTop: 2 }}>
                      Permanently delete all your health logs from our database. This action is lifetime and cannot be undone.
                    </div>
                  </div>
                </div>
                
                {confirmClear ? (
                  <div className="fade-in" style={{ display: "flex", gap: 8 }}>
                    <button 
                      onClick={handleClearHistory}
                      className="primary-btn" 
                      style={{ background: "var(--color-danger)", padding: "6px 16px", fontSize: 12, flex: 1 }}
                    >
                      Yes, Clear Everything
                    </button>
                    <button 
                      onClick={() => setConfirmClear(false)}
                      className="ghost-btn" 
                      style={{ padding: "6px 16px", fontSize: 12, flex: 1, border: "1px solid var(--border-color)" }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      if (isGuest) return navigate('/login');
                      setConfirmClear(true);
                    }}
                    style={{ 
                      width: "100%", padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-danger)",
                      background: "transparent", color: "var(--color-danger)", fontWeight: 600, fontSize: 12, cursor: "pointer"
                    }}
                  >
                    Clear History
                  </button>
                )}
              </div>

              <button className="ghost-btn" onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }} style={{ 
                justifyContent: "flex-start", padding: "12px", border: "1px solid var(--border-color)", background: "transparent"
              }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Sign out & Clear Browser Cache</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
