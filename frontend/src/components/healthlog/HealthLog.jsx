import React, { useState, useEffect } from "react";
import {
  Heart, Moon, Footprints, Droplets, Save, Check, Lock,
  ChevronDown, Clock, Edit3, Activity, Cigarette,
  Wine, UtensilsCrossed, Pill, Thermometer, Wind,
  Coffee, Stethoscope, ChevronUp
} from "lucide-react";
import { logsAPI } from "../../services/api";
import "./HealthLog.css";

// ── Constants ──────────────────────────────────────────
const COMMON_SYMPTOMS = [
  "Headache", "Fatigue", "Nausea", "Dizziness", "Chest Pain",
  "Shortness of Breath", "Back Pain", "Fever", "Cough",
  "Joint Pain", "Anxiety", "Insomnia", "Blurred Vision", "Palpitations"
];

const MOOD_OPTIONS = [
  { id: "happy", label: "Happy" },
  { id: "neutral", label: "Neutral" },
  { id: "stressed", label: "Stressed" },
  { id: "low", label: "Low" },
  { id: "anxious", label: "Anxious" },
];

const STORAGE_KEY = "hg_daily_logs";

// ── Helpers ────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function getRange(value, low, high) {
  if (!value && value !== 0) return "";
  const v = parseFloat(value);
  if (isNaN(v)) return "";
  if (v >= low && v <= high) return "range-normal";
  if (v < low * 0.85 || v > high * 1.15) return "range-danger";
  return "range-warning";
}

function emptyLog() {
  return {
    date: todayStr(),
    vitals: { heartRate: "", bpSys: "", bpDia: "", temperature: "", spo2: "" },
    lifestyle: {
      sleep: 7, stress: 4, steps: "",
      waterIntake: 2.0,
      breakfast: false, lunch: false, dinner: false,
      smoking: false, alcohol: false
    },
    notes: {
      mood: "neutral", medicines: "", symptoms: [],
      bloodSugar: "", caffeine: ""
    },
  };
}

// Risk score calculation (same formula as Dashboard)
function calcScore(ls) {
  if (!ls) return 50; // default score if no lifestyle data
  const sleep = ls.sleep || 0;
  const stress = (ls.stress || 0) * 10; // 1-10 → 0-100
  const activity = ls.steps ? Number(ls.steps) : 0;
  const water = ls.waterIntake || 0;

  const base =
    stress * 0.30 +
    Math.max(0, (8 - sleep) / 8) * 100 * 0.25 +
    Math.max(0, (10000 - activity) / 10000) * 100 * 0.15 +
    Math.max(0, (3 - water) / 3) * 100 * 0.10;

  const penalty =
    (ls.alcohol ? 8 : 0) +
    (ls.smoking ? 10 : 0) +
    (!(ls.breakfast && ls.lunch && ls.dinner) ? 5 : 0);

  return Math.min(100, Math.round(base + penalty));
}

function scoreColor(s) {
  return s >= 70 ? "var(--color-danger)" : s >= 50 ? "var(--color-warning)" : "var(--color-success)";
}

function scoreLabel(s) {
  return s >= 70 ? "High Risk" : s >= 50 ? "Moderate" : "Healthy";
}

// ── Component ──────────────────────────────────────────
export default function HealthLog({ isGuest, navigate }) {
  const [log, setLog] = useState(emptyLog());
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [allLogs, setAllLogs] = useState([]);

  // Migrate old format entry → new format
  const migrateEntry = (entry) => {
    // Already in new format
    if (entry.lifestyle) return entry;
    // Convert old 8-tab format → unified 3-section
    const e = emptyLog();
    e.date = entry.date || todayStr();
    if (entry.vitals) e.vitals = { ...e.vitals, ...entry.vitals };
    // Old format had separate sections for sleep, diet, activity, mental, special
    e.lifestyle = {
      sleep: entry.sleep?.totalHours ?? 7,
      stress: entry.mental?.stressLevel ?? 4,
      steps: entry.activity?.steps || "",
      waterIntake: entry.diet?.waterIntake ?? 2.0,
      breakfast: entry.diet?.breakfast || false,
      lunch: entry.diet?.lunch || false,
      dinner: entry.diet?.dinner || false,
      smoking: false,
      alcohol: entry.special?.alcoholDrinks ? Number(entry.special.alcoholDrinks) > 0 : false,
    };
    e.notes = {
      mood: entry.mental?.mood || "neutral",
      medicines: entry.meds?.medicines || "",
      symptoms: entry.meds?.symptoms || [],
      bloodSugar: entry.special?.bloodSugar || "",
      caffeine: entry.special?.caffeine || "",
    };
    return e;
  };

  // Load today's log + history from API
  useEffect(() => {
    if (isGuest) return;
    const loadData = async () => {
      try {
        const [todayRes, allRes] = await Promise.all([
          logsAPI.getToday(),
          logsAPI.getAll()
        ]);
        if (allRes.data.logs) setAllLogs(allRes.data.logs);
        if (todayRes.data.log) setLog(todayRes.data.log);
      } catch {
         // Rely on API only. Do not load legacy local testing data.
      }
    };
    loadData();
  }, []);

  // Live risk score
  const liveScore = calcScore(log.lifestyle);

  // ── Updaters ───────────────────────
  const upd = (section, field, value) => {
    setLog(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
    setSaved(false);
  };

  const toggleSymptom = (symptom) => {
    setLog(prev => {
      const syms = prev.notes.symptoms.includes(symptom)
        ? prev.notes.symptoms.filter(s => s !== symptom)
        : [...prev.notes.symptoms, symptom];
      return { ...prev, notes: { ...prev.notes, symptoms: syms } };
    });
    setSaved(false);
  };

  // Section fill check
  const vitalsFilled = !!(log.vitals.heartRate || log.vitals.bpSys || log.vitals.spo2 || log.vitals.temperature);
  const lifestyleFilled = log.lifestyle.sleep !== 7 || log.lifestyle.stress !== 4 || !!log.lifestyle.steps || log.lifestyle.breakfast || log.lifestyle.lunch || log.lifestyle.dinner;
  const notesFilled = log.notes.mood !== "neutral" || !!log.notes.medicines || log.notes.symptoms.length > 0 || !!log.notes.bloodSugar;
  const filledCount = [vitalsFilled, lifestyleFilled, notesFilled].filter(Boolean).length;

  // ── Save ───────────────────────────
  const handleSave = async () => {
    const updatedLog = { ...log, date: log.date || todayStr() };
    try {
      // Save to database
      await logsAPI.save({
        date: updatedLog.date,
        vitals: updatedLog.vitals,
        lifestyle: updatedLog.lifestyle,
        notes: updatedLog.notes,
      });
      // Refresh history from DB
      const { data } = await logsAPI.getAll();
      if (data.logs) setAllLogs(data.logs);
    } catch {
      // Fallback: save to localStorage
      let logs = [...allLogs];
      const idx = logs.findIndex(l => l.date === updatedLog.date);
      if (idx >= 0) logs[idx] = updatedLog;
      else logs.unshift(updatedLog);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      setAllLogs(logs);
    }
    setSaved(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load historical entry
  const loadEntry = (entry) => {
    setLog(entry);
    setShowHistory(false);
    setSaved(false);
  };

  // Stress slider color
  const stressColor = (v) => v <= 3 ? "var(--color-success)" : v <= 6 ? "var(--color-warning)" : "var(--color-danger)";

  // Previous logs (excluding today), sorted by date descending
  const previousLogs = [...allLogs]
    .filter(l => l.date !== todayStr())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="fade-in">

      {/* ═══ HEADER WITH LIVE SCORE ═══ */}
      <div className="dl-header">
        <div className="dl-header-left">
          <div className="dl-header-icon">
            <Edit3 size={18} />
          </div>
          <div>
            <h2 className="dl-title">Daily Health Log</h2>
            <p className="dl-subtitle">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              {log.date !== todayStr() && (
                <span className="dl-editing-badge">
                  Editing: {new Date(log.date + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="dl-header-right">
          <div className="dl-sections-badge">
            {filledCount}/3 sections
          </div>
          <div className="dl-score-card">
            <div className="dl-score-label">Live Risk Score</div>
            <div className="dl-score-value" style={{ color: scoreColor((isGuest || filledCount === 0) ? 0 : liveScore) }}>
              {(isGuest || filledCount === 0) ? 0 : liveScore}
            </div>
            <div className="dl-score-status" style={{ background: scoreColor((isGuest || filledCount === 0) ? 0 : liveScore) + "18", color: scoreColor((isGuest || filledCount === 0) ? 0 : liveScore) }}>
              {filledCount === 0 ? "New Session" : scoreLabel(liveScore)}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 1: VITALS ═══ */}
      <div className="dl-section card">
        <div className="dl-section-head">
          <div className="dl-section-icon" style={{ background: "#EF444418", color: "var(--color-danger)" }}>
            <Heart size={18} />
          </div>
          <div>
            <h3 className="dl-section-title">Vitals</h3>
            <p className="dl-section-desc">Core medical parameters with normal-range indicators</p>
          </div>
          {vitalsFilled && <span className="dl-filled-dot" />}
        </div>

        <div className={`dl-grid dl-grid-2 ${isGuest ? 'guest-blurred' : ''}`}>
          <div className="dl-field">
            <label>Heart Rate <span className="dl-unit">(bpm)</span></label>
            <input
              type="number"
              className={`dl-input ${getRange(log.vitals.heartRate, 60, 100)}`}
              value={log.vitals.heartRate}
              placeholder="72"
              onChange={e => upd("vitals", "heartRate", e.target.value)}
            />
            <span className="dl-hint">
              <span className="dl-hint-dot" style={{ background: "var(--color-success)" }} />
              Normal: 60–100 bpm
            </span>
          </div>

          <div className="dl-field">
            <label>SpO₂ <span className="dl-unit">(%)</span></label>
            <input
              type="number"
              className={`dl-input ${getRange(log.vitals.spo2, 95, 100)}`}
              value={log.vitals.spo2}
              placeholder="98"
              onChange={e => upd("vitals", "spo2", e.target.value)}
            />
            <span className="dl-hint">
              <span className="dl-hint-dot" style={{ background: "var(--color-success)" }} />
              Normal: 95–100%
            </span>
          </div>

          <div className="dl-field">
            <label>Blood Pressure — Systolic <span className="dl-unit">(mmHg)</span></label>
            <input
              type="number"
              className={`dl-input ${getRange(log.vitals.bpSys, 90, 120)}`}
              value={log.vitals.bpSys}
              placeholder="120"
              onChange={e => upd("vitals", "bpSys", e.target.value)}
            />
            <span className="dl-hint">
              <span className="dl-hint-dot" style={{ background: "var(--color-success)" }} />
              Normal: 90–120 mmHg
            </span>
          </div>

          <div className="dl-field">
            <label>Blood Pressure — Diastolic <span className="dl-unit">(mmHg)</span></label>
            <input
              type="number"
              className={`dl-input ${getRange(log.vitals.bpDia, 60, 80)}`}
              value={log.vitals.bpDia}
              placeholder="80"
              onChange={e => upd("vitals", "bpDia", e.target.value)}
            />
            <span className="dl-hint">
              <span className="dl-hint-dot" style={{ background: "var(--color-success)" }} />
              Normal: 60–80 mmHg
            </span>
          </div>

          <div className="dl-field dl-span-full">
            <label>Body Temperature <span className="dl-unit">(°C)</span></label>
            <input
              type="number" step="0.1"
              className={`dl-input ${getRange(log.vitals.temperature, 36.1, 37.2)}`}
              value={log.vitals.temperature}
              placeholder="36.6"
              onChange={e => upd("vitals", "temperature", e.target.value)}
            />
            <span className="dl-hint">
              <span className="dl-hint-dot" style={{ background: "var(--color-success)" }} />
              Normal: 36.1–37.2°C
            </span>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 2: DAILY LIFESTYLE ═══ */}
      <div className="dl-section card">
        <div className="dl-section-head">
          <div className="dl-section-icon" style={{ background: "#0284C718", color: "var(--color-accent)" }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 className="dl-section-title">Daily Lifestyle</h3>
            <p className="dl-section-desc">These values directly impact your risk score in real-time</p>
          </div>
          {lifestyleFilled && <span className="dl-filled-dot" />}
        </div>

        {/* Sleep */}
        <div className="dl-field">
          <label>
            <Moon size={14} className="dl-field-icon" />
            Sleep Duration
            <span className="dl-slider-value" style={{
              color: log.lifestyle.sleep < 6 ? "var(--color-danger)" :
                log.lifestyle.sleep < 7 ? "var(--color-warning)" : "var(--color-success)"
            }}>
              {log.lifestyle.sleep}h
            </span>
          </label>
          <div className={isGuest ? 'guest-blurred' : ''}>
            <input
              type="range" min="0" max="14" step="0.5"
              value={log.lifestyle.sleep}
              onChange={e => upd("lifestyle", "sleep", parseFloat(e.target.value))}
            />
          </div>
          <div className="dl-range-labels">
            <span>0h</span><span>7h ideal</span><span>14h</span>
          </div>
        </div>

        {/* Stress */}
        <div className="dl-field">
          <label>
            <Wind size={14} className="dl-field-icon" />
            Stress Level
            <span className="dl-stress-badge" style={{
              background: stressColor(log.lifestyle.stress),
            }}>
              {log.lifestyle.stress}
            </span>
            <span className="dl-unit">/10</span>
          </label>
          <div className={isGuest ? 'guest-blurred' : ''}>
            <input
              type="range" min="1" max="10" step="1"
              value={log.lifestyle.stress}
              onChange={e => upd("lifestyle", "stress", parseInt(e.target.value))}
            />
          </div>
          <div className="dl-range-labels">
            <span>Calm</span><span>Very Stressed</span>
          </div>
        </div>

        {/* Steps */}
        <div className="dl-field">
          <label>
            <Footprints size={14} className="dl-field-icon" />
            Steps
          </label>
          <input
            type="number"
            className={`dl-input ${getRange(log.lifestyle.steps, 5000, 30000)} ${isGuest ? 'guest-blurred' : ''}`}
            value={log.lifestyle.steps}
            placeholder="8000"
            onChange={e => upd("lifestyle", "steps", e.target.value)}
          />
          <span className="dl-hint">
            <span className="dl-hint-dot" style={{ background: "var(--color-success)" }} />
            Goal: 8,000–10,000 steps
          </span>
        </div>

        {/* Water */}
        <div className="dl-field">
          <label>
            <Droplets size={14} className="dl-field-icon" />
            Water Intake
            <span className="dl-slider-value" style={{
              color: log.lifestyle.waterIntake >= 2.5 ? "var(--color-success)" :
                log.lifestyle.waterIntake >= 1.5 ? "var(--color-warning)" : "var(--color-danger)"
            }}>
              {log.lifestyle.waterIntake.toFixed(1)}L
            </span>
          </label>
          <div className={isGuest ? 'guest-blurred' : ''}>
            <input
              type="range" min="0" max="5" step="0.1"
              value={log.lifestyle.waterIntake}
              onChange={e => upd("lifestyle", "waterIntake", parseFloat(e.target.value))}
            />
          </div>
          <div className="dl-range-labels">
            <span>0L</span><span>2.5L ideal</span><span>5L</span>
          </div>
        </div>

        <div className="dl-divider" />

        {/* Meals */}
        <div className="dl-field">
          <label>
            <UtensilsCrossed size={14} className="dl-field-icon" />
            Meals Today
          </label>
          <div className={`dl-grid dl-grid-3 ${isGuest ? 'guest-blurred' : ''}`}>
            {["breakfast", "lunch", "dinner"].map(meal => (
              <div
                key={meal}
                className={`dl-check-row ${log.lifestyle[meal] ? "checked" : ""}`}
                onClick={() => upd("lifestyle", meal, !log.lifestyle[meal])}
              >
                <input type="checkbox" checked={log.lifestyle[meal]} readOnly />
                <span style={{ textTransform: "capitalize" }}>{meal}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dl-divider" />

        {/* Habits toggles */}
        <div className={`dl-habits-row ${isGuest ? 'guest-blurred' : ''}`}>
          <div className="toggle-row">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div className="toggle-icon" style={{
                background: !log.lifestyle.smoking ? "rgba(16,185,129,0.08)" : "var(--bg-tertiary)"
              }}>
                <Cigarette size={16} color={!log.lifestyle.smoking ? "var(--color-success)" : "var(--text-muted)"} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>No Smoking</span>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Smoke-free today</span>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={!log.lifestyle.smoking}
                onChange={e => upd("lifestyle", "smoking", !e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div className="toggle-icon" style={{
                background: !log.lifestyle.alcohol ? "rgba(139,92,246,0.08)" : "var(--bg-tertiary)"
              }}>
                <Wine size={16} color={!log.lifestyle.alcohol ? "var(--color-purple)" : "var(--text-muted)"} />
              </div>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>No Alcohol</span>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>No drinks today</span>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={!log.lifestyle.alcohol}
                onChange={e => upd("lifestyle", "alcohol", !e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 3: HEALTH NOTES (collapsible) ═══ */}
      <div className="dl-section card">
        <button className="dl-collapse-head" onClick={() => setShowNotes(!showNotes)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="dl-section-icon" style={{ background: "#8B5CF618", color: "var(--color-purple)" }}>
              <Stethoscope size={18} />
            </div>
            <div style={{ textAlign: "left" }}>
              <h3 className="dl-section-title">Health Notes</h3>
              <p className="dl-section-desc" style={{ marginBottom: 0 }}>Mood, medications, symptoms, and additional markers</p>
            </div>
            {notesFilled && <span className="dl-filled-dot" />}
          </div>
          {showNotes
            ? <ChevronUp size={18} color="var(--text-muted)" />
            : <ChevronDown size={18} color="var(--text-muted)" />
          }
        </button>

        {showNotes && (
          <div className={`dl-notes-body ${isGuest ? 'guest-blurred' : ''}`}>
            {/* Mood */}
            <div className="dl-field">
              <label>Mood</label>
              <select
                className="dl-input dl-select"
                value={log.notes.mood}
                onChange={e => upd("notes", "mood", e.target.value)}
              >
                {MOOD_OPTIONS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Blood Sugar + Caffeine */}
            <div className="dl-grid dl-grid-2">
              <div className="dl-field">
                <label>Blood Sugar <span className="dl-unit">(mg/dL)</span></label>
                <input
                  type="number"
                  className={`dl-input ${getRange(log.notes.bloodSugar, 70, 100)}`}
                  value={log.notes.bloodSugar}
                  placeholder="90"
                  onChange={e => upd("notes", "bloodSugar", e.target.value)}
                />
                <span className="dl-hint">
                  <span className="dl-hint-dot" style={{ background: "var(--color-success)" }} />
                  Fasting: 70–100 mg/dL
                </span>
              </div>
              <div className="dl-field">
                <label>
                  <Coffee size={14} className="dl-field-icon" />
                  Caffeine <span className="dl-unit">(cups)</span>
                </label>
                <input
                  type="number" className="dl-input"
                  value={log.notes.caffeine}
                  placeholder="2"
                  onChange={e => upd("notes", "caffeine", e.target.value)}
                />
              </div>
            </div>

            {/* Medicines */}
            <div className="dl-field">
              <label>
                <Pill size={14} className="dl-field-icon" />
                Medicines Taken
              </label>
              <textarea
                className="dl-input"
                rows={2}
                value={log.notes.medicines}
                placeholder="e.g. Metformin 500mg, Vitamin D3"
                onChange={e => upd("notes", "medicines", e.target.value)}
                style={{ resize: "vertical", minHeight: 60 }}
              />
            </div>

            {/* Symptoms */}
            <div className="dl-field">
              <label>Symptoms</label>
              <div className="dl-tags">
                {COMMON_SYMPTOMS.map(s => (
                  <button
                    key={s}
                    className={`dl-tag ${log.notes.symptoms.includes(s) ? "selected" : ""}`}
                    onClick={() => toggleSymptom(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ SAVE BUTTON ═══ */}
      {isGuest ? (
        <div className="guest-overlay-container" style={{ width: '100%' }}>
          <button
            className="dl-save-btn"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
            onClick={() => navigate('/login')}
          >
            <Lock size={18} /> Login to Continue
          </button>
          <div className="guest-tooltip">Please login to save your health log</div>
        </div>
      ) : (
        <button
          className={`dl-save-btn ${saved ? "saved" : ""}`}
          onClick={handleSave}
        >
          {saved ? (
            <><Check size={18} /> Saved Successfully</>
          ) : (
            <><Save size={18} /> Save Today's Log</>
          )}
        </button>
      )}

      {/* ═══ RECENT ENTRIES ═══ */}
      <div className="dl-divider" />
      <button className="dl-history-toggle" onClick={() => setShowHistory(!showHistory)}>
        <h4>
          <Clock size={16} />
          Previous Logs
          {previousLogs.length > 0 && (
            <span className="badge info" style={{ marginLeft: 6, fontSize: 10, padding: "3px 8px" }}>{previousLogs.length}</span>
          )}
        </h4>
        <ChevronDown size={18} className={`dl-chevron ${showHistory ? "open" : ""}`} />
      </button>

      {showHistory && (
        <div className="dl-history-list">
          {previousLogs.length === 0 ? (
            <div className="dl-history-empty">
              No previous entries yet. Start logging daily!
            </div>
          ) : (
            previousLogs.map(entry => {
              const ls = entry.lifestyle || {};
              return (
                <div
                  key={entry.date}
                  className="dl-history-card"
                  onClick={() => loadEntry(entry)}
                >
                  <div>
                    <div className="dl-hc-date">
                      {new Date(entry.date + "T00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric"
                      })}
                    </div>
                    <div className="dl-hc-sub">Click to load</div>
                  </div>
                  <div className="dl-hc-metrics">
                    {entry.vitals?.heartRate && (
                      <div className="dl-hc-metric">
                        <span className="dl-hcm-val">{entry.vitals.heartRate}</span>
                        <span className="dl-hcm-label">HR</span>
                      </div>
                    )}
                    <div className="dl-hc-metric">
                      <span className="dl-hcm-val">{ls.sleep || 0}h</span>
                      <span className="dl-hcm-label">Sleep</span>
                    </div>
                    {ls.steps && (
                      <div className="dl-hc-metric">
                        <span className="dl-hcm-val">{Number(ls.steps).toLocaleString()}</span>
                        <span className="dl-hcm-label">Steps</span>
                      </div>
                    )}
                    <div className="dl-hc-metric">
                      <span className="dl-hcm-val">{ls.waterIntake?.toFixed(1) || "0"}L</span>
                      <span className="dl-hcm-label">Water</span>
                    </div>
                    <div className="dl-hc-metric">
                      <span className="dl-hcm-val" style={{ color: scoreColor(calcScore(ls)) }}>
                        {calcScore(ls)}
                      </span>
                      <span className="dl-hcm-label">Score</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="dl-toast">
          <Check size={16} />
          Health log saved for {new Date(log.date + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      )}
    </div>
  );
}
